import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows.map(serializeProduct));
}

export async function POST(req: Request) {
  const body = await req.json();
  const row = await prisma.product.create({
    data: {
      title: String(body.title ?? ""),
      slug: String(body.slug ?? "").trim() || slugify(String(body.title ?? "tee")),
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
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
