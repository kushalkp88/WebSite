import fs from "node:fs";
import path from "node:path";
import ImageKit from "imagekit";
import { PrismaClient } from "@prisma/client";

// 1. Load environment variables from .env if not already present
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
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const requiredEnvVars = [
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
  "DATABASE_URL",
];

const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error("❌ Error: Missing required environment variables in .env:");
  for (const m of missing) {
    console.error(`   - ${m}`);
  }
  console.error("\nPlease update your .env file with the ImageKit credentials and rerun this script.");
  process.exit(1);
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const prisma = new PrismaClient();

// Cache filename -> ImageKit base URL
const uploadedMap = new Map<string, string>();

async function findOrUploadToImageKit(
  localFilePath: string,
  targetFileName: string
): Promise<string> {
  if (uploadedMap.has(targetFileName)) {
    return uploadedMap.get(targetFileName)!;
  }

  // 1. Check if the file already exists in ImageKit /products folder
  try {
    const existing = await imagekit.listFiles({
      name: targetFileName,
      path: "/products",
    });

    if (Array.isArray(existing) && existing.length > 0) {
      const match = existing.find(
        (f) => f.type === "file" && f.name === targetFileName
      ) || existing.find((f) => f.type === "file");
      if (match && "url" in match && typeof match.url === "string") {
        const clean = match.url.split("?")[0];
        uploadedMap.set(targetFileName, clean);
        console.log(`  ↪ Already in ImageKit: ${targetFileName}`);
        return clean;
      }
    }
  } catch (checkErr) {
    // If listFiles fails, proceed to try upload
  }

  // 2. Upload file to ImageKit
  const buffer = await fs.promises.readFile(localFilePath);
  const result = await imagekit.upload({
    file: buffer,
    fileName: targetFileName,
    folder: "/products",
    useUniqueFileName: false,
  });

  const cleanUrl = result.url.split("?")[0];
  uploadedMap.set(targetFileName, cleanUrl);
  console.log(`  ⬆ Uploaded to ImageKit: ${targetFileName} -> ${cleanUrl}`);
  return cleanUrl;
}

function resolveLocalPath(imagePath: string): string | null {
  const clean = imagePath.split("#")[0].split("?")[0];
  const relative = clean.replace(/^\/+/, "");

  const candidates = [
    path.join(process.cwd(), "public", relative),
    path.join(process.cwd(), relative),
    path.join(process.cwd(), "public", "uploads", path.basename(clean)),
    path.join(process.cwd(), "public", "products", path.basename(clean)),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c;
    }
  }
  return null;
}

async function main() {
  console.log("\n=======================================================");
  console.log("🚀 ImageKit Cloud Image Migration");
  console.log("=======================================================\n");
  console.log(`Endpoint: ${process.env.IMAGEKIT_URL_ENDPOINT}`);

  let uploadedCount = 0;
  let reusedCount = 0;
  let productsUpdatedCount = 0;

  // STEP 1: Scan and upload all files from public/uploads/
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (fs.existsSync(uploadsDir)) {
    console.log("\n📂 Step 1: Scanning local public/uploads directory...");
    const files = await fs.promises.readdir(uploadsDir);
    const validExtensions = new Set([
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".svg",
      ".avif",
    ]);

    for (const file of files) {
      if (file === ".gitkeep" || file === ".DS_Store") continue;
      const ext = path.extname(file).toLowerCase();
      if (!validExtensions.has(ext)) continue;

      const fullPath = path.join(uploadsDir, file);
      try {
        const wasCached = uploadedMap.has(file);
        await findOrUploadToImageKit(fullPath, file);
        if (!wasCached) {
          uploadedCount++;
        } else {
          reusedCount++;
        }
      } catch (err: unknown) {
        console.error(`  ⚠️ Failed to upload ${file}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  // STEP 2: Update all Products in Database
  console.log("\n📦 Step 2: Processing Products in Neon Database...");
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to check.`);

  for (const product of products) {
    let urls: string[] = [];
    try {
      urls = JSON.parse(product.imageUrls || "[]");
    } catch {
      continue;
    }

    let modified = false;
    const newUrls: string[] = [];

    for (const rawUrl of urls) {
      // If already pointing to ImageKit or an external CDN, leave it
      if (rawUrl.includes("ik.imagekit.io")) {
        newUrls.push(rawUrl);
        continue;
      }

      const hashIndex = rawUrl.indexOf("#");
      const hash = hashIndex !== -1 ? rawUrl.substring(hashIndex) : "";
      const cleanPath = rawUrl.split("#")[0].split("?")[0];
      const filename = path.basename(cleanPath);

      // Try to find the local file
      const localFilePath = resolveLocalPath(cleanPath);

      if (localFilePath) {
        try {
          const wasCached = uploadedMap.has(filename);
          const imageKitBaseUrl = await findOrUploadToImageKit(localFilePath, filename);
          const finalUrl = `${imageKitBaseUrl}${hash}`;
          newUrls.push(finalUrl);
          modified = true;
          if (!wasCached) uploadedCount++;
        } catch (err: unknown) {
          console.error(`  ⚠️ Could not upload ${filename}:`, err instanceof Error ? err.message : err);
          newUrls.push(rawUrl);
        }
      } else {
        // If file doesn't exist on disk, check if it was previously uploaded to ImageKit
        try {
          const existing = await imagekit.listFiles({
            name: filename,
            path: "/products",
          });

          const match = Array.isArray(existing)
            ? existing.find(
                (f) => f.type === "file" && f.name === filename
              ) || existing.find((f) => f.type === "file")
            : undefined;

          if (match && "url" in match && typeof match.url === "string") {
            const clean = match.url.split("?")[0];
            const finalUrl = `${clean}${hash}`;
            newUrls.push(finalUrl);
            modified = true;
            console.log(`  ↪ Found existing ImageKit image for missing local file: ${filename}`);
            continue;
          }
        } catch {
          // Ignore
        }

        console.log(`  ℹ️ Local file not found on disk: "${cleanPath}" (keeping original)`);
        newUrls.push(rawUrl);
      }
    }

    if (modified) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrls: JSON.stringify(newUrls) },
      });
      console.log(`  ✅ Updated product "${product.title}" (${product.slug}) with ImageKit URLs.`);
      productsUpdatedCount++;
    }
  }

  console.log("\n=======================================================");
  console.log("🎉 ImageKit Migration Complete!");
  console.log(`- Uploaded / processed images: ${uploadedCount + reusedCount}`);
  console.log(`- Database products updated: ${productsUpdatedCount}`);
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
