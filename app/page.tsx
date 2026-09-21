import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";
import { StoreShell } from "@/components/storefront/StoreShell";
import { GenderGatewayHero } from "@/components/storefront/GenderGatewayHero";
import { BrandFeatures } from "@/components/storefront/BrandFeatures";
import { TrustBar } from "@/components/storefront/TrustBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });
  const products = rows.map(serializeProduct);

  return (
    <StoreShell>
      <Suspense fallback={null}>
        <GenderGatewayHero />
      </Suspense>
      <BrandFeatures featuredProducts={products} />
      <TrustBar />
    </StoreShell>
  );
}
