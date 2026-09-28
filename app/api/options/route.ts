import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_OPTIONS, type ProductOptions } from "@/lib/options";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const OPTIONS_FILE = path.join(DATA_DIR, "options.json");

async function ensureOptionsFile(): Promise<ProductOptions> {
  try {
    const raw = await fs.readFile(OPTIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ProductOptions>;
    if (parsed && Array.isArray(parsed.colors) && Array.isArray(parsed.fits)) {
      return {
        colors: parsed.colors.length > 0 ? parsed.colors : DEFAULT_OPTIONS.colors,
        fits: parsed.fits.length > 0 ? parsed.fits : DEFAULT_OPTIONS.fits,
      };
    }
  } catch {
    // File doesn't exist or is invalid JSON; create directory & file with defaults
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(OPTIONS_FILE, JSON.stringify(DEFAULT_OPTIONS, null, 2), "utf-8");
    } catch (writeErr) {
      console.warn("Could not write initial options.json:", writeErr);
    }
  }
  return DEFAULT_OPTIONS;
}

export async function GET() {
  const options = await ensureOptionsFile();
  return NextResponse.json(options);
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

    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(OPTIONS_FILE, JSON.stringify(cleanedPayload, null, 2), "utf-8");

    return NextResponse.json(cleanedPayload);
  } catch (err) {
    console.error("Error saving options:", err);
    return NextResponse.json(
      { error: "Internal Server Error while saving catalog options." },
      { status: 500 }
    );
  }
}
