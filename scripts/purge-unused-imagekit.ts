import fs from "node:fs";
import path from "node:path";
import ImageKit from "imagekit";
import { PrismaClient } from "@prisma/client";

// 1. Load environment variables from .env
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
loadEnv();

const prisma = new PrismaClient();
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

interface PurgeCandidate {
  fileId: string;
  name: string;
  filePath: string;
  sizeBytes: number;
  category: string;
}

interface PurgeManifest {
  timestamp: string;
  summary: {
    totalFiles: number;
    totalStorageBytes: number;
    activeWebp: { count: number; bytes: number };
    legacyPng: { count: number; bytes: number };
    orphans: { count: number; bytes: number };
    reclaimableBytes: number;
  };
  purgeCandidates: PurgeCandidate[];
}

interface PurgeResultItem {
  fileId: string;
  name: string;
  filePath: string;
  sizeBytes: number;
  category: string;
  status: "deleted" | "failed" | "skipped";
  error?: string;
  timestamp: string;
}

interface PurgeHistory {
  executedAt: string;
  manifestTimestamp: string;
  totalCandidates: number;
  deletedCount: number;
  failedCount: number;
  skippedCount: number;
  reclaimedBytes: number;
  reclaimedFormatted: string;
  remainingFilesImageKit?: number;
  remainingStorageBytesImageKit?: number;
  remainingStorageFormatted?: string;
  details: PurgeResultItem[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0.00 MB";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 600): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastError;
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log("=======================================================");
  console.log("🧹 ImageKit Unused/Legacy Asset Purge Pipeline");
  console.log(`   Endpoint: ${process.env.IMAGEKIT_URL_ENDPOINT}`);
  console.log("=======================================================\n");

  const manifestPath = path.join(process.cwd(), "purge-manifest-dryrun.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found at ${manifestPath}`);
  }

  const manifest: PurgeManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`📖 Loaded manifest from ${manifest.timestamp}`);
  console.log(`🎯 Purge candidates: ${manifest.purgeCandidates.length} files`);
  console.log(`💾 Estimated reclaimable: ${formatBytes(manifest.summary.reclaimableBytes)}\n`);

  // 1. Safety Double-Check against database
  process.stdout.write("🛡️  Double-checking active product catalog in PostgreSQL...");
  const products = await prisma.product.findMany({
    select: { id: true, title: true, slug: true, imageUrls: true },
  });

  const activeFilenames = new Set<string>();
  for (const prod of products) {
    try {
      const urls: string[] = JSON.parse(prod.imageUrls || "[]");
      for (const rawUrl of urls) {
        const clean = rawUrl.split("#")[0].split("?")[0];
        const basename = path.basename(clean).toLowerCase();
        if (basename) {
          activeFilenames.add(basename);
        }
      }
    } catch {
      // ignore json parse error
    }
  }
  console.log(` Done! (${activeFilenames.size} active product images indexed)\n`);

  const candidatesToPurge: PurgeCandidate[] = [];
  const safetySkipped: PurgeResultItem[] = [];

  for (const c of manifest.purgeCandidates) {
    const nameLower = c.name.toLowerCase();
    const baseName = path.basename(c.filePath || c.name).toLowerCase();

    if (activeFilenames.has(nameLower) || activeFilenames.has(baseName)) {
      console.warn(`⚠️  SAFETY ALERT: "${c.name}" is referenced by an active product! Skipping.`);
      safetySkipped.push({
        fileId: c.fileId,
        name: c.name,
        filePath: c.filePath,
        sizeBytes: c.sizeBytes,
        category: c.category,
        status: "skipped",
        error: "Referenced in active Product.imageUrls",
        timestamp: new Date().toISOString(),
      });
    } else {
      candidatesToPurge.push(c);
    }
  }

  console.log(`✅ Safety Verification Passed: ${candidatesToPurge.length} files approved for purge`);
  if (safetySkipped.length > 0) {
    console.log(`🛡️  Skipped ${safetySkipped.length} files due to active database references.`);
  }
  console.log("");

  // 2. Execute Purge with Concurrency = 3 and retry
  const CONCURRENCY = 3;
  let completedCount = 0;
  let reclaimedBytes = 0;
  const total = candidatesToPurge.length;

  console.log(`🚀 Starting deletion with concurrency: ${CONCURRENCY}...\n`);

  const purgeResults = await runWithConcurrency<PurgeCandidate, PurgeResultItem>(
    candidatesToPurge,
    CONCURRENCY,
    async (item) => {
      try {
        await withRetry(async () => {
          await imagekit.deleteFile(item.fileId);
        }, 3, 600);

        completedCount++;
        reclaimedBytes += item.sizeBytes;
        const pct = Math.round((completedCount / total) * 100);
        console.log(
          `[${String(completedCount).padStart(3)}/${total} ${String(pct).padStart(3)}%] 🗑️  Deleted: ${item.name} (${formatBytes(item.sizeBytes)})`
        );

        return {
          fileId: item.fileId,
          name: item.name,
          filePath: item.filePath,
          sizeBytes: item.sizeBytes,
          category: item.category,
          status: "deleted",
          timestamp: new Date().toISOString(),
        };
      } catch (err: unknown) {
        completedCount++;
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(
          `[${String(completedCount).padStart(3)}/${total}] ❌ Failed to delete ${item.name}: ${errMsg}`
        );

        return {
          fileId: item.fileId,
          name: item.name,
          filePath: item.filePath,
          sizeBytes: item.sizeBytes,
          category: item.category,
          status: "failed",
          error: errMsg,
          timestamp: new Date().toISOString(),
        };
      }
    }
  );

  const allDetails = [...safetySkipped, ...purgeResults];
  const deletedCount = allDetails.filter((d) => d.status === "deleted").length;
  const failedCount = allDetails.filter((d) => d.status === "failed").length;
  const skippedCount = allDetails.filter((d) => d.status === "skipped").length;

  // 3. Query ImageKit for Post-Purge Status
  console.log("\n📡 Querying post-purge inventory from ImageKit...");
  let remainingFilesCount = 0;
  let remainingStorageBytes = 0;
  let skip = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    try {
      const batch = await imagekit.listFiles({ limit, skip });
      if (!Array.isArray(batch) || batch.length === 0) {
        break;
      }
      for (const f of batch) {
        if (f.type === "file") {
          remainingFilesCount++;
          remainingStorageBytes += f.size || 0;
        }
      }
      if (batch.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }
    } catch (err) {
      console.error("Could not fetch remaining files inventory:", err);
      break;
    }
  }

  // 4. Write Purge History
  const history: PurgeHistory = {
    executedAt: new Date().toISOString(),
    manifestTimestamp: manifest.timestamp,
    totalCandidates: manifest.purgeCandidates.length,
    deletedCount,
    failedCount,
    skippedCount,
    reclaimedBytes,
    reclaimedFormatted: formatBytes(reclaimedBytes),
    remainingFilesImageKit: remainingFilesCount,
    remainingStorageBytesImageKit: remainingStorageBytes,
    remainingStorageFormatted: formatBytes(remainingStorageBytes),
    details: allDetails,
  };

  const historyPath = path.join(process.cwd(), "purge-history.json");
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf-8");
  console.log(`📝 Written full audit report to: ${historyPath}\n`);

  // 5. Final Summary Output
  console.log("=======================================================");
  console.log("🎉 PURGE EXECUTION COMPLETE SUMMARY");
  console.log("=======================================================");
  console.log(`✅ Successfully Deleted : ${deletedCount} files`);
  console.log(`❌ Failed Deletions     : ${failedCount} files`);
  console.log(`🛡️  Safety Skipped       : ${skippedCount} files`);
  console.log(`💰 Total Reclaimed Space: ${formatBytes(reclaimedBytes)}`);
  console.log(`📦 Remaining Files in IK: ${remainingFilesCount} files`);
  console.log(`🗄️  Remaining Storage    : ${formatBytes(remainingStorageBytes)}`);
  console.log("=======================================================\n");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Purge aborted due to unexpected error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
