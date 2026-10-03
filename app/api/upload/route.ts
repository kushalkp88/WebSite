import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import {
  deleteMediaAsset,
  getImageKitClient,
  isImageKitConfigured,
} from "@/lib/imagekit";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import sharp from "sharp";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getUploadDir() {
  return path.join(process.cwd(), "public", "uploads");
}

function sanitizeFilename(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  const nameWithoutExt = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${nameWithoutExt || "image"}-${timestamp}-${random}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`upload:${ip}`, 20, 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many upload requests. Please wait a minute before uploading more files." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const files: File[] = [];

    // Collect all uploaded files from form data
    for (const [key, value] of formData.entries()) {
      if (
        value instanceof File &&
        (key === "file" || key === "files" || key.startsWith("file"))
      ) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No image file provided in request" },
        { status: 400 },
      );
    }

    const savedFiles: Array<{
      url: string;
      name: string;
      size: number;
      type: string;
    }> = [];

    // Check if ImageKit is configured in environment
    const useImageKit = isImageKitConfigured();
    const imagekit = useImageKit ? getImageKitClient() : null;

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          {
            error: `Disallowed file extension: "${ext}". Allowed: JPG, PNG, WebP, GIF, AVIF.`,
          },
          { status: 400 },
        );
      }

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file type: "${file.type}". Allowed types: JPG, PNG, WebP, GIF, AVIF.`,
          },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds maximum allowed size of 10MB.`,
          },
          { status: 400 },
        );
      }

      const filename = sanitizeFilename(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const rawBuffer = Buffer.from(arrayBuffer);

      let finalBuffer = rawBuffer;
      let finalName = filename;
      let finalMime = file.type;

      // ponytail: compress raster images to max 2048px WebP q=84; preserve animated gifs
      if (file.type !== "image/gif") {
        try {
          finalBuffer = await sharp(rawBuffer)
            .rotate()
            .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 84, effort: 5, smartSubsample: true })
            .toBuffer();
          finalName = filename.replace(/\.[^/.]+$/, "") + ".webp";
          finalMime = "image/webp";
        } catch (compressionErr) {
          console.warn("Sharp compression failed, falling back to original:", compressionErr);
        }
      }

      if (imagekit) {
        // Upload directly to ImageKit cloud under /products
        const uploadResult = await imagekit.upload({
          file: finalBuffer,
          fileName: finalName,
          folder: "/products",
          useUniqueFileName: true,
        });

        savedFiles.push({
          url: uploadResult.url,
          name: uploadResult.name,
          size: uploadResult.size,
          type: finalMime,
        });
      } else {
        // Fallback for local development if keys are not yet added
        const uploadDir = getUploadDir();
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, finalName);
        await fs.writeFile(filePath, finalBuffer);

        const url = `/uploads/${finalName}`;
        savedFiles.push({
          url,
          name: finalName,
          size: finalBuffer.byteLength,
          type: finalMime,
        });
      }
    }

    return NextResponse.json({
      success: true,
      url: savedFiles[0]?.url,
      urls: savedFiles.map((f) => f.url),
      files: savedFiles,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch all products to track image usage
    const products = await prisma.product.findMany({
      select: { title: true, slug: true, imageUrls: true },
    });

    const usageMap = new Map<string, Array<{ title: string; slug: string }>>();
    for (const p of products) {
      try {
        const urls = JSON.parse(p.imageUrls || "[]") as string[];
        for (const u of urls) {
          const cleanUrl = u.split("#")[0].split("?")[0];
          if (!usageMap.has(cleanUrl)) usageMap.set(cleanUrl, []);
          usageMap.get(cleanUrl)!.push({ title: p.title, slug: p.slug });
        }
      } catch {
        // ignore JSON parse errors
      }
    }

    const imageFiles: Array<{
      url: string;
      filename: string;
      size: number;
      mtime: string;
      usedIn: Array<{ title: string; slug: string }>;
    }> = [];

    // 1. Fetch cloud media from ImageKit if configured
    if (isImageKitConfigured()) {
      try {
        const imagekit = getImageKitClient();
        const files = await imagekit.listFiles({
          path: "/products",
          limit: 100,
        });

        if (Array.isArray(files)) {
          for (const f of files) {
            if (f.type !== "file") continue;
            // Only include image files
            const ext = path.extname(f.name).toLowerCase();
            if (
              [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
                ".gif",
                ".svg",
                ".avif",
              ].includes(ext)
            ) {
              const cleanUrl = f.url.split("?")[0];
              imageFiles.push({
                url: f.url,
                filename: f.name,
                size: f.size,
                mtime: f.updatedAt || f.createdAt || new Date().toISOString(),
                usedIn: usageMap.get(cleanUrl) || [],
              });
            }
          }
        }
      } catch (cloudErr) {
        console.error("Failed to list ImageKit files:", cloudErr);
      }
    }

    // 2. Also check local uploads directory for backward compatibility
    try {
      const uploadDir = getUploadDir();
      const entries = await fs.readdir(uploadDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (
            [
              ".jpg",
              ".jpeg",
              ".png",
              ".webp",
              ".gif",
              ".svg",
              ".avif",
            ].includes(ext)
          ) {
            const filePath = path.join(uploadDir, entry.name);
            const stat = await fs.stat(filePath);
            const url = `/uploads/${entry.name}`;
            const cleanUrl = url.split("?")[0];
            const usedIn = usageMap.get(cleanUrl) || [];
            imageFiles.push({
              url,
              filename: entry.name,
              size: stat.size,
              mtime: stat.mtime.toISOString(),
              usedIn,
            });
          }
        }
      }
    } catch {
      // Ignore if public/uploads directory does not exist
    }

    // Sort newest first
    imageFiles.sort(
      (a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime(),
    );

    return NextResponse.json({ images: imageFiles });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch uploads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let target: string | undefined =
      searchParams.get("url") || searchParams.get("filename") || undefined;

    if (!target) {
      try {
        const body = (await request.json()) as {
          url?: string;
          filename?: string;
        };
        target = body.url || body.filename;
      } catch {
        // No JSON body
      }
    }

    if (!target) {
      return NextResponse.json(
        { error: "Missing file URL or filename" },
        { status: 400 },
      );
    }

    const filename = path.basename(target.split("#")[0].split("?")[0]);
    const deleted = await deleteMediaAsset(target);

    if (!deleted) {
      return NextResponse.json(
        { error: "File not found or already deleted" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, deleted: filename });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
