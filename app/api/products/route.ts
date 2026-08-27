import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(rows.map(serializeProduct));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Product title is required" }, { status: 400 });
    }

    let slug = String(body.slug ?? "").trim() || slugify(title);
    if (!slug) slug = `product-${Date.now()}`;

    // Ensure slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const row = await prisma.product.create({
      data: {
        title,
        slug,
        price: Number(body.price) || 0,
        discountPrice:
          body.discountPrice == null || body.discountPrice === ""
            ? null
            : Number(body.discountPrice),
        imageUrls: JSON.stringify(body.imageUrls ?? []),
        badges: JSON.stringify(body.badges ?? []),
        color: String(body.color ?? "Black"),
        category: String(body.category ?? "Oversized"),
        stockS: Number(body.stockS) || 0,
        stockM: Number(body.stockM) || 0,
        stockL: Number(body.stockL) || 0,
        stockXL: Number(body.stockXL) || 0,
        isVisible: Boolean(body.isVisible ?? true),
        rating: Number(body.rating) || 4.5,
        reviewCount: Number(body.reviewCount) || 0,
      },
    });

    return NextResponse.json(serializeProduct(row), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
