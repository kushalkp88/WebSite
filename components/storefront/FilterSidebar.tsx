"use client";

import type { ReactNode } from "react";
import type { ProductDTO, Size } from "@/lib/product";
import { formatInr, SIZES } from "@/lib/product";
import { RotateCcw, Check } from "lucide-react";

export type Filters = {
  sizes: Size[];
  colors: string[];
  categories: string[];
  maxPrice: number;
};

export const EMPTY_FILTERS: Filters = {
  sizes: [],
  colors: [],
  categories: [],
  maxPrice: 2500,
};

export function FilterSidebar({
  products,
  filters,
  onChange,
}: {
  products: ProductDTO[];
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const colors = [...new Set(products.map((p) => p.color))].filter(Boolean).sort();
  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();

  const totalActive =
    filters.sizes.length +
    filters.colors.length +
    filters.categories.length +
    (filters.maxPrice < 2500 ? 1 : 0);

  function toggle<K extends "sizes" | "colors" | "categories">(
    key: K,
    value: Filters[K][number],
  ) {
    const list = filters[key] as Array<typeof value>;
    const next = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    onChange({ ...filters, [key]: next });
  }

  function resetAll() {
    onChange(EMPTY_FILTERS);
  }

  return (
    <aside className="space-y-6 text-sm">
      {/* Header with reset */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-xs font-black uppercase tracking-widest text-white">
          Filter Drops
        </span>
        {totalActive > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset ({totalActive})
          </button>
        )}
      </div>

      {/* Size Pills */}
      <FilterGroup title="Sizes Available">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggle("sizes", size)}
                className={`min-w-10 py-1.5 px-3 rounded-lg text-xs font-black transition-all border cursor-pointer ${
                  active
                    ? "bg-white text-black border-white shadow-md"
                    : "bg-zinc-950 border-white/15 text-zinc-400 hover:border-white/40 hover:text-white"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Price Range Slider */}
      <FilterGroup title="Max Price">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="text-zinc-500">₹0</span>
            <span style={{ color: "var(--accent-color)" }}>
              {formatInr(filters.maxPrice)}
            </span>
          </div>
          <input
            type="range"
            min={300}
            max={2500}
            step={50}
            value={filters.maxPrice}
            onChange={(e) =>
              onChange({ ...filters, maxPrice: Number(e.target.value) })
            }
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
      </FilterGroup>

      {/* Categories */}
      <FilterGroup title="Categories">
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const checked = filters.categories.includes(cat);
            const count = products.filter((p) => p.category === cat).length;
            return (
              <label
                key={cat}
                className="flex cursor-pointer items-center justify-between py-1 px-2 rounded-lg hover:bg-white/5 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle("categories", cat)}
                    className="rounded accent-amber-400 cursor-pointer"
                  />
                  <span>{cat}</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
      </FilterGroup>

      {/* Colors */}
      <FilterGroup title="Colors">
        <div className="flex flex-wrap gap-1.5">
          {colors.map((color) => {
            const active = filters.colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggle("colors", color)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  active
                    ? "bg-amber-400 text-black border-amber-400 font-bold"
                    : "bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {active && "✓ "}
                {color}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>
      {children}
    </div>
  );
}
