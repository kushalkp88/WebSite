import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { StoreShell } from "@/components/storefront/StoreShell";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await prisma.product.findUnique({ where: { slug } });
  if (!row || !row.isVisible) notFound();

  return (
    <StoreShell>
      <ProductDetail product={serializeProduct(row)} />
    </StoreShell>
  );
}
