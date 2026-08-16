"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";
import {
  isOutOfStock,
  salePrice,
  stockFor,
  type ProductDTO,
} from "@/lib/product";
import { useShop } from "@/lib/cart-store";
import {
  EMPTY_FILTERS,
  FilterSidebar,
  type Filters,
} from "./FilterSidebar";
import { ProductGrid } from "./ProductGrid";
import { CategoryPills } from "./CategoryPills";

export function Catalog({ initial }: { initial: ProductDTO[] }) {
  const params = useSearchParams();
  const search = useShop((s) => s.search);
  const setSearch = useShop((s) => s.setSearch);
  const [products, setProducts] = useState(initial);
  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    categories: params.get("category") ? [params.get("category") as string] : [],
  }));
  const [showFilters, setShowFilters] = useState(true);

  // Sync category param changes
  useEffect(() => {
    const cat = params.get("category");
    if (cat) {
      setFilters((prev) => ({
        ...prev,
        categories: [cat],
      }));
    }
  }, [params]);

  // Periodic polling for live updates from admin
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const all = (await res.json()) as ProductDTO[];
        setProducts(all.filter((p) => p.isVisible));
      } catch {}
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const badge = params.get("badge");
    const catParam = params.get("category");
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      if (badge && !p.badges.includes(badge)) return false;
      if (catParam && p.category !== catParam) return false;
      if (filters.colors.length && !filters.colors.includes(p.color)) return false;
      if (filters.categories.length && !filters.categories.includes(p.category))
        return false;
      if (salePrice(p) > filters.maxPrice) return false;
      if (filters.sizes.length) {
        const anySize = filters.sizes.some((s) => stockFor(p, s) > 0);
        if (!anySize && !isOutOfStock(p)) return false;
        if (!anySize && isOutOfStock(p)) return false;
      }
      return true;
    });
  }, [products, filters, search, params]);

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 scroll-mt-24">
      {/* Category Pills Strip */}
      <div className="mb-8">
        <CategoryPills />
      </div>

      {/* Catalog Title & Controls Bar */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            <span>INKDROP</span>
            <span>/</span>
            <span style={{ color: "var(--accent-color)" }}>CURATED DROPS</span>
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white">
            THE PRINT DROP
          </h2>
          {search && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-zinc-400">
                Searching for: &ldquo;<strong className="text-white">{search}</strong>&rdquo;
              </span>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2.5 rounded-full border border-white/20 bg-zinc-900/90 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-white hover:text-black cursor-pointer shadow-md"
        >
          <SlidersHorizontal size={14} />
          <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
        </button>
      </div>

      {/* Main Catalog Layout */}
      <div className={`gap-8 ${showFilters ? "lg:flex" : ""}`}>
        {showFilters && (
          <aside className="mb-8 w-full shrink-0 lg:mb-0 lg:w-64">
            <div className="sticky top-28 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md">
              <FilterSidebar
                products={products}
                filters={filters}
                onChange={setFilters}
              />
            </div>
          </aside>
        )}
        <div className="min-w-0 flex-1">
          <ProductGrid products={filtered} />
        </div>
      </div>
    </section>
  );
}
