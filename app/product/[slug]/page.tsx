import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct, STOREFRONT_PRODUCT_SELECT } from "@/lib/product";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { StoreShell } from "@/components/storefront/StoreShell";

// Revalidate product page every 60 seconds (ISR) or on-demand via revalidatePath
export const revalidate = 60;

// Deduplicate product query between metadata and page render via React.cache
const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    select: STOREFRONT_PRODUCT_SELECT,
  });
});

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isVisible: true },
      select: { slug: true },
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getProductBySlug(slug);
  if (!row || !row.isVisible) return { title: "Product — UNHINGED" };

  const product = serializeProduct(row);
  const primaryImage = product.imageUrls[0] || "/hero/men-model.jpg";
  const title = `${product.title} — UNHINGED`;
  const description = `Shop ${product.title} (${product.category}) in ${product.color}. Heavyweight cotton streetwear with raw attitude.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: primaryImage, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getProductBySlug(slug);
  if (!row || !row.isVisible) notFound();

  return (
    <StoreShell>
      <ProductDetail product={serializeProduct(row)} />
    </StoreShell>
  );
}
