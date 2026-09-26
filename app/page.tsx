import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeProduct, STOREFRONT_PRODUCT_SELECT } from "@/lib/product";
import { StoreShell } from "@/components/storefront/StoreShell";
import { GenderGatewayHero } from "@/components/storefront/GenderGatewayHero";
import { BrandFeatures } from "@/components/storefront/BrandFeatures";
import { TrustBar } from "@/components/storefront/TrustBar";

// Revalidate every 60 seconds (ISR) or on-demand via revalidatePath
export const revalidate = 60;

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0d] py-8 sm:py-12 md:py-16 border-b border-zinc-800 select-none">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="h-8 sm:h-12 w-3/4 max-w-md mx-auto bg-zinc-800/60 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-6 sm:gap-12 md:gap-16 max-w-2xl sm:max-w-3xl mx-auto items-center">
          <div className="flex flex-col items-center">
            <div className="w-36 h-36 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full bg-zinc-900 border border-zinc-800 animate-pulse" />
            <div className="mt-4 sm:mt-6 w-28 sm:w-44 h-9 sm:h-12 rounded-full bg-zinc-800/80 animate-pulse" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-36 h-36 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full bg-zinc-900 border border-zinc-800 animate-pulse" />
            <div className="mt-4 sm:mt-6 w-28 sm:w-44 h-9 sm:h-12 rounded-full bg-zinc-800/80 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const rows = await prisma.product.findMany({
    where: {
      isVisible: true,
      section: { in: ["men", "women", "unisex", "both"] },
    },
    select: STOREFRONT_PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  const products = rows.map(serializeProduct);

  return (
    <StoreShell>
      <Suspense fallback={<HeroSkeleton />}>
        <GenderGatewayHero />
      </Suspense>
      <BrandFeatures featuredProducts={products} />
      <TrustBar />
    </StoreShell>
  );
}
