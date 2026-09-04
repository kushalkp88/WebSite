import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const row = await prisma.product.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(serializeProduct(row));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (body.title != null) data.title = String(body.title);
    if (body.slug != null) {
      const slug = String(body.slug).trim();
      if (slug) {
        // Check if slug is taken by another product
        const existing = await prisma.product.findFirst({
          where: { slug, NOT: { id } },
        });
        if (existing) {
          return NextResponse.json(
            { error: `The URL slug "${slug}" is already in use by another product.` },
            { status: 409 }
          );
        }
        data.slug = slug;
      }
    }
    if (body.price != null) data.price = Number(body.price);
    if (body.discountPrice !== undefined)
      data.discountPrice =
        body.discountPrice == null || body.discountPrice === ""
          ? null
          : Number(body.discountPrice);
    if (body.imageUrls != null) data.imageUrls = JSON.stringify(body.imageUrls);
    if (body.badges != null) data.badges = JSON.stringify(body.badges);
    if (body.color != null) data.color = String(body.color);
    if (body.category != null) data.category = String(body.category);
    if (body.section != null) data.section = String(body.section).toLowerCase();
    if (body.stockS != null) data.stockS = Number(body.stockS);
    if (body.stockM != null) data.stockM = Number(body.stockM);
    if (body.stockL != null) data.stockL = Number(body.stockL);
    if (body.stockXL != null) data.stockXL = Number(body.stockXL);
    if (body.isVisible != null) data.isVisible = Boolean(body.isVisible);
    if (body.rating != null) data.rating = Number(body.rating);
    if (body.reviewCount != null) data.reviewCount = Number(body.reviewCount);

    const row = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(serializeProduct(row));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
