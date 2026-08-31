"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Boxes, 
  ExternalLink, 
  Plus, 
  Palette, 
  Edit2,
  CheckCircle2,
  UploadCloud
} from "lucide-react";
import type { ProductDTO } from "@/lib/product";
import { formatInr, isOutOfStock, totalStock } from "@/lib/product";

interface OverviewPanelProps {
  products: ProductDTO[];
  onAddProduct: () => void;
  onEditProduct: (p: ProductDTO) => void;
  onGoToTheme: () => void;
  onGoToMedia?: () => void;
}

export function OverviewPanel({
  products,
  onAddProduct,
  onEditProduct,
  onGoToTheme,
  onGoToMedia,
}: OverviewPanelProps) {
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const visibleProducts = products.filter((p) => p.isVisible).length;
    const outOfStockItems = products.filter((p) => isOutOfStock(p));
    const lowStockItems = products.filter((p) => {
      const stock = totalStock(p);
      return stock > 0 && stock <= 10;
    });

    const totalUnits = products.reduce((acc, p) => acc + totalStock(p), 0);
    const catalogValue = products.reduce(
      (acc, p) => acc + (p.discountPrice ?? p.price) * totalStock(p),
      0
    );

    const categories = Array.from(new Set(products.map((p) => p.category)));
    const categoryCounts = categories.map((cat) => ({
      name: cat,
      count: products.filter((p) => p.category === cat).length,
    }));

    return {
      totalProducts,
      visibleProducts,
      outOfStockItems,
      lowStockItems,
      totalUnits,
      catalogValue,
      categoryCounts,
    };
  }, [products]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/60 rounded-2xl p-6 shadow-xl text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Live Storefront Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            INKDROP Admin Command Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor inventory health, manage products, and customize real-time storefront branding.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {onGoToMedia && (
            <button
              type="button"
              onClick={onGoToMedia}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer focus:ring-2 focus:ring-amber-400 focus:outline-none"
              aria-label="Upload and manage image assets"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Images
            </button>
          )}
          <button
            type="button"
            onClick={onAddProduct}
            className="flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer focus:ring-2 focus:ring-zinc-400 focus:outline-none"
            aria-label="Add new product"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-600/50 font-medium px-4 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer focus:ring-2 focus:ring-zinc-400 focus:outline-none"
            aria-label="Open live storefront in new tab"
          >
            <ExternalLink className="w-4 h-4" />
            View Store
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Total Products
            </span>
            <div className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-100">
              {stats.totalProducts}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              ({stats.visibleProducts} visible)
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Across {stats.categoryCounts.length} active categories
          </div>
        </div>

        {/* Card 2: Total Units In Stock */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Units In Stock
            </span>
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-100">
              {stats.totalUnits}
            </span>
            <span className="text-xs text-blue-400 font-medium">pieces</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Combined stock (S, M, L, XL)
          </div>
        </div>

        {/* Card 3: Catalog Retail Value */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Inventory Value
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">
              {formatInr(stats.catalogValue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Estimated gross retail stock value
          </div>
        </div>

        {/* Card 4: Inventory Alerts */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Stock Warnings
            </span>
            <div
              className={`p-2.5 rounded-xl ${
                stats.outOfStockItems.length > 0
                  ? "bg-red-950/60 border border-red-800/40 text-red-400"
                  : "bg-amber-950/60 border border-amber-800/40 text-amber-400"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${
                stats.outOfStockItems.length > 0 ? "text-red-400" : "text-amber-300"
              }`}
            >
              {stats.outOfStockItems.length + stats.lowStockItems.length}
            </span>
            <span className="text-xs text-zinc-400">items need attention</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400 flex items-center gap-2">
            <span className="text-red-400 font-semibold">{stats.outOfStockItems.length} OOS</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{stats.lowStockItems.length} Low</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Actionable Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock & Attention List */}
        <div className="lg:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Inventory Priority Watchlist
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Items with zero or low stock requiring restock.
              </p>
            </div>
            <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full font-medium">
              {stats.outOfStockItems.length + stats.lowStockItems.length} Items
            </span>
          </div>

          {stats.outOfStockItems.length === 0 && stats.lowStockItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
              <p className="font-medium text-zinc-200">All inventory levels are healthy!</p>
              <p className="text-xs text-zinc-500 mt-1">No products are currently out of stock or low.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800 overflow-hidden">
              {[...stats.outOfStockItems, ...stats.lowStockItems].slice(0, 5).map((p) => {
                const stock = totalStock(p);
                const isOos = stock === 0;
                return (
                  <div
                    key={p.id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-800/40 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {p.imageUrls[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrls[0]}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {p.category} • {formatInr(p.discountPrice ?? p.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          isOos
                            ? "bg-red-950/80 text-red-400 border border-red-800/50"
                            : "bg-amber-950/80 text-amber-300 border border-amber-800/50"
                        }`}
                      >
                        {isOos ? "Out of Stock" : `${stock} Left`}
                      </span>
                      <button
                        type="button"
                        onClick={() => onEditProduct(p)}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                        aria-label={`Edit stock for ${p.title}`}
                      >
                        <Edit2 className="w-3 h-3" />
                        Restock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Category Distribution & Quick Brand Settings */}
        <div className="space-y-6">
          {/* Categories Card */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-zinc-100 mb-3">
              Categories
            </h2>
            <div className="space-y-2.5">
              {stats.categoryCounts.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-sm py-1.5 px-3 bg-zinc-800/40 rounded-xl"
                >
                  <span className="font-medium text-zinc-300">{cat.name}</span>
                  <span className="text-xs font-semibold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                    {cat.count} {cat.count === 1 ? "product" : "products"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Customization Banner */}
          <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-amber-400">
              <Palette className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Theme & Branding</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Update storefront banner copy, marquee announcements, background tone, and brand accent colors with live preview.
            </p>
            <button
              type="button"
              onClick={onGoToTheme}
              className="mt-4 w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Open Theme Customizer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
