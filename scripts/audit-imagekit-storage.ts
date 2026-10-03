import fs from "node:fs";
import path from "node:path";
import ImageKit from "imagekit";
import { PrismaClient } from "@prisma/client";

// 1. Load environment variables
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

interface FileItem {
  fileId: string;
  name: string;
  filePath: string;
  size: number;
  url: string;
  folder: string;
  extension: string;
}


function formatBytes(bytes: number): string {
  if (bytes === 0) return "0.00 MB";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

async function fetchAllImageKitFiles(): Promise<FileItem[]> {
  const allFiles: FileItem[] = [];
  const limit = 1000;
  let skip = 0;
  let hasMore = true;

  process.stdout.write("📡 Fetching asset catalog from ImageKit API...");

  while (hasMore) {
    const batch = await imagekit.listFiles({
      limit,
      skip,
    });

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    for (const item of batch) {
      if (item.type === "file") {
        const filePath = item.filePath || "/" + item.name;
        const ext = path.extname(item.name).toLowerCase() || "unknown";
        const folder = path.dirname(filePath);

        allFiles.push({
          fileId: item.fileId,
          name: item.name,
          filePath,
          size: item.size || 0,
          url: item.url,
          folder,
          extension: ext,
        });
      }
    }

    if (batch.length < limit) {
      hasMore = false;
    } else {
      skip += limit;
      process.stdout.write(".");
    }
  }

  console.log(` Done! (${allFiles.length} files found)\n`);
  return allFiles;
}

async function main() {
  console.log("=======================================================");
  console.log("📊 ImageKit Complete Storage Audit & Categorization");
  console.log(`   Endpoint: ${process.env.IMAGEKIT_URL_ENDPOINT}`);
  console.log("=======================================================\n");

  // 1. Fetch all files from ImageKit
  const allFiles = await fetchAllImageKitFiles();

  // 2. Query all active URLs from PostgreSQL
  const products = await prisma.product.findMany({
    select: { title: true, slug: true, imageUrls: true },
  });

  const activeFilenames = new Set<string>();
  const activeCleanUrls = new Set<string>();

  for (const prod of products) {
    try {
      const urls: string[] = JSON.parse(prod.imageUrls || "[]");
      for (const rawUrl of urls) {
        const clean = rawUrl.split("#")[0].split("?")[0];
        activeCleanUrls.add(clean);
        activeFilenames.add(path.basename(clean));
      }
    } catch {
      // Ignore parse errors
    }
  }

  // 3. Load migration map if available to identify legacy PNG originals
  const migrationMapPath = path.join(process.cwd(), "migration-map.json");
  const migratedOldBasenames = new Set<string>();
  if (fs.existsSync(migrationMapPath)) {
    try {
      const map = JSON.parse(fs.readFileSync(migrationMapPath, "utf-8"));
      for (const entry of Object.values(map) as Array<{ oldUrl?: string }>) {
        if (entry.oldUrl) {
          const cleanOld = entry.oldUrl.split("#")[0].split("?")[0];
          migratedOldBasenames.add(path.basename(cleanOld));
        }
      }
    } catch {
      // Ignore
    }
  }

  // 4. Categorize files
  const activeWebpFiles: FileItem[] = [];
  const legacyPngFiles: FileItem[] = [];
  const orphanFiles: FileItem[] = [];

  const folderMap = new Map<string, { count: number; bytes: number }>();
  const extMap = new Map<string, { count: number; bytes: number }>();

  let totalStorageBytes = 0;

  for (const file of allFiles) {
    totalStorageBytes += file.size;

    // Folder stats
    const fStats = folderMap.get(file.folder) || { count: 0, bytes: 0 };
    fStats.count++;
    fStats.bytes += file.size;
    folderMap.set(file.folder, fStats);

    // Extension stats
    const eStats = extMap.get(file.extension) || { count: 0, bytes: 0 };
    eStats.count++;
    eStats.bytes += file.size;
    extMap.set(file.extension, eStats);

    // Categorization logic
    const isActivelyLinked = activeFilenames.has(file.name);

    if (isActivelyLinked) {
      activeWebpFiles.push(file);
    } else {
      // Check if it's one of the legacy PNG masters that were replaced by a .webp
      const baseWithoutExt = path.basename(file.name, file.extension);
      const matchingActiveWebp = activeFilenames.has(`${baseWithoutExt}.webp`);
      const inMigrationMap = migratedOldBasenames.has(file.name);

      if (file.extension === ".png" && (matchingActiveWebp || inMigrationMap)) {
        legacyPngFiles.push(file);
      } else {
        orphanFiles.push(file);
      }
    }
  }

  // 5. Output Summary Tables
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│ 1. TOTAL OVERALL STORAGE SUMMARY                            │");
  console.log("├────────────────────────────────────────┬──────────┬─────────┤");
  console.log(
    `│ Total Files in ImageKit Account        │ ${String(allFiles.length).padStart(8)} │         │`
  );
  console.log(
    `│ Total Media Storage Consumed           │ ${formatBytes(totalStorageBytes).padStart(12)} │ 100.0%  │`
  );
  console.log("└────────────────────────────────────────┴──────────┴─────────┘\n");

  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│ 2. STORAGE CATEGORIZATION (ACTIVE vs LEGACY vs ORPHANS)     │");
  console.log("├──────────────────────┬─────────┬──────────────┬─────────────┤");
  console.log("│ Category             │ Files   │ Total Size   │ % of Total  │");
  console.log("├──────────────────────┼─────────┼──────────────┼─────────────┤");

  const activeBytes = activeWebpFiles.reduce((acc, f) => acc + f.size, 0);
  const legacyBytes = legacyPngFiles.reduce((acc, f) => acc + f.size, 0);
  const orphanBytes = orphanFiles.reduce((acc, f) => acc + f.size, 0);

  const pct = (b: number) => ((b / (totalStorageBytes || 1)) * 100).toFixed(1) + "%";

  console.log(
    `│ 🟢 Active Catalog WebP│ ${String(activeWebpFiles.length).padStart(7)} │ ${formatBytes(activeBytes).padStart(12)} │ ${pct(activeBytes).padStart(11)} │`
  );
  console.log(
    `│ 🟡 Legacy Migrated PNG│ ${String(legacyPngFiles.length).padStart(7)} │ ${formatBytes(legacyBytes).padStart(12)} │ ${pct(legacyBytes).padStart(11)} │`
  );
  console.log(
    `│ 🔴 Unlinked / Orphans │ ${String(orphanFiles.length).padStart(7)} │ ${formatBytes(orphanBytes).padStart(12)} │ ${pct(orphanBytes).padStart(11)} │`
  );
  console.log("└──────────────────────┴─────────┴──────────────┴─────────────┘\n");

  // Breakdown by Extension
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│ 3. BREAKDOWN BY FILE EXTENSION                              │");
  console.log("├──────────────┬─────────┬──────────────┬─────────────────────┤");
  console.log("│ Extension    │ Files   │ Storage Used │ % of Total Storage  │");
  console.log("├──────────────┼─────────┼──────────────┼─────────────────────┤");
  const sortedExts = Array.from(extMap.entries()).sort((a, b) => b[1].bytes - a[1].bytes);
  for (const [ext, stats] of sortedExts) {
    console.log(
      `│ ${ext.padEnd(12)} │ ${String(stats.count).padStart(7)} │ ${formatBytes(stats.bytes).padStart(12)} │ ${pct(stats.bytes).padStart(19)} │`
    );
  }
  console.log("└──────────────┴─────────┴──────────────┴─────────────────────┘\n");

  // Breakdown by Folder
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│ 4. BREAKDOWN BY FOLDER PATH                                 │");
  console.log("├──────────────────────┬─────────┬──────────────┬─────────────┤");
  console.log("│ Folder               │ Files   │ Storage Used │ % of Total  │");
  console.log("├──────────────────────┼─────────┼──────────────┼─────────────┤");
  const sortedFolders = Array.from(folderMap.entries()).sort((a, b) => b[1].bytes - a[1].bytes);
  for (const [folder, stats] of sortedFolders) {
    console.log(
      `│ ${folder.padEnd(20)} │ ${String(stats.count).padStart(7)} │ ${formatBytes(stats.bytes).padStart(12)} │ ${pct(stats.bytes).padStart(11)} │`
    );
  }
  console.log("└──────────────────────┴─────────┴──────────────┴─────────────┘\n");

  // Top 10 Largest Files
  const sortedByLargest = [...allFiles].sort((a, b) => b.size - a.size);
  console.log("┌─────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ 5. TOP 10 LARGEST INDIVIDUAL ASSETS IN STORAGE                              │");
  console.log("├─────┬────────────────────────────────────────────┬─────────────┬────────────┤");
  console.log("│ #   │ File Path / Name                           │ Size        │ Status     │");
  console.log("├─────┼────────────────────────────────────────────┼─────────────┼────────────┤");
  sortedByLargest.slice(0, 10).forEach((f, idx) => {
    let status = "🔴 Orphan";
    if (activeFilenames.has(f.name)) status = "🟢 Active";
    else if (legacyPngFiles.some((lp) => lp.fileId === f.fileId)) status = "🟡 Legacy";
    const nameTruncated = f.filePath.length > 42 ? "..." + f.filePath.slice(-39) : f.filePath.padEnd(42);
    console.log(
      `│ ${(idx + 1).toString().padEnd(3)} │ ${nameTruncated} │ ${formatBytes(f.size).padStart(11)} │ ${status.padEnd(10)} │`
    );
  });
  console.log("└─────┴────────────────────────────────────────────┴─────────────┴────────────┘\n");

  // 6. Purge Candidate Summary (Dry-Run Plan)
  const purgeCandidates = [...legacyPngFiles, ...orphanFiles];
  const purgeBytes = purgeCandidates.reduce((acc, f) => acc + f.size, 0);

  console.log("=======================================================");
  console.log("🧹 DRY-RUN CLEANUP SUMMARY (NO FILES DELETED)");
  console.log("=======================================================");
  console.log(`- Active Catalog WebP Files to RETAIN:    ${activeWebpFiles.length} files (${formatBytes(activeBytes)})`);
  console.log(`- Legacy Migrated PNG Files to PURGE:     ${legacyPngFiles.length} files (${formatBytes(legacyBytes)})`);
  console.log(`- Unlinked / Orphan Files to PURGE:       ${orphanFiles.length} files (${formatBytes(orphanBytes)})`);
  console.log("-------------------------------------------------------");
  console.log(`- Total Files Eligible for Safe Cleanup:  ${purgeCandidates.length} files`);
  console.log(`- Storage Reclaimable Immediately:        ${formatBytes(purgeBytes)} (${pct(purgeBytes)} of account quota)`);
  console.log(`- Projected ImageKit Storage After Purge: ${formatBytes(activeBytes)} (Down from ${formatBytes(totalStorageBytes)})`);
  console.log("=======================================================\n");

  // Save detailed manifest to file for safety and review
  const manifestPath = path.join(process.cwd(), "purge-manifest-dryrun.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          totalFiles: allFiles.length,
          totalStorageBytes,
          activeWebp: { count: activeWebpFiles.length, bytes: activeBytes },
          legacyPng: { count: legacyPngFiles.length, bytes: legacyBytes },
          orphans: { count: orphanFiles.length, bytes: orphanBytes },
          reclaimableBytes: purgeBytes,
        },
        purgeCandidates: purgeCandidates.map((f) => ({
          fileId: f.fileId,
          name: f.name,
          filePath: f.filePath,
          sizeBytes: f.size,
          category: legacyPngFiles.some((lp) => lp.fileId === f.fileId) ? "legacy_png" : "orphan",
        })),
      },
      null,
      2
    )
  );
  console.log(`Detailed dry-run manifest saved to: ${manifestPath}\n`);
}

main()
  .catch((e) => {
    console.error("Audit failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
