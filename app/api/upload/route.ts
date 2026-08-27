import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
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
    const formData = await request.formData();
    const files: File[] = [];

    // Collect all uploaded files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && (key === "file" || key === "files" || key.startsWith("file"))) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No image file provided in request" },
        { status: 400 }
      );
    }

    const uploadDir = getUploadDir();
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles: Array<{ url: string; name: string; size: number; type: string }> = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file type: "${file.type}". Allowed types: JPG, PNG, WebP, GIF, SVG, AVIF.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds maximum allowed size of 10MB.`,
          },
          { status: 400 }
        );
      }

      const filename = sanitizeFilename(file.name);
      const filePath = path.join(uploadDir, filename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);

      const url = `/uploads/${filename}`;
      savedFiles.push({
        url,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json({
      success: true,
      url: savedFiles[0]?.url,
      urls: savedFiles.map((f) => f.url),
      files: savedFiles,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const uploadDir = getUploadDir();
    await fs.mkdir(uploadDir, { recursive: true });

    const entries = await fs.readdir(uploadDir, { withFileTypes: true });
    const imageFiles = [];

    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"].includes(ext)) {
          const filePath = path.join(uploadDir, entry.name);
          const stat = await fs.stat(filePath);
          imageFiles.push({
            url: `/uploads/${entry.name}`,
            filename: entry.name,
            size: stat.size,
            mtime: stat.mtime.toISOString(),
          });
        }
      }
    }

    // Sort newest first
    imageFiles.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());

    return NextResponse.json({ images: imageFiles });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch uploads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let target: string | undefined = searchParams.get("url") || searchParams.get("filename") || undefined;

    if (!target) {
      try {
        const body = (await request.json()) as { url?: string; filename?: string };
        target = body.url || body.filename;
      } catch {
        // No JSON body
      }
    }

    if (!target) {
      return NextResponse.json({ error: "Missing file URL or filename" }, { status: 400 });
    }

    const filename = path.basename(target);
    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, filename);

    // Ensure resolved path stays inside uploadDir to prevent path traversal
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    try {
      await fs.unlink(filePath);
    } catch {
      return NextResponse.json({ error: "File not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: filename });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
