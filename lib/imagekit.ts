import ImageKit from "imagekit";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const globalForImageKit = globalThis as unknown as { imagekit?: ImageKit };

export function isImageKitConfigured(): boolean {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_URL_ENDPOINT,
  );
}

export function getImageKitClient(): ImageKit {
  if (!isImageKitConfigured()) {
    throw new Error(
      "ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env",
    );
  }

  if (!globalForImageKit.imagekit) {
    globalForImageKit.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
    });
  }

  return globalForImageKit.imagekit;
}

/**
 * Checks whether any product other than excludeProductId still references this media file.
 */
export async function isMediaInUseElsewhere(
  urlOrFilename: string,
  excludeProductId?: string,
): Promise<boolean> {
  const clean = urlOrFilename.split("#")[0].split("?")[0];
  const filename = path.basename(clean);
  if (!filename) return false;

  const count = await prisma.product.count({
    where: {
      ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
      imageUrls: {
        contains: filename,
      },
    },
  });
  return count > 0;
}

/**
 * Deletes an asset from ImageKit (or local uploads directory fallback).
 */
export async function deleteMediaAsset(urlOrFilename: string): Promise<boolean> {
  const clean = urlOrFilename.split("#")[0].split("?")[0];
  const filename = path.basename(clean);
  if (!filename) return false;

  let deleted = false;

  // 1. Delete from ImageKit if configured and it's a cloud asset
  if (isImageKitConfigured() && (clean.includes("ik.imagekit.io") || !clean.startsWith("/"))) {
    try {
      const imagekit = getImageKitClient();
      let results = await imagekit.listFiles({
        name: filename,
        path: "/products",
      });

      if (!Array.isArray(results) || results.length === 0) {
        // Fallback search without specific folder restriction
        results = await imagekit.listFiles({
          name: filename,
        });
      }

      if (Array.isArray(results) && results.length > 0) {
        const targetFile = results.find((f) => f.name === filename) || results[0];
        if (targetFile && targetFile.type === "file" && targetFile.fileId) {
          await imagekit.deleteFile(targetFile.fileId);
          deleted = true;
        }
      }
    } catch (err) {
      console.error(`Failed to delete ImageKit file "${filename}":`, err);
    }
  }

  // 2. Local uploads fallback
  if (!deleted) {
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, filename);
      if (filePath.startsWith(uploadDir)) {
        await fs.unlink(filePath);
        deleted = true;
      }
    } catch {
      // Local file not found
    }
  }

  return deleted;
}
