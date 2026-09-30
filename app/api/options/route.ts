import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_OPTIONS, type ProductOptions } from "@/lib/options";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const OPTIONS_FILE = path.join(DATA_DIR, "options.json");

// In-memory fallback for read-only serverless runtimes (e.g. Vercel)
let memoryOptions: ProductOptions | null = null;

async function ensureOptionsFile(): Promise<ProductOptions> {
  if (memoryOptions) return memoryOptions;
  try {
    const raw = await fs.readFile(OPTIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ProductOptions>;
    if (parsed && Array.isArray(parsed.colors) && Array.isArray(parsed.fits)) {
      memoryOptions = {
        colors: parsed.colors.length > 0 ? parsed.colors : DEFAULT_OPTIONS.colors,
        fits: parsed.fits.length > 0 ? parsed.fits : DEFAULT_OPTIONS.fits,
      };
      return memoryOptions;
    }
  } catch {
    // If file cannot be read, attempt creation only if writable
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(OPTIONS_FILE, JSON.stringify(DEFAULT_OPTIONS, null, 2), "utf-8");
    } catch {
      // Ignore read-only filesystem errors in serverless
    }
  }
  return memoryOptions ?? DEFAULT_OPTIONS;
}

export async function GET() {
  const options = await ensureOptionsFile();
  return NextResponse.json(options, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ProductOptions>;

    if (!body || !Array.isArray(body.colors) || !Array.isArray(body.fits)) {
      return NextResponse.json(
        { error: "Invalid payload: 'colors' and 'fits' arrays are required." },
        { status: 400 }
      );
    }

    const cleanedPayload: ProductOptions = {
      colors: body.colors.map((c) => ({
        name: String(c.name || "").trim(),
        hex: String(c.hex || "#3f3f46").trim(),
        border: c.border ? String(c.border).trim() : undefined,
      })).filter((c) => c.name.length > 0),
      fits: body.fits.map((f) => ({
        name: String(f.name || "").trim(),
        description: f.description ? String(f.description).trim() : undefined,
      })).filter((f) => f.name.length > 0),
    };

    memoryOptions = cleanedPayload;

    // Persist to filesystem if environment allows writes (e.g. local dev / container)
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(OPTIONS_FILE, JSON.stringify(cleanedPayload, null, 2), "utf-8");
    } catch {
      // In serverless / read-only filesystem, options remain in memoryOptions
    }

    return NextResponse.json(cleanedPayload);
  } catch (err) {
    console.error("Error saving options:", err);
    return NextResponse.json(
      { error: "Internal Server Error while saving catalog options." },
      { status: 500 }
    );
  }
}
