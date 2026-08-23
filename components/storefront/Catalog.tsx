"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ArrowUpDown,
  ChevronUp,
  X,
  Sparkles,
  Check,
} from "lucide-react";
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

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "low", label: "Price: Low to High" },
  { id: "high", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

export function Catalog({ initial }: { initial: ProductDTO[] }) {
  const params = useSearchParams();
  const search = useShop((s) => s.search);
  const setSearch = useShop((s) => s.setSearch);
  const [products, setProducts] = useState(initial);
  const [sort, setSort] = useState("featured");
  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    categories: params.get("category") ? [params.get("category") as string] : [],
  }));
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

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

  const activeFilterCount =
    filters.sizes.length +
    filters.colors.length +
    filters.categories.length +
    (filters.maxPrice < 2500 ? 1 : 0);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.id === sort)?.label ?? "Featured";

  const categoryName = params.get("category")
    ? params.get("category")
    : params.get("badge")
    ? params.get("badge")
    : "EPIC THREAD";

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8 py-6 sm:py-12 scroll-mt-20">
      {/* Catalog Title & Desktop Controls Bar (Matching Veirdo screenshot: EPIC THREAD 13 items) */}
      <div className="mb-4 sm:mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-zinc-200 pb-3 sm:pb-6">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
              {categoryName}
            </h2>
            <span className="text-xs sm:text-sm font-semibold text-zinc-500">
              {filtered.length} items
            </span>
          </div>

          {search && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-zinc-600">
                Searching for: &ldquo;<strong className="text-zinc-900">{search}</strong>&rdquo;
              </span>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Desktop Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowDesktopFilters((v) => !v)}
          className="hidden lg:flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2 text-xs font-bold tracking-wider text-zinc-900 uppercase transition-all hover:bg-zinc-900 hover:text-white cursor-pointer shadow-2xs"
        >
          <SlidersHorizontal size={13} />
          <span>{showDesktopFilters ? "Hide Filters" : "Show Filters"}</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Catalog Layout */}
      <div className={`gap-8 ${showDesktopFilters ? "lg:flex" : ""}`}>
        {showDesktopFilters && (
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28">
              <FilterSidebar
                products={products}
                filters={filters}
                onChange={setFilters}
              />
            </div>
          </aside>
        )}
        <div className="min-w-0 flex-1">
          <ProductGrid
            products={filtered}
            sort={sort}
            onSortChange={setSort}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STICKY BOTTOM BAR ON MOBILE (Matching Veirdo screenshot: FILTERS | SORT BY) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-3 inset-x-3 z-40 lg:hidden max-w-sm mx-auto bg-zinc-950/95 text-white rounded-2xl backdrop-blur-md border border-zinc-800 shadow-2xl p-1 flex items-center justify-between animate-fade-in">
        {/* Left Half: Filters */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black uppercase tracking-wider text-zinc-200 hover:text-white transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={14} className="text-zinc-400" />
          <span>FILTERS</span>
          {activeFilterCount > 0 && (
            <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold grid place-items-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-zinc-800" />

        {/* Right Half: Sort By */}
        <button
          type="button"
          onClick={() => setMobileSortOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black uppercase tracking-wider text-zinc-200 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowUpDown size={14} className="text-zinc-400" />
          <div className="flex flex-col items-start text-left leading-none">
            <span className="text-[11px] font-black">SORT BY</span>
            <span className="text-[9px] font-medium text-zinc-400 capitalize mt-0.5 truncate max-w-[80px]">
              {activeSortLabel}
            </span>
          </div>
        </button>
      </div>

      {/* Floating Scroll To Top Button on Mobile (Matching screenshot ▲) */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-18 right-3.5 z-40 lg:hidden grid h-9 w-9 place-items-center rounded-xl bg-white border border-zinc-200 text-zinc-900 shadow-md active:scale-90 cursor-pointer"
      >
        <ChevronUp size={18} strokeWidth={2.5} />
      </button>

      {/* ========================================================================= */}
      {/* MOBILE FILTER MODAL DRAWER */}
      {/* ========================================================================= */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-fade-up">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-zinc-800" />
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900">
                  Filter Products
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-zinc-500 hover:text-black rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              <FilterSidebar
                products={products}
                filters={filters}
                onChange={setFilters}
              />
            </div>

            {/* Drawer Actions */}
            <div className="p-4 border-t border-zinc-200 flex gap-3 bg-zinc-50">
              <button
                type="button"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                }}
                className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-900 text-white hover:bg-black shadow-md"
              >
                Apply ({filtered.length} Items)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE SORT BOTTOM SHEET */}
      {/* ========================================================================= */}
      {mobileSortOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-t-3xl p-5 space-y-3 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900">
                Sort By
              </h3>
              <button
                type="button"
                onClick={() => setMobileSortOpen(false)}
                className="p-1 text-zinc-500 hover:text-black rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1.5">
              {SORT_OPTIONS.map((opt) => {
                const selected = sort === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSort(opt.id);
                      setMobileSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all ${
                      selected
                        ? "bg-zinc-900 text-white font-black shadow-2xs"
                        : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check size={16} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

