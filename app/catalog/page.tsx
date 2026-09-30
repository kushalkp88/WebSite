import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeProduct, STOREFRONT_PRODUCT_SELECT } from "@/lib/product";
import { Catalog } from "@/components/storefront/Catalog";
import { StoreShell } from "@/components/storefront/StoreShell";

import type { Metadata } from "next";

// Revalidate every 60 seconds (ISR) or on-demand via revalidatePath
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catalog — UNHINGED Streetwear",
  description: "Browse the full collection of heavyweight oversized tees, acid-wash drops, and streetwear hoodies.",
  alternates: {
    canonical: "/catalog",
  },
  openGraph: {
    title: "Catalog — UNHINGED Streetwear",
    description: "Browse the full collection of heavyweight oversized tees, acid-wash drops, and streetwear hoodies.",
    url: "/catalog",
    siteName: "UNHINGED Streetwear",
    type: "website",
    images: [
      {
        url: "/hero/men-model.jpg",
        width: 1200,
        height: 630,
        alt: "UNHINGED Streetwear Catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catalog — UNHINGED Streetwear",
    description: "Browse the full collection of heavyweight oversized tees, acid-wash drops, and streetwear hoodies.",
    images: ["/hero/men-model.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

function CatalogSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Header Skeleton */}
      <div className="mb-4 sm:mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-zinc-200 pb-3 sm:pb-6">
        <div className="h-7 sm:h-8 w-44 sm:w-60 bg-zinc-200 rounded-xl animate-pulse" />
        <div className="hidden lg:block h-9 w-32 bg-zinc-100 rounded-full animate-pulse border border-zinc-200" />
      </div>

      {/* Body: Sidebar + Grid */}
      <div className="flex gap-8 items-start">
        {/* Left Filter Sidebar Placeholder */}
        <div className="hidden lg:block w-64 shrink-0 space-y-5">
          <div className="h-40 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200/60" />
          <div className="h-36 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200/60" />
          <div className="h-28 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200/60" />
        </div>

        {/* Right Product Grid Placeholder */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200/70" />
              <div className="h-2.5 w-1/3 bg-zinc-200/80 rounded animate-pulse" />
              <div className="h-3.5 w-3/4 bg-zinc-200 rounded animate-pulse" />
              <div className="h-3.5 w-1/4 bg-zinc-200/80 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function CatalogPage() {
  const rows = await prisma.product.findMany({
    where: {
      isVisible: true,
      section: { in: ["men", "women", "unisex", "both"] },
    },
    select: STOREFRONT_PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
  });
  const products = rows.map(serializeProduct);

  return (
    <StoreShell>
      <div className="pt-2 sm:pt-4">
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog initial={products} />
        </Suspense>
      </div>
    </StoreShell>
  );
}
