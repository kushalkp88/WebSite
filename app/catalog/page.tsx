import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";
import { Catalog } from "@/components/storefront/Catalog";
import { StoreShell } from "@/components/storefront/StoreShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalog — UNHINGED Streetwear",
  description: "Browse the full collection of oversized tees, hoodies, and graphic drops.",
};

export default async function CatalogPage() {
  const rows = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });
  const products = rows.map(serializeProduct);

  return (
    <StoreShell>
      <div className="pt-2 sm:pt-4">
        <Suspense fallback={<div className="p-12 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading collection...</div>}>
          <Catalog initial={products} />
        </Suspense>
      </div>
    </StoreShell>
  );
}
