import fs from "node:fs";
import path from "node:path";
import ImageKit from "imagekit";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

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

export interface MigrationRecord {
  oldUrl: string;
  newUrl: string;
  originalBytes: number;
  compressedBytes: number;
  savingsPercent: number;
  status: "success" | "skipped" | "failed" | "dry-run";
  error?: string;
  timestamp: string;
}

export const MIGRATION_MAP_PATH = path.join(process.cwd(), "migration-map.json");

// 2. Exponential Backoff Retry Helper
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 800): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastError;
}

// 3. Sharp Perceptual Compression
// pony tail: max bounding box 2048x2048 with WebP q=83 smartSubsample balances detail & payload
export async function compressImageBuffer(inputBuffer: Buffer): Promise<Buffer> {
  return await sharp(inputBuffer)
    .rotate() // Auto-orient based on EXIF
    .resize(2048, 2048, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 83,
      effort: 6,
      smartSubsample: true,
    })
    .toBuffer();
}

// 4. Resolve Image Source (Remote HTTP, Cloudinary, or Local disk)
export async function fetchSourceBuffer(rawUrl: string): Promise<Buffer | null> {
  const cleanUrl = rawUrl.split("#")[0].split("?")[0];
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    const fetchUrl =
      cleanUrl.includes("ik.imagekit.io") && !cleanUrl.includes("tr=orig-true")
        ? `${cleanUrl}?tr=orig-true`
        : cleanUrl;
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${cleanUrl}`);
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }

  // Local filesystem fallback
  const relative = cleanUrl.replace(/^\/+/, "");
  const candidates = [
    path.join(process.cwd(), "public", relative),
    path.join(process.cwd(), relative),
    path.join(process.cwd(), "public", "products", path.basename(cleanUrl)),
    path.join(process.cwd(), "public", "uploads", path.basename(cleanUrl)),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return await fs.promises.readFile(c);
    }
  }
  return null;
}

// 5. Main Execution Flow
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const applyDb = args.includes("--apply-db");
  const isRollback = args.includes("--rollback");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

  console.log("\n=======================================================");
  console.log(`🚀 E-Commerce Media Migration & Compression Pipeline`);
  console.log(`   Mode:     ${isDryRun ? "DRY-RUN (Simulating only)" : isRollback ? "ROLLBACK" : "LIVE"}`);
  console.log(`   Apply DB: ${applyDb}`);
  console.log(`   Limit:    ${limit === Infinity ? "All" : limit}`);
  console.log("=======================================================\n");

  const migrationMap: Record<string, MigrationRecord> = fs.existsSync(MIGRATION_MAP_PATH)
    ? JSON.parse(fs.readFileSync(MIGRATION_MAP_PATH, "utf-8"))
    : {};

  const products = await prisma.product.findMany();

  // Handle Rollback
  if (isRollback) {
    console.log("⏪ Rolling back database URLs using migration-map.json...");
    let rollbackCount = 0;
    for (const prod of products) {
      let urls: string[] = [];
      try {
        urls = JSON.parse(prod.imageUrls || "[]");
      } catch {
        continue;
      }

      let modified = false;
      const revertedUrls = urls.map((u) => {
        // find if u is newUrl in migrationMap
        const entry = Object.values(migrationMap).find((m) => m.newUrl === u && m.status === "success");
        if (entry) {
          modified = true;
          return entry.oldUrl;
        }
        return u;
      });

      if (modified) {
        await prisma.product.update({
          where: { id: prod.id },
          data: { imageUrls: JSON.stringify(revertedUrls) },
        });
        rollbackCount++;
      }
    }
    console.log(`✅ Rollback complete: Reverted ${rollbackCount} products.\n`);
    return;
  }

  // Identify assets to process
  const allUrlsToProcess: Array<{ productId: string; oldUrl: string }> = [];
  for (const prod of products) {
    try {
      const urls: string[] = JSON.parse(prod.imageUrls || "[]");
      for (const u of urls) {
        const clean = u.split("#")[0].split("?")[0];
        const isWebp = clean.toLowerCase().endsWith(".webp");
        if (!isWebp) {
          allUrlsToProcess.push({ productId: prod.id, oldUrl: u });
        }
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  // If database images are already migrated or --scan-local is requested, include local catalog images
  if (allUrlsToProcess.length === 0 || args.includes("--scan-local")) {
    const productsDir = path.join(process.cwd(), "public", "products");
    if (fs.existsSync(productsDir)) {
      const files = fs.readdirSync(productsDir);
      for (const f of files) {
        if ([".jpg", ".jpeg", ".png"].includes(path.extname(f).toLowerCase())) {
          allUrlsToProcess.push({ productId: "local-catalog", oldUrl: `/products/${f}` });
        }
      }
    }
  }

  const items = allUrlsToProcess.slice(0, limit);
  console.log(`Found ${items.length} uncompressed/non-WebP assets to process.\n`);

  let processedCount = 0;
  let totalOriginalBytes = 0;
  let totalCompressedBytes = 0;

  for (const item of items) {
    processedCount++;
    const progress = `[${processedCount}/${items.length}]`;
    const cleanUrl = item.oldUrl.split("#")[0].split("?")[0];
    const baseName = path.basename(cleanUrl).replace(/\.[^/.]+$/, "") + ".webp";

    if (!isDryRun && migrationMap[item.oldUrl]?.status === "success") {
      console.log(`${progress} ↪ Skipped (already migrated): ${baseName}`);
      continue;
    }

    try {
      const rawBuffer = await withRetry(() => fetchSourceBuffer(item.oldUrl));
      if (!rawBuffer) {
        console.warn(`${progress} ⚠️ Source file not found: ${item.oldUrl}`);
        continue;
      }

      const originalSize = rawBuffer.byteLength;
      const compressedBuffer = await compressImageBuffer(rawBuffer);
      const compressedSize = compressedBuffer.byteLength;
      const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

      totalOriginalBytes += originalSize;
      totalCompressedBytes += compressedSize;

      const hashIndex = item.oldUrl.indexOf("#");
      const hashFragment = hashIndex !== -1 ? item.oldUrl.substring(hashIndex) : "";

      let finalUrl = item.oldUrl;
      if (!isDryRun) {
        // Upload compressed asset to ImageKit
        const uploadResult = await withRetry(() =>
          imagekit.upload({
            file: compressedBuffer,
            fileName: baseName,
            folder: "/products",
            useUniqueFileName: false,
          })
        );
        finalUrl = uploadResult.url.split("?")[0] + hashFragment;
      } else {
        const targetHost = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/unhinged";
        finalUrl = `${targetHost.replace(/\/+$/, "")}/products/${baseName}${hashFragment}`;
      }

      migrationMap[item.oldUrl] = {
        oldUrl: item.oldUrl,
        newUrl: finalUrl,
        originalBytes: originalSize,
        compressedBytes: compressedSize,
        savingsPercent: parseFloat(savings),
        status: isDryRun ? "dry-run" : "success",
        timestamp: new Date().toISOString(),
      };

      console.log(
        `${progress} ✅ ${baseName}: ${(originalSize / 1024).toFixed(0)}KB ➔ ${(compressedSize / 1024).toFixed(0)}KB (-${savings}%)`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${progress} ❌ Failed: ${baseName} - ${msg}`);
      migrationMap[item.oldUrl] = {
        oldUrl: item.oldUrl,
        newUrl: item.oldUrl,
        originalBytes: 0,
        compressedBytes: 0,
        savingsPercent: 0,
        status: "failed",
        error: msg,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Save audit log
  fs.writeFileSync(MIGRATION_MAP_PATH, JSON.stringify(migrationMap, null, 2));

  // Apply to DB if requested
  if (applyDb && !isDryRun) {
    console.log("\n📦 Committing URL updates to PostgreSQL Database...");
    let updatedProducts = 0;

    for (const prod of products) {
      let urls: string[] = [];
      try {
        urls = JSON.parse(prod.imageUrls || "[]");
      } catch {
        continue;
      }

      let modified = false;
      const newUrls = urls.map((u) => {
        if (migrationMap[u]?.status === "success") {
          modified = true;
          return migrationMap[u].newUrl;
        }
        return u;
      });

      if (modified) {
        await prisma.product.update({
          where: { id: prod.id },
          data: { imageUrls: JSON.stringify(newUrls) },
        });
        updatedProducts++;
      }
    }
    console.log(`✅ Updated ${updatedProducts} products in database.`);
  }

  const overallSavings =
    totalOriginalBytes > 0
      ? (((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100).toFixed(1)
      : "0";

  console.log("\n=======================================================");
  console.log("🏁 Migration Batch Complete!");
  console.log(`- Original Total:   ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Compressed Total: ${(totalCompressedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Bandwidth Saved:  ${overallSavings}%`);
  console.log(`- Journal Path:     ${MIGRATION_MAP_PATH}`);
  console.log("=======================================================\n");
}

if (require.main === module || process.argv[1]?.endsWith("media-migration-pipeline.ts")) {
  main()
    .catch((e) => {
      console.error("Migration fatal error:", e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
