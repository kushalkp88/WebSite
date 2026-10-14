"use client";

import { useState } from "react";
import Image from "next/image";
import { Ruler, Sparkles, Image as ImageIcon, Table as TableIcon } from "lucide-react";

export type SizeCategory = "oversized" | "regular" | "crop-top" | "hoodie" | "sweatshirt";

export interface MeasurementRow {
  label: string;
  values: Record<string, string | number>;
}

export interface SizeChartData {
  id: SizeCategory;
  label: string;
  title: string;
  image: string;
  sizes: string[];
  rows: MeasurementRow[];
  fitNote: string;
}

export const ALL_SIZE_CHARTS: Record<SizeCategory, SizeChartData> = {
  oversized: {
    id: "oversized",
    label: "Oversized Fit",
    title: "SIZE CHART - OVERSIZED (IN INCHES)",
    image: "/size-charts/size-chart-oversized.png",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rows: [
      { label: "Chest (Inches)", values: { S: 41, M: 43, L: 45, XL: 47, XXL: 49 } },
      { label: "Length (Inches)", values: { S: 27, M: 28, L: 29, XL: 30, XXL: 31 } },
      { label: "Sleeve Length (Inches)", values: { S: 8.5, M: 9.5, L: 10.5, XL: 11.5, XXL: 12.5 } },
    ],
    fitNote:
      "Signature streetwear drop-shoulder fit. For standard fit, size down. For intended oversized drape, order your true size.",
  },
  regular: {
    id: "regular",
    label: "Regular Fit",
    title: "SIZE CHART - REGULAR FIT (IN INCHES)",
    image: "/size-charts/size-chart-regular.png",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rows: [
      { label: "Chest (Inches)", values: { S: 38, M: 40, L: 42, XL: 44, XXL: 46 } },
      { label: "Length (Inches)", values: { S: 26, M: 27, L: 28, XL: 29, XXL: 30 } },
      { label: "Sleeve Length (Inches)", values: { S: 7.5, M: 8, L: 8, XL: 8.5, XXL: 9 } },
    ],
    fitNote:
      "Classic tailored streetwear silhouette. Sits cleanly on shoulders and chest without excess bagginess.",
  },
  "crop-top": {
    id: "crop-top",
    label: "Crop Tops",
    title: "SIZE CHART - CROP TOPS (IN INCHES)",
    image: "/size-charts/size-chart-crop-top.png",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    rows: [
      { label: "Length (Inches)", values: { XS: 15.5, S: 16.5, M: 17.5, L: 18.5, XL: 19.5, "2XL": 20.5 } },
      { label: "Chest / Bust (Inches)", values: { XS: 32, S: 34, M: 36, L: 38, XL: 40, "2XL": 42 } },
      { label: "Shoulder (Inches)", values: { XS: 14.5, S: 15.5, M: 16.5, L: 17.5, XL: 18.5, "2XL": 19.5 } },
      { label: "Sleeve Open (Inches)", values: { XS: 5, S: 5.5, M: 5.5, L: 6, XL: 6.5, "2XL": 7 } },
      { label: "Sleeve Length (Inches)", values: { XS: 5, S: 5, M: 5.5, L: 6, XL: 6.5, "2XL": 7 } },
    ],
    fitNote:
      "Boxy cropped silhouette designed to sit right at the high waistline with relaxed room in the chest.",
  },
  hoodie: {
    id: "hoodie",
    label: "Hoodie",
    title: "SIZE CHART - HOODIE (IN INCHES)",
    image: "/size-charts/size-chart-hoodie.png",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    rows: [
      { label: "Chest (Inches)", values: { S: 40, M: 42, L: 44, XL: 46, "2XL": 48, "3XL": 50 } },
      { label: "Total Length (Inches)", values: { S: 26, M: 27, L: 28, XL: 29, "2XL": 30, "3XL": 31 } },
      { label: "Shoulder (Inches)", values: { S: 17, M: 18, L: 19, XL: 20, "2XL": 21, "3XL": 22 } },
      { label: "Sleeve Length Fleece (Inches)", values: { S: 21.5, M: 22.5, L: 23.5, XL: 24.5, "2XL": 25.5, "3XL": 26.5 } },
      { label: "Fleece Length (Inches)", values: { S: 23.5, M: 24.5, L: 25.5, XL: 26.5, "2XL": 27.5, "3XL": 28.5 } },
      { label: "Derby Length (Inches)", values: { S: 2.5, M: 2.5, L: 2.5, XL: 2.5, "2XL": 2.5, "3XL": 2.5 } },
      { label: "Sleeve Length Derby (Inches)", values: { S: 2.5, M: 2.5, L: 2.5, XL: 2.5, "2XL": 2.5, "3XL": 2.5 } },
      { label: "Sleeve Opening (Inches)", values: { S: 3.5, M: 4, L: 4, XL: 4.5, "2XL": 4.5, "3XL": 5 } },
      { label: "Pocket Width at Bottom (Inches)", values: { S: 12, M: 12.5, L: 13, XL: 13.5, "2XL": 14, "3XL": 14.5 } },
      { label: "Pocket Height (Inches)", values: { S: 7, M: 7.5, L: 8, XL: 8.5, "2XL": 9, "3XL": 9.5 } },
      { label: "Hood Height (Inches)", values: { S: 13, M: 14, L: 15, XL: 16, "2XL": 17, "3XL": 18 } },
      { label: "Hood Width (Inches)", values: { S: 10, M: 10.5, L: 11, XL: 11.5, "2XL": 12, "3XL": 12.5 } },
      { label: "Cuff Open (Inches)", values: { S: 2.5, M: 3, L: 3, XL: 3.5, "2XL": 3.5, "3XL": 4 } },
    ],
    fitNote:
      "Heavyweight 400 GSM brushed fleece with double-layered hood and front kangaroo pouch.",
  },
  sweatshirt: {
    id: "sweatshirt",
    label: "Sweatshirt",
    title: "SIZE CHART - SWEATSHIRT (IN INCHES)",
    image: "/size-charts/size-chart-sweatshirt.png",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    rows: [
      { label: "Chest (Inches)", values: { S: 40, M: 42, L: 44, XL: 46, "2XL": 48, "3XL": 50 } },
      { label: "Fleece Length (Inches)", values: { S: 23.5, M: 24.5, L: 25.5, XL: 26.5, "2XL": 27.5, "3XL": 28.5 } },
      { label: "Derby Length (Inches)", values: { S: 2.5, M: 2.5, L: 2.5, XL: 2.5, "2XL": 2.5, "3XL": 2.5 } },
      { label: "Shoulder (Inches)", values: { S: 17, M: 18, L: 19, XL: 20, "2XL": 21, "3XL": 22 } },
      { label: "Sleeve Length Fleece (Inches)", values: { S: 21.5, M: 22.5, L: 23.5, XL: 24.5, "2XL": 25.5, "3XL": 26.5 } },
      { label: "Sleeve Derby Length (Inches)", values: { S: 2.5, M: 2.5, L: 2.5, XL: 2.5, "2XL": 2.5, "3XL": 2.5 } },
      { label: "Sleeve Opening (Inches)", values: { S: 3.5, M: 4, L: 4, XL: 4.5, "2XL": 4.5, "3XL": 5 } },
      { label: "Pocket Width at Bottom (Inches)", values: { S: 12, M: 12.5, L: 13, XL: 13.5, "2XL": 14, "3XL": 14.5 } },
      { label: "Pocket Height (Inches)", values: { S: 7, M: 7.5, L: 8, XL: 8.5, "2XL": 9, "3XL": 9.5 } },
      { label: "Cuff Open (Inches)", values: { S: 2.5, M: 3, L: 3, XL: 3.5, "2XL": 3.5, "3XL": 4 } },
    ],
    fitNote:
      "Heavyweight crewneck pullover with ribbed comfort cuffs, waist derby, and drop-shoulder design.",
  },
};

export function detectSizeCategory(category?: string, title?: string): SizeCategory {
  const combined = `${category ?? ""} ${title ?? ""}`.toLowerCase();
  if (combined.includes("hoodie")) return "hoodie";
  if (combined.includes("sweatshirt")) return "sweatshirt";
  if (combined.includes("crop")) return "crop-top";
  if (combined.includes("regular") || combined.includes("classic")) return "regular";
  return "oversized";
}

export function SizeGuide({
  initialCategory,
  selectedSize,
}: {
  initialCategory?: SizeCategory;
  selectedSize?: string;
}) {
  const [activeTab, setActiveTab] = useState<SizeCategory>(initialCategory ?? "oversized");
  const [viewMode, setViewMode] = useState<"table" | "diagram">("table");

  const chart = ALL_SIZE_CHARTS[activeTab];

  return (
    <div className="mt-3 space-y-4 text-xs text-zinc-700 animate-fade-in">
      {/* Category Tabs: Oversized, Regular, Crop Top, Hoodie, Sweatshirt */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
        {(Object.keys(ALL_SIZE_CHARTS) as SizeCategory[]).map((catKey) => {
          const item = ALL_SIZE_CHARTS[catKey];
          const isActive = activeTab === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setActiveTab(catKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Header with Title, Unit Badge (INCHES), and View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-black text-xs sm:text-sm tracking-tight text-zinc-900 uppercase">
            {chart.title}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900 shadow-2xs">
            <Ruler size={11} className="text-amber-700" />
            <span>All Measurements in Inches (&quot;)</span>
          </span>
        </div>

        {/* View Mode Toggle: Interactive Table vs Garment Diagram */}
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-zinc-900 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <TableIcon size={12} />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("diagram")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              viewMode === "diagram"
                ? "bg-white text-zinc-900 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <ImageIcon size={12} />
            <span>Garment Diagram</span>
          </button>
        </div>
      </div>

      {/* View Mode Content */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-white text-[11px] font-black uppercase tracking-wider">
                <th className="p-2.5 min-w-[150px] border-r border-zinc-800">
                  Measurement (Inches &quot;)
                </th>
                {chart.sizes.map((sz) => {
                  const isSelected = selectedSize?.toUpperCase() === sz.toUpperCase();
                  return (
                    <th
                      key={sz}
                      className={`p-2.5 text-center min-w-[50px] border-r border-zinc-800 last:border-r-0 ${
                        isSelected ? "bg-emerald-500 text-black font-black" : ""
                      }`}
                    >
                      {sz}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {chart.rows.map((row, idx) => (
                <tr
                  key={row.label}
                  className={`transition-colors hover:bg-zinc-50/80 ${
                    idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"
                  }`}
                >
                  <td className="p-2.5 font-bold text-zinc-900 border-r border-zinc-200">
                    {row.label}
                  </td>
                  {chart.sizes.map((sz) => {
                    const isSelected = selectedSize?.toUpperCase() === sz.toUpperCase();
                    const val = row.values[sz] ?? "-";
                    return (
                      <td
                        key={sz}
                        className={`p-2.5 text-center border-r border-zinc-200 last:border-r-0 font-medium ${
                          isSelected
                            ? "bg-emerald-50/70 font-black text-emerald-900"
                            : "text-zinc-700"
                        }`}
                      >
                        {val}
                        <span className="text-[10px] text-zinc-400 ml-0.5">&quot;</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Garment Diagram View */
        <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white p-2 sm:p-4 flex flex-col items-center">
          <div className="relative w-full max-w-xl aspect-[16/9] min-h-[220px]">
            <Image
              src={chart.image}
              alt={chart.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500 text-center font-medium">
            Visual reference showing measuring points on the garment. All specs indicated in <strong>inches</strong>.
          </p>
        </div>
      )}

      {/* Helpful fit notes */}
      <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
        <p className="font-semibold text-zinc-900">
          💡 <span className="underline">Fit Recommendation:</span> {chart.fitNote}
        </p>
        <p className="text-zinc-500 italic">
          Measurements represent garment dimensions laid flat. Please allow a standard tolerance of ±0.5 inches due to manual textile production.
        </p>
      </div>
    </div>
  );
}
