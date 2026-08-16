import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const row = await prisma.product.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeProduct(row));
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title != null) data.title = String(body.title);
  if (body.slug != null) data.slug = String(body.slug);
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
  if (body.stockS != null) data.stockS = Number(body.stockS);
  if (body.stockM != null) data.stockM = Number(body.stockM);
  if (body.stockL != null) data.stockL = Number(body.stockL);
  if (body.stockXL != null) data.stockXL = Number(body.stockXL);
  if (body.isVisible != null) data.isVisible = Boolean(body.isVisible);
  if (body.rating != null) data.rating = Number(body.rating);
  if (body.reviewCount != null) data.reviewCount = Number(body.reviewCount);

  try {
    const row = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(serializeProduct(row));
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
