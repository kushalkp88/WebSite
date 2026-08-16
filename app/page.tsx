import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";
import { Catalog } from "@/components/storefront/Catalog";
import { Hero } from "@/components/storefront/Hero";
import { TrustBar } from "@/components/storefront/TrustBar";
import { StoreShell } from "@/components/storefront/StoreShell";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });
  const products = rows.map(serializeProduct);

  return (
    <StoreShell>
      <Hero />
      <TrustBar />
      <Suspense>
        <Catalog initial={products} />
      </Suspense>
    </StoreShell>
  );
}
