"use client";

import type { ReactNode } from "react";
import type { ProductDTO, Size } from "@/lib/product";
import { formatInr, SIZES } from "@/lib/product";
import { RotateCcw, Flame, Sparkles } from "lucide-react";

export type Filters = {
  genders: string[];
  types: string[];
  fits: string[];
  sizes: Size[];
  colors: string[];
  maxPrice: number;
};

export const EMPTY_FILTERS: Filters = {
  genders: [],
  types: [],
  fits: [],
  sizes: [],
  colors: [],
  maxPrice: 2500,
};

export const FIT_OPTIONS = [
  "Oversized",
  "Classic Fit",
  "Crop Top",
  "Boyfriend Fit",
  "Sweatshirts",
  "Hoodies",
] as const;

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

  const totalActive =
    filters.genders.length +
    filters.types.length +
    filters.fits.length +
    filters.sizes.length +
    filters.colors.length +
    (filters.maxPrice < 2500 ? 1 : 0);

  function toggle<K extends "genders" | "types" | "fits" | "sizes" | "colors">(
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
    <aside className="space-y-5 text-sm bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xs">
      {/* Header with reset */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <span className="text-xs font-black uppercase tracking-widest text-zinc-900">
          Filters
        </span>
        {totalActive > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Clear ({totalActive})
          </button>
        )}
      </div>

      {/* Gender / Department */}
      <FilterGroup title="Department">
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "men", label: "Men", icon: Flame },
            { id: "women", label: "Women", icon: Sparkles },
          ].map((g) => {
            const active = filters.genders.includes(g.id);
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggle("genders", g.id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                  active
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-zinc-400"}`} />
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Tee Type (Plain / Printed) */}
      <FilterGroup title="Tee Type">
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "plain", label: "Plain Tee" },
            { id: "printed", label: "Printed Tee" },
          ].map((t) => {
            const active = filters.types.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle("types", t.id)}
                className={`py-2 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-center transition-all border cursor-pointer ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Fit & Silhouette */}
      <FilterGroup title="Fit & Silhouette">
        <div className="space-y-1.5">
          {FIT_OPTIONS.map((fit) => {
            const checked = filters.fits.includes(fit);
            // Count matching in current products list
            const count = products.filter((p) => {
              if (fit === "Classic Fit") {
                return p.category === "Classic Fit" || p.title.toLowerCase().includes("classic");
              }
              if (fit === "Oversized") {
                return p.category === "Oversized" || p.title.toLowerCase().includes("oversized");
              }
              return p.category.toLowerCase().includes(fit.toLowerCase()) || p.title.toLowerCase().includes(fit.toLowerCase());
            }).length;

            return (
              <label
                key={fit}
                className="flex cursor-pointer items-center justify-between py-1 px-1.5 rounded-lg hover:bg-zinc-50 text-xs text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle("fits", fit)}
                    className="rounded accent-emerald-600 cursor-pointer w-3.5 h-3.5"
                  />
                  <span className="font-medium">{fit === "Classic Fit" ? "Regular / Classic Fit" : fit}</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
      </FilterGroup>

      {/* Size Pills */}
      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggle("sizes", size)}
                className={`min-w-10 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  active
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                    : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-500 hover:text-zinc-900"
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
          <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
            <span className="text-zinc-400">?0</span>
            <span className="text-emerald-600 font-black">
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
            className="w-full accent-emerald-600 cursor-pointer"
          />
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
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                    : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
                }`}
              >
                {active && "? "}
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
      <h3 className="text-xs font-bold text-zinc-900 flex items-center justify-between">
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}
