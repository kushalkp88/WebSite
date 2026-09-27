"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  X, 
  LayoutGrid, 
  List, 
  AlertCircle,
  Image as ImageIcon,
  ChevronDown,
  Upload,
  FolderOpen,
  Sparkles,
  Copy,
  Shirt,
  Check,
  Zap,
  Layers,
  ChevronRight,
  Minus
} from "lucide-react";
import type { ProductDTO } from "@/lib/product";
import { 
  formatInr, 
  isOutOfStock, 
  totalStock, 
  percentOff, 
  PRODUCT_CATEGORIES,
  getCleanImageUrl,
  getImageColorTag,
  getTeeColor
} from "@/lib/product";

const AVAILABLE_BADGES = [
  "BEST SELLER",
  "LIMITED EDITION",
  "NEW DROP",
  "OVERSIZED FIT",
  "HEAVYWEIGHT",
  "ACID WASH",
  "RESTOCKED"
];

const blankProduct: Omit<ProductDTO, "id"> = {
  title: "",
  slug: "",
  price: 1499,
  discountPrice: 599,
  imageUrls: [""],
  badges: [],
  color: "Black",
  category: "Regular/Classic Fit",
  section: "men",
  stockS: 10,
  stockM: 10,
  stockL: 10,
  stockXL: 10,
  isVisible: true,
  rating: 4.8,
  reviewCount: 12,
};

type StockFilter = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
type VisibilityFilter = "ALL" | "VISIBLE" | "HIDDEN";
type SortBy = "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "STOCK_ASC" | "STOCK_DESC" | "TITLE";

interface ProductManagerProps {
  initial: ProductDTO[];
  editingTarget?: ProductDTO | null;
  creatingTarget?: boolean;
  initialCreateImageUrl?: string | null;
  onClearTargets?: () => void;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}

export function ProductManager({
  initial,
  editingTarget = null,
  creatingTarget = false,
  initialCreateImageUrl = null,
  onClearTargets,
  onShowToast,
}: ProductManagerProps) {
  const [products, setProducts] = useState<ProductDTO[]>(initial);
  const [editing, setEditing] = useState<ProductDTO | null>(editingTarget);
  const [creating, setCreating] = useState(creatingTarget);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<StockFilter>("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortBy>("NEWEST");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [deleteCandidate, setDeleteCandidate] = useState<ProductDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [prevEditingTarget, setPrevEditingTarget] = useState(editingTarget);
  const [prevCreatingTarget, setPrevCreatingTarget] = useState(creatingTarget);

  if (editingTarget !== prevEditingTarget) {
    setPrevEditingTarget(editingTarget);
    setEditing(editingTarget);
  }

  if (creatingTarget !== prevCreatingTarget) {
    setPrevCreatingTarget(creatingTarget);
    setCreating(creatingTarget);
  }

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    return list;
  }, [products]);

  async function refreshProducts() {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      onShowToast("Failed to refresh product list", "error");
    }
  }

  async function handleToggleVisibility(product: ProductDTO) {
    const nextState = !product.isVisible;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isVisible: nextState } : p))
    );

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextState }),
      });
      if (!res.ok) throw new Error();
      onShowToast(
        `"${product.title}" is now ${nextState ? "visible" : "hidden"} on storefront`,
        "success"
      );
    } catch {
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isVisible: product.isVisible } : p))
      );
      onShowToast("Failed to update visibility", "error");
    }
  }

  async function confirmDelete() {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteCandidate.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onShowToast(`Deleted "${deleteCandidate.title}"`, "success");
      setDeleteCandidate(null);
      await refreshProducts();
    } catch {
      onShowToast("Failed to delete product", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchColor = p.color.toLowerCase().includes(q);
          const matchSection = (p.section ?? "").toLowerCase().includes(q);
          if (!matchTitle && !matchCategory && !matchColor && !matchSection) return false;
        }

        if (sectionFilter !== "ALL" && (p.section ?? "men").toLowerCase() !== sectionFilter.toLowerCase()) {
          return false;
        }

        if (categoryFilter !== "ALL" && p.category !== categoryFilter) {
          return false;
        }

        const stock = totalStock(p);
        if (stockFilter === "OUT_OF_STOCK" && stock > 0) return false;
        if (stockFilter === "LOW_STOCK" && (stock === 0 || stock > 10)) return false;
        if (stockFilter === "IN_STOCK" && stock === 0) return false;

        if (visibilityFilter === "VISIBLE" && !p.isVisible) return false;
        if (visibilityFilter === "HIDDEN" && p.isVisible) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") return 0;
        if (sortBy === "PRICE_ASC") {
          const priceA = a.discountPrice ?? a.price;
          const priceB = b.discountPrice ?? b.price;
          return priceA - priceB;
        }
        if (sortBy === "PRICE_DESC") {
          const priceA = a.discountPrice ?? a.price;
          const priceB = b.discountPrice ?? b.price;
          return priceB - priceA;
        }
        if (sortBy === "STOCK_ASC") return totalStock(a) - totalStock(b);
        if (sortBy === "STOCK_DESC") return totalStock(b) - totalStock(a);
        if (sortBy === "TITLE") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [products, searchQuery, sectionFilter, categoryFilter, stockFilter, visibilityFilter, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Products & Inventory
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your catalog items, sizing stocks, retail pricing, and storefront display.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer focus:ring-2 focus:ring-zinc-400"
          aria-label="Add new product to catalog"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filter, Search & View Toolbar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, category, or color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-xl pl-10 pr-9 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Section Dropdown */}
            <div className="relative">
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="appearance-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-500 cursor-pointer"
                aria-label="Filter by section"
              >
                <option value="ALL">All Sections</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex (Both)</option>
                <option value="kids">Kids</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-500 cursor-pointer"
                aria-label="Filter by category"
              >
                <option value="ALL">All Categories ({products.length})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Stock Dropdown */}
            <div className="relative">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                className="appearance-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-500 cursor-pointer"
                aria-label="Filter by stock status"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock (≤10)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Visibility Dropdown */}
            <div className="relative">
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value as VisibilityFilter)}
                className="appearance-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-500 cursor-pointer"
                aria-label="Filter by storefront visibility"
              >
                <option value="ALL">All Statuses</option>
                <option value="VISIBLE">Visible on Store</option>
                <option value="HIDDEN">Hidden / Draft</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="appearance-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-500 cursor-pointer"
                aria-label="Sort products"
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="STOCK_ASC">Stock: Lowest First</option>
                <option value="STOCK_DESC">Stock: Highest First</option>
                <option value="TITLE">Title: A to Z</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Table view"
                aria-label="Switch to table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Grid view"
                aria-label="Switch to grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Summary Bar */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pt-1">
          <span>
            Showing <strong className="text-zinc-200">{filteredProducts.length}</strong> of{" "}
            <strong className="text-zinc-200">{products.length}</strong> products
          </span>
          {(searchQuery || sectionFilter !== "ALL" || categoryFilter !== "ALL" || stockFilter !== "ALL" || visibilityFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSectionFilter("ALL");
                setCategoryFilter("ALL");
                setStockFilter("ALL");
                setVisibilityFilter("ALL");
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Table or Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No products found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters to find what you are looking for.
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Products Table">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Product</th>
                  <th scope="col" className="py-3.5 px-4">Price</th>
                  <th scope="col" className="py-3.5 px-4">Sizes & Stock</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Total</th>
                  <th scope="col" className="py-3.5 px-4">Badges</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Visibility</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredProducts.map((p) => {
                  const stock = totalStock(p);
                  const oos = isOutOfStock(p);
                  const discountPct = percentOff(p);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Product Info & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {p.imageUrls[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={getCleanImageUrl(p.imageUrls[0])}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-zinc-100 truncate text-sm">
                              {p.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400 flex-wrap">
                              <span className={`font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider border ${
                                (p.section ?? "").toLowerCase() === "unisex" || (p.section ?? "").toLowerCase() === "both"
                                  ? "bg-purple-950/80 text-purple-300 border-purple-700/60"
                                  : (p.section ?? "").toLowerCase() === "women"
                                  ? "bg-pink-950/80 text-pink-300 border-pink-700/60"
                                  : (p.section ?? "").toLowerCase() === "kids"
                                  ? "bg-amber-950/80 text-amber-300 border-amber-700/60"
                                  : "bg-blue-950/80 text-blue-300 border-blue-700/60"
                              }`}>
                                {(p.section ?? "").toLowerCase() === "unisex" || (p.section ?? "").toLowerCase() === "both" ? "Unisex" : p.section || "men"}
                              </span>
                              <span className="font-medium text-zinc-300">{p.category}</span>
                              <span>•</span>
                              <span>{p.color}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-100">
                            {formatInr(p.discountPrice ?? p.price)}
                          </span>
                          {p.discountPrice && p.discountPrice < p.price && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="line-through text-zinc-500">
                                {formatInr(p.price)}
                              </span>
                              <span className="text-emerald-400 font-semibold">
                                {discountPct}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sizing Breakdown Pills */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {(
                            [
                              { label: "S", count: p.stockS },
                              { label: "M", count: p.stockM },
                              { label: "L", count: p.stockL },
                              { label: "XL", count: p.stockXL },
                            ] as const
                          ).map(({ label, count }) => (
                            <span
                              key={label}
                              className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                                count === 0
                                  ? "bg-red-950/40 text-red-400 border-red-900/40 line-through opacity-70"
                                  : count <= 3
                                  ? "bg-amber-950/40 text-amber-300 border-amber-900/40"
                                  : "bg-zinc-800/80 text-zinc-300 border-zinc-700/50"
                              }`}
                              title={`${label}: ${count} available`}
                            >
                              <strong>{label}</strong>:{count}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                            oos
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : stock <= 10
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {oos ? "0 (OOS)" : stock}
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {p.badges.length > 0 ? (
                            p.badges.map((b) => (
                              <span
                                key={b}
                                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-400/20"
                              >
                                {b}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-600 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Visibility Toggle */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            p.isVisible
                              ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/80"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                          }`}
                          aria-label={`Toggle visibility for ${p.title}. Currently ${p.isVisible ? "Visible" : "Hidden"}`}
                        >
                          {p.isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Live
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Hidden
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(p);
                              setCreating(false);
                            }}
                            className="p-1.5 rounded-lg text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors cursor-pointer"
                            title="Edit product"
                            aria-label={`Edit ${p.title}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/80 border border-red-900/30 transition-colors cursor-pointer"
                            title="Delete product"
                            aria-label={`Delete ${p.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const stock = totalStock(p);
            const oos = isOutOfStock(p);
            return (
              <div
                key={p.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col group"
              >
                {/* Image header */}
                <div className="h-48 bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                  {p.imageUrls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getCleanImageUrl(p.imageUrls[0])}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-zinc-700" />
                  )}

                  {/* Badges overlay */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {p.badges.map((b) => (
                      <span
                        key={b}
                        className="text-[10px] font-bold uppercase tracking-wider bg-black/80 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded backdrop-blur-sm shadow-md"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Visibility pill */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(p)}
                    className={`absolute top-2.5 right-2.5 text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                      p.isVisible
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-700/60"
                        : "bg-zinc-900/80 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {p.isVisible ? "Visible" : "Hidden"}
                  </button>
                </div>

                {/* Card body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider border ${
                          (p.section ?? "").toLowerCase() === "unisex" || (p.section ?? "").toLowerCase() === "both"
                            ? "bg-purple-950/80 text-purple-300 border-purple-700/60"
                            : (p.section ?? "").toLowerCase() === "women"
                            ? "bg-pink-950/80 text-pink-300 border-pink-700/60"
                            : (p.section ?? "").toLowerCase() === "kids"
                            ? "bg-amber-950/80 text-amber-300 border-amber-700/60"
                            : "bg-blue-950/80 text-blue-300 border-blue-700/60"
                        }`}>
                          {(p.section ?? "").toLowerCase() === "unisex" || (p.section ?? "").toLowerCase() === "both" ? "Unisex" : p.section || "men"}
                        </span>
                        <span className="font-medium text-zinc-300">{p.category}</span>
                      </div>
                      <span>{p.color}</span>
                    </div>
                    <h3 className="font-semibold text-zinc-100 text-sm line-clamp-1">
                      {p.title}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-zinc-100">
                        {formatInr(p.discountPrice ?? p.price)}
                      </span>
                      {p.discountPrice && (
                        <span className="text-xs line-through text-zinc-500">
                          {formatInr(p.price)}
                        </span>
                      )}
                    </div>

                    {/* Stock pills */}
                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                      <span className="text-zinc-400">Total Units:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          oos
                            ? "bg-red-950 text-red-400"
                            : stock <= 10
                            ? "bg-amber-950 text-amber-300"
                            : "text-zinc-200"
                        }`}
                      >
                        {oos ? "Out of stock" : `${stock} in stock`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(p);
                        setCreating(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(p)}
                      className="p-2 rounded-xl text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/80 border border-red-900/30 transition-colors cursor-pointer"
                      aria-label={`Delete ${p.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL DRAWER */}
      {(creating || editing) && (
        <ProductModal
          product={editing}
          allProducts={products}
          initialImageUrl={initialCreateImageUrl}
          categories={categories.length ? categories : [...PRODUCT_CATEGORIES]}
          onClose={() => {
            setCreating(false);
            setEditing(null);
            onClearTargets?.();
          }}
          onShowToast={onShowToast}
          onSaved={async () => {
            setCreating(false);
            setEditing(null);
            onClearTargets?.();
            await refreshProducts();
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-lg font-bold text-white">
                  Delete Product
                </h3>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">&ldquo;{deleteCandidate.title}&rdquo;</strong> from your catalog?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// PRODUCT FORM MODAL WITH LIVE PREVIEW & COMPREHENSIVE CONTROLS
// -------------------------------------------------------------
interface ProductModalProps {
  product: ProductDTO | null;
  allProducts?: ProductDTO[];
  categories: string[];
  initialImageUrl?: string | null;
  onClose: () => void;
  onSaved: () => void;
  onShowToast?: (msg: string, type?: "success" | "error") => void;
}

type DeptType = "women" | "men" | "unisex" | "kids";

interface DeptConfig {
  category: string;
  color: string;
  price: number;
  discountPrice: number | null;
  stockS: number;
  stockM: number;
  stockL: number;
  stockXL: number;
  rating: number;
  reviewCount: number;
}

interface ImageSlot {
  url: string;
  department: DeptType;
  color?: string;
}

function ProductModal({
  product,
  allProducts,
  categories,
  initialImageUrl,
  onClose,
  onSaved,
  onShowToast,
}: ProductModalProps) {
  const isEditing = Boolean(product);

  // Find counterpart if this print already exists in the catalog in another department
  const counterpart = useMemo(() => {
    if (!product || !allProducts) return null;
    return (
      allProducts.find(
        (p) =>
          p.id !== product.id &&
          p.title.trim().toLowerCase() === product.title.trim().toLowerCase() &&
          p.section?.toLowerCase() !== product.section?.toLowerCase()
      ) || null
    );
  }, [product, allProducts]);

  // Base print info
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [badges, setBadges] = useState<string[]>(() => {
    if (!product?.badges) return [];
    try {
      return typeof product.badges === "string" ? JSON.parse(product.badges) : product.badges;
    } catch {
      return [];
    }
  });
  const [isVisible, setIsVisible] = useState(product?.isVisible ?? true);

  type DropMode = "dual_drop" | "women" | "men" | "unisex" | "kids";
  const [dropMode, setDropMode] = useState<DropMode>(() => {
    if (!product) return "dual_drop";
    if (product.section === "unisex") return "unisex";
    if (product.section === "kids") return "kids";
    return "dual_drop";
  });

  // Active department currently being edited in form sections
  const initialDept: DeptType = (product?.section?.toLowerCase() as DeptType) || "women";
  const [activeDept, setActiveDept] = useState<DeptType>(initialDept);

  // Department configurations
  const [deptConfigs, setDeptConfigs] = useState<Record<DeptType, DeptConfig>>(() => {
    const womenSource =
      product?.section?.toLowerCase() === "women"
        ? product
        : counterpart?.section?.toLowerCase() === "women"
        ? counterpart
        : null;

    const menSource =
      product?.section?.toLowerCase() === "men"
        ? product
        : counterpart?.section?.toLowerCase() === "men"
        ? counterpart
        : null;

    return {
      women: {
        category: womenSource?.category ?? "Boyfriend Fit",
        color: womenSource?.color ?? (product?.color ?? ""),
        price: womenSource?.price ?? (product?.price ?? 1499),
        discountPrice: womenSource ? womenSource.discountPrice : (product?.discountPrice ?? 599),
        stockS: womenSource?.stockS ?? (product?.stockS ?? 10),
        stockM: womenSource?.stockM ?? (product?.stockM ?? 10),
        stockL: womenSource?.stockL ?? (product?.stockL ?? 10),
        stockXL: womenSource?.stockXL ?? (product?.stockXL ?? 10),
        rating: womenSource?.rating ?? (product?.rating ?? 4.5),
        reviewCount: womenSource?.reviewCount ?? (product?.reviewCount ?? 0),
      },
      men: {
        category: menSource?.category ?? "Oversized Fit",
        color: menSource?.color ?? (product?.color ?? ""),
        price: menSource?.price ?? (product?.price ?? 1499),
        discountPrice: menSource ? menSource.discountPrice : (product?.discountPrice ?? 599),
        stockS: menSource?.stockS ?? (product?.stockS ?? 10),
        stockM: menSource?.stockM ?? (product?.stockM ?? 10),
        stockL: menSource?.stockL ?? (product?.stockL ?? 10),
        stockXL: menSource?.stockXL ?? (product?.stockXL ?? 10),
        rating: menSource?.rating ?? (product?.rating ?? 4.5),
        reviewCount: menSource?.reviewCount ?? (product?.reviewCount ?? 0),
      },
      unisex: {
        category: product?.section === "unisex" ? product.category : "Oversized Fit",
        color: product?.color ?? "",
        price: product?.price ?? 1499,
        discountPrice: product?.discountPrice ?? 599,
        stockS: 10,
        stockM: 10,
        stockL: 10,
        stockXL: 10,
        rating: 4.5,
        reviewCount: 0,
      },
      kids: {
        category: product?.section === "kids" ? product.category : "Regular/Classic Fit",
        color: product?.color ?? "",
        price: product?.price ?? 999,
        discountPrice: product?.discountPrice ?? 499,
        stockS: 10,
        stockM: 10,
        stockL: 10,
        stockXL: 10,
        rating: 4.5,
        reviewCount: 0,
      },
    };
  });

  // Image slots with department assignment and color tag
  const [images, setImages] = useState<ImageSlot[]>(() => {
    const slots: ImageSlot[] = [];
    if (product?.imageUrls?.length) {
      const pDept = (product.section?.toLowerCase() as DeptType) || initialDept;
      product.imageUrls.forEach((rawUrl) => {
        slots.push({
          url: getCleanImageUrl(rawUrl),
          department: pDept,
          color: getImageColorTag(rawUrl) || undefined,
        });
      });
    }
    if (counterpart?.imageUrls?.length) {
      const cDept = (counterpart.section?.toLowerCase() as DeptType) || "men";
      counterpart.imageUrls.forEach((rawUrl) => {
        slots.push({
          url: getCleanImageUrl(rawUrl),
          department: cDept,
          color: getImageColorTag(rawUrl) || undefined,
        });
      });
    }
    if (slots.length > 0) return slots;
    if (initialImageUrl) {
      return [{
        url: getCleanImageUrl(initialImageUrl),
        department: initialDept,
        color: getImageColorTag(initialImageUrl) || undefined,
      }];
    }
    return [{ url: "", department: initialDept }];
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOverImages, setIsDragOverImages] = useState(false);
  const [activeSlotTarget, setActiveSlotTarget] = useState<number | null>(null);
  const uploadTargetDeptRef = useRef<DeptType | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const singleSlotFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function autoSlug() {
    const s = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    setSlug(s);
  }

  function selectImageSlot(idx: number) {
    setActiveImageIndex(idx);
    const slot = images[idx];
    if (slot?.department) {
      setActiveDept(slot.department);
      onShowToast?.(`Switched to ${slot.department.toUpperCase()} drop details`, "success");
    }
  }

  function changeSlotDepartment(idx: number, newDept: DeptType) {
    const next = [...images];
    next[idx] = { ...next[idx], department: newDept };
    setImages(next);
    setActiveImageIndex(idx);
    setActiveDept(newDept);
    onShowToast?.(`Moved photo to ${newDept.toUpperCase()} drop`, "success");
  }

  function switchActiveDept(dept: DeptType) {
    setActiveDept(dept);
    const foundIdx = images.findIndex((img) => img.department === dept && img.url.trim() !== "");
    if (foundIdx !== -1) {
      setActiveImageIndex(foundIdx);
    }
  }

  // Available unique colors gathered from all department configs
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    const gather = (val?: string) => {
      if (!val) return;
      val.split(",").forEach((c) => {
        const trimmed = c.trim();
        if (trimmed && trimmed.toLowerCase() !== "standard") set.add(trimmed);
      });
    };
    gather(deptConfigs.women.color);
    gather(deptConfigs.men.color);
    gather(deptConfigs.unisex.color);
    gather(deptConfigs.kids.color);
    return Array.from(set);
  }, [deptConfigs]);

  function detectColorFromFilename(filename: string, candidateColors: string[]): string | undefined {
    const lower = filename.toLowerCase();
    for (const color of candidateColors) {
      if (lower.includes(color.toLowerCase())) return color;
      const words = color.toLowerCase().split(/\s+/);
      for (const w of words) {
        if (w.length >= 3 && lower.includes(w)) return color;
      }
    }
    return undefined;
  }

  function changeSlotColor(idx: number, newColor: string) {
    const next = [...images];
    next[idx] = { ...next[idx], color: newColor.trim() || undefined };
    setImages(next);
  }

  function copyConfigFrom(sourceDept: DeptType) {
    const src = deptConfigs[sourceDept];
    setDeptConfigs((prev) => ({
      ...prev,
      [activeDept]: {
        ...prev[activeDept],
        price: src.price,
        discountPrice: src.discountPrice,
        color: src.color,
        category: src.category,
        stockS: src.stockS,
        stockM: src.stockM,
        stockL: src.stockL,
        stockXL: src.stockXL,
      },
    }));
    onShowToast?.(`Copied pricing and stock from ${sourceDept.toUpperCase()}!`, "success");
  }

  function updateActiveDeptConfig(patch: Partial<DeptConfig>) {
    setDeptConfigs((prev) => ({
      ...prev,
      [activeDept]: { ...prev[activeDept], ...patch },
    }));
  }

  function setAllStock(val: number) {
    updateActiveDeptConfig({
      stockS: val,
      stockM: val,
      stockL: val,
      stockXL: val,
    });
    onShowToast?.(`Set all sizes for ${activeDept.toUpperCase()} to ${val} units`, "success");
  }

  async function handleUploadFiles(
    files: FileList | File[], 
    targetSlot?: number | null,
    targetDept?: DeptType
  ) {
    if (!files || files.length === 0) return;

    const deptToAssign = targetDept || uploadTargetDeptRef.current || activeDept;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploadingImage(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let data: { success?: boolean; error?: string; urls?: string[] } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        throw new Error(`Upload failed (HTTP ${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      const uploadedUrls = data.urls || [];
      if (uploadedUrls.length === 0) return;

      if (targetSlot !== undefined && targetSlot !== null && targetSlot >= 0) {
        const file0 = files[0];
        const color0 = file0 ? detectColorFromFilename(file0.name, availableColors) : undefined;
        const next = [...images];
        next[targetSlot] = {
          url: uploadedUrls[0],
          department: deptToAssign,
          color: color0 || next[targetSlot]?.color,
        };
        if (uploadedUrls.length > 1) {
          uploadedUrls.slice(1).forEach((u, i) => {
            const f = files[i + 1];
            const c = f ? detectColorFromFilename(f.name, availableColors) : undefined;
            next.push({ url: u, department: deptToAssign, color: c });
          });
        }
        setImages(next);
        setActiveImageIndex(targetSlot);
      } else {
        const existingValid = images.filter((img) => img.url.trim() !== "");
        const newSlots: ImageSlot[] = uploadedUrls.map((u, i) => {
          const f = files[i];
          const c = f ? detectColorFromFilename(f.name, availableColors) : undefined;
          return {
            url: u,
            department: deptToAssign,
            color: c,
          };
        });
        const combined = [...existingValid, ...newSlots];
        setImages(combined.length ? combined : [{ url: "", department: deptToAssign }]);
        setActiveImageIndex(existingValid.length);
      }

      setActiveDept(deptToAssign);

      onShowToast?.(
        `Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} to ${deptToAssign.toUpperCase()} drop!`,
        "success"
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image";
      setErrorMsg(message);
      onShowToast?.(message, "error");
    } finally {
      setUploadingImage(false);
      setActiveSlotTarget(null);
      uploadTargetDeptRef.current = null;
      if (multiFileInputRef.current) multiFileInputRef.current.value = "";
      if (singleSlotFileInputRef.current) singleSlotFileInputRef.current.value = "";
    }
  }

  function handleImageUrlChange(idx: number, val: string) {
    const next = [...images];
    next[idx] = { ...next[idx], url: val };
    setImages(next);
  }

  function addImageSlot() {
    const next = [...images, { url: "", department: activeDept, color: availableColors[0] || undefined }];
    setImages(next);
    setActiveImageIndex(next.length - 1);
  }

  function removeImageSlot(idx: number) {
    if (images.length <= 1) {
      setImages([{ url: "", department: activeDept }]);
      setActiveImageIndex(0);
    } else {
      const next = images.filter((_, i) => i !== idx);
      setImages(next);
      setActiveImageIndex(Math.min(activeImageIndex, next.length - 1));
    }
  }

  function toggleBadge(b: string) {
    setBadges((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  const activeSlot = images[activeImageIndex];
  const previewImageUrl =
    (activeSlot && activeSlot.department === activeDept && activeSlot.url?.trim())
      ? activeSlot.url
      : images.find((img) => img.department === activeDept && img.url?.trim())?.url
      || activeSlot?.url?.trim()
      || images.find((img) => img.url?.trim())?.url
      || "";

  const currentConfig = deptConfigs[activeDept];
  const currentTotalStock =
    currentConfig.stockS + currentConfig.stockM + currentConfig.stockL + currentConfig.stockXL;
  const currentDiscountPct =
    currentConfig.discountPrice && currentConfig.discountPrice < currentConfig.price
      ? Math.round((1 - currentConfig.discountPrice / currentConfig.price) * 100)
      : 0;

  const validImages = images.filter((img) => img.url.trim() !== "");
  const menImagesCount = validImages.filter((img) => img.department === "men").length;
  const womenImagesCount = validImages.filter((img) => img.department === "women").length;
  const isDualDrop = dropMode === "dual_drop";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Product title is required");
      return;
    }

    setBusy(true);

    const baseSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 50);

    const formatSlotUrl = (slot: ImageSlot) => {
      const clean = getCleanImageUrl(slot.url.trim());
      if (!clean) return "";
      if (slot.color && slot.color.trim()) {
        return `${clean}#color=${encodeURIComponent(slot.color.trim())}`;
      }
      return clean;
    };

    if (dropMode === "dual_drop") {
      try {
        const menImgs = validImages.filter((img) => img.department === "men").map(formatSlotUrl);
        const womenImgs = validImages.filter((img) => img.department === "women").map(formatSlotUrl);
        const allImgs = validImages.map(formatSlotUrl);

        const finalMenImgs = menImgs.length ? menImgs : allImgs;
        const finalWomenImgs = womenImgs.length ? womenImgs : allImgs;

        // Fetch current products list to find existing counterparts
        const allRes = await fetch("/api/products");
        const allProductsList: ProductDTO[] = allRes.ok ? await allRes.json() : (allProducts || []);

        const existingMen = allProductsList.find(
          (p) =>
            p.section?.toLowerCase() === "men" &&
            (p.title.trim().toLowerCase() === title.trim().toLowerCase() ||
              p.slug === `${baseSlug}-men` ||
              (product && product.id === p.id && product.section === "men"))
        );

        const existingWomen = allProductsList.find(
          (p) =>
            p.section?.toLowerCase() === "women" &&
            (p.title.trim().toLowerCase() === title.trim().toLowerCase() ||
              p.slug === `${baseSlug}-women` ||
              (product && product.id === p.id && product.section === "women"))
        );

        const menSlug = existingMen?.slug || (product?.section === "men" ? product.slug : `${baseSlug}-men`);
        const womenSlug = existingWomen?.slug || (product?.section === "women" ? product.slug : `${baseSlug}-women`);

        const menPayload = {
          title,
          slug: menSlug,
          section: "men",
          category: deptConfigs.men.category,
          color: deptConfigs.men.color.trim() || "Standard",
          price: Number(deptConfigs.men.price) || 599,
          discountPrice: deptConfigs.men.discountPrice ? Number(deptConfigs.men.discountPrice) : null,
          stockS: Number(deptConfigs.men.stockS) || 0,
          stockM: Number(deptConfigs.men.stockM) || 0,
          stockL: Number(deptConfigs.men.stockL) || 0,
          stockXL: Number(deptConfigs.men.stockXL) || 0,
          rating: Number(deptConfigs.men.rating) || 4.5,
          reviewCount: Number(deptConfigs.men.reviewCount) || 0,
          imageUrls: finalMenImgs,
          badges,
          isVisible,
        };

        const womenPayload = {
          title,
          slug: womenSlug,
          section: "women",
          category: deptConfigs.women.category,
          color: deptConfigs.women.color.trim() || "Standard",
          price: Number(deptConfigs.women.price) || 599,
          discountPrice: deptConfigs.women.discountPrice ? Number(deptConfigs.women.discountPrice) : null,
          stockS: Number(deptConfigs.women.stockS) || 0,
          stockM: Number(deptConfigs.women.stockM) || 0,
          stockL: Number(deptConfigs.women.stockL) || 0,
          stockXL: Number(deptConfigs.women.stockXL) || 0,
          rating: Number(deptConfigs.women.rating) || 4.5,
          reviewCount: Number(deptConfigs.women.reviewCount) || 0,
          imageUrls: finalWomenImgs,
          badges,
          isVisible,
        };

        const requests: Promise<Response>[] = [];

        // Save Men
        if (existingMen) {
          requests.push(
            fetch(`/api/products/${existingMen.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(menPayload),
            })
          );
        } else {
          requests.push(
            fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(menPayload),
            })
          );
        }

        // Save Women
        if (existingWomen) {
          requests.push(
            fetch(`/api/products/${existingWomen.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(womenPayload),
            })
          );
        } else {
          requests.push(
            fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(womenPayload),
            })
          );
        }

        const responses = await Promise.all(requests);
        if (responses.some((r) => !r.ok)) {
          throw new Error("Failed to publish both drops. Please check fields and try again.");
        }

        onShowToast?.(
          `Published both Men's (${deptConfigs.men.category}) & Women's (${deptConfigs.women.category}) drops for "${title}"!`,
          "success"
        );
        onSaved();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setErrorMsg(message);
      } finally {
        setBusy(false);
      }
      return;
    }

    // Single product flow
    try {
      const targetDept: DeptType = (dropMode as DeptType) || activeDept;
      const deptSlots = validImages.filter((img) => img.department === targetDept);
      const finalImgs = (deptSlots.length ? deptSlots : validImages).map(formatSlotUrl);

      const singlePayload = {
        title,
        slug: baseSlug,
        section: targetDept,
        category: deptConfigs[targetDept].category,
        color: deptConfigs[targetDept].color.trim() || "Standard",
        price: Number(deptConfigs[targetDept].price) || 599,
        discountPrice: deptConfigs[targetDept].discountPrice ? Number(deptConfigs[targetDept].discountPrice) : null,
        stockS: Number(deptConfigs[targetDept].stockS) || 0,
        stockM: Number(deptConfigs[targetDept].stockM) || 0,
        stockL: Number(deptConfigs[targetDept].stockL) || 0,
        stockXL: Number(deptConfigs[targetDept].stockXL) || 0,
        rating: Number(deptConfigs[targetDept].rating) || 4.5,
        reviewCount: Number(deptConfigs[targetDept].reviewCount) || 0,
        imageUrls: finalImgs,
        badges,
        isVisible,
      };

      const url = product ? `/api/products/${product.id}` : "/api/products";
      const res = await fetch(url, {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singlePayload),
      });

      if (!res.ok) {
        let err: { error?: string } = {};
        try {
          err = (await res.json()) as typeof err;
        } catch {
          err = { error: `Server error (${res.status} ${res.statusText})` };
        }
        throw new Error(err.error || "Failed to save product");
      }

      onShowToast?.(
        isEditing ? `Updated "${title}" successfully!` : `Created product "${title}"!`,
        "success"
      );
      onSaved();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-fade-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <h2 id="product-modal-title" className="text-lg font-bold text-white flex items-center gap-2">
              {isEditing && product ? `Edit "${product.title}"` : "Add Print / Product Drop"}
              {isDualDrop && (
                <span className="text-[11px] font-black uppercase bg-amber-400 text-zinc-950 px-2 py-0.5 rounded-full shadow-sm">
                  ⚡ Dual Drop (Men & Women)
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add photos for Men & Women of the same print in one place. Switch drops or click any photo to configure its details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content: Form & Live Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: 7 cols */}
          <form onSubmit={handleSubmit} id="product-edit-form" className="lg:col-span-7 space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Mode Selector: Dual Drop vs Single Department */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Product Drop Mode:
                </span>
                <span className="text-[11px] font-medium text-zinc-400">
                  {dropMode === "dual_drop"
                    ? "⚡ Men & Women products published together"
                    : `Single Drop: Publishes to ${dropMode} collection only`}
                </span>
              </div>

              {/* 5 Drop Mode Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDropMode("dual_drop");
                    if (activeDept !== "women" && activeDept !== "men") setActiveDept("women");
                  }}
                  className={`col-span-2 sm:col-span-1 p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    dropMode === "dual_drop"
                      ? "bg-amber-400 text-zinc-950 border-amber-400 font-bold shadow-lg shadow-amber-400/20 ring-2 ring-amber-400/50"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-black tracking-wide flex items-center gap-1">
                    ⚡ Dual Drops
                  </span>
                  <span className="text-[10px] opacity-85 font-semibold">Men + Women</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropMode("women");
                    switchActiveDept("women");
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    dropMode === "women"
                      ? "bg-rose-600 text-white border-rose-500 font-bold shadow-lg shadow-rose-600/20 ring-2 ring-rose-500/50"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-black">👩 Women Only</span>
                  <span className="text-[10px] opacity-80 font-medium">Single Drop</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropMode("men");
                    switchActiveDept("men");
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    dropMode === "men"
                      ? "bg-sky-600 text-white border-sky-500 font-bold shadow-lg shadow-sky-600/20 ring-2 ring-sky-500/50"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-black">👨 Men Only</span>
                  <span className="text-[10px] opacity-80 font-medium">Single Drop</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropMode("unisex");
                    switchActiveDept("unisex");
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    dropMode === "unisex"
                      ? "bg-purple-600 text-white border-purple-500 font-bold shadow-lg shadow-purple-600/20 ring-2 ring-purple-500/50"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-black">🚻 Unisex</span>
                  <span className="text-[10px] opacity-80 font-medium">Single Drop</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropMode("kids");
                    switchActiveDept("kids");
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    dropMode === "kids"
                      ? "bg-emerald-600 text-white border-emerald-500 font-bold shadow-lg shadow-emerald-600/20 ring-2 ring-emerald-500/50"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-black">🧒 Kids</span>
                  <span className="text-[10px] opacity-80 font-medium">Single Drop</span>
                </button>
              </div>

              {/* Sub-tabs when Dual Drop is active */}
              {dropMode === "dual_drop" && (
                <div className="pt-2.5 border-t border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider">
                      Select drop tab to edit details & live preview:
                    </span>
                    <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" /> Both drops saved to storefront
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => switchActiveDept("women")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        activeDept === "women"
                          ? "bg-rose-950/70 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 shadow-lg"
                          : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>👩 Women&apos;s Drop</span>
                          {activeDept === "women" && (
                            <span className="text-[10px] font-black uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                              EDITING NOW
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-80 mt-1 font-medium">
                          {deptConfigs.women.category} &bull; {womenImagesCount} photo{womenImagesCount === 1 ? "" : "s"}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${activeDept === "women" ? "rotate-90 text-rose-400" : "text-zinc-600"}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => switchActiveDept("men")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        activeDept === "men"
                          ? "bg-sky-950/70 border-sky-500 text-sky-100 ring-2 ring-sky-500/40 shadow-lg"
                          : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>👨 Men&apos;s Drop</span>
                          {activeDept === "men" && (
                            <span className="text-[10px] font-black uppercase bg-sky-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                              EDITING NOW
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-80 mt-1 font-medium">
                          {deptConfigs.men.category} &bull; {menImagesCount} photo{menImagesCount === 1 ? "" : "s"}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${activeDept === "men" ? "rotate-90 text-sky-400" : "text-zinc-600"}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Department Focus Banner */}
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                  activeDept === "women"
                    ? "bg-rose-950/40 border-rose-800/60 text-rose-200"
                    : activeDept === "men"
                    ? "bg-sky-950/40 border-sky-800/60 text-sky-200"
                    : activeDept === "unisex"
                    ? "bg-purple-950/40 border-purple-800/60 text-purple-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 shrink-0" />
                  <span>
                    Editing <strong>{activeDept.toUpperCase()}</strong> drop details (Category, Color, Price, Stock & Preview).
                  </span>
                </div>
                {(activeDept === "men" || activeDept === "women") && (
                  <button
                    type="button"
                    onClick={() => copyConfigFrom(activeDept === "men" ? "women" : "men")}
                    className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer bg-black/40 px-2 py-1 rounded border border-amber-400/30 hover:border-amber-400/60 transition-all shrink-0"
                    title={`Copy pricing & size stock from ${activeDept === "men" ? "Women" : "Men"}`}
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy from {activeDept === "men" ? "Women" : "Men"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                1. General Information ({activeDept.toUpperCase()} DROP)
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Print / Product Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GEOMETRY GRAPHIC TEE"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      URL Slug
                    </label>
                    <button
                      type="button"
                      onClick={autoSlug}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Generate from title
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. geometry"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono text-xs"
                  />
                  {isDualDrop && (
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Will create <span className="text-zinc-300 font-mono">/{slug || "slug"}-men</span> & <span className="text-zinc-300 font-mono">/{slug || "slug"}-women</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {activeDept === "women" ? "Women's" : activeDept === "men" ? "Men's" : activeDept.toUpperCase()} Fit / Category <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={currentConfig.category}
                      onChange={(e) => updateActiveDeptConfig({ category: e.target.value })}
                      className="appearance-none w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 pr-10 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                    >
                      {currentConfig.category &&
                        !PRODUCT_CATEGORIES.includes(
                          currentConfig.category as (typeof PRODUCT_CATEGORIES)[number]
                        ) && (
                          <option value={currentConfig.category}>{currentConfig.category}</option>
                        )}
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {activeDept === "women" ? "Women's" : activeDept === "men" ? "Men's" : activeDept.toUpperCase()} Colorway / Shade
                </label>
                <input
                  type="text"
                  placeholder="e.g. Beige, Black, Acid Wash"
                  value={currentConfig.color}
                  onChange={(e) => updateActiveDeptConfig({ color: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Pricing & Rating */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  2. Pricing & Ratings ({activeDept.toUpperCase()})
                </h3>
                {(activeDept === "men" || activeDept === "women") && (
                  <button
                    type="button"
                    onClick={() => copyConfigFrom(activeDept === "men" ? "women" : "men")}
                    className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy pricing from {activeDept === "men" ? "Women" : "Men"}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Original MRP (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={currentConfig.price}
                    onChange={(e) => updateActiveDeptConfig({ price: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Discount / Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave empty if no discount"
                    value={currentConfig.discountPrice == null ? "" : currentConfig.discountPrice}
                    onChange={(e) =>
                      updateActiveDeptConfig({
                        discountPrice: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                  {currentDiscountPct > 0 && (
                    <p className="text-[11px] text-emerald-400 font-medium mt-1">
                      Customer saves {currentDiscountPct}%
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Star Rating (1 - 5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={currentConfig.rating}
                    onChange={(e) => updateActiveDeptConfig({ rating: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Review Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentConfig.reviewCount}
                    onChange={(e) =>
                      updateActiveDeptConfig({ reviewCount: Number(e.target.value) })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Inventory per Size */}
            <div className="space-y-3.5 pt-4 border-t border-zinc-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <span>3. Size Inventory Breakdown</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      activeDept === "women"
                        ? "bg-rose-950/80 text-rose-300 border border-rose-800/50"
                        : activeDept === "men"
                        ? "bg-sky-950/80 text-sky-300 border border-sky-800/50"
                        : "bg-purple-950/80 text-purple-300 border border-purple-800/50"
                    }`}>
                      {activeDept.toUpperCase()} DROP
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Configure stock units per size or apply quick batch presets
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick batch presets */}
                  <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1 text-[11px] text-zinc-400">
                    <span className="px-1.5 font-medium text-zinc-500">Preset:</span>
                    <button
                      type="button"
                      onClick={() => setAllStock(10)}
                      className="px-2 py-0.5 rounded-lg hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer font-bold"
                      title="Set 10 units for all sizes"
                    >
                      10 ea
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllStock(20)}
                      className="px-2 py-0.5 rounded-lg hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer font-bold"
                      title="Set 20 units for all sizes"
                    >
                      20 ea
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllStock(0)}
                      className="px-2 py-0.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer font-bold"
                      title="Set 0 units for all sizes (Sold Out)"
                    >
                      Zero
                    </button>
                  </div>

                  {/* Total Units Badge */}
                  <span className={`text-xs font-black px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-xs shrink-0 ${
                    currentTotalStock === 0
                      ? "bg-red-950/50 text-red-400 border-red-800/60"
                      : "bg-zinc-950 text-zinc-100 border-zinc-800"
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Total:</span>
                    <span>{currentTotalStock} units</span>
                  </span>
                </div>
              </div>

              {/* 4 Size Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["stockS", "stockM", "stockL", "stockXL"] as const).map((key) => {
                  const sizeLabel = key.replace("stock", "");
                  const count = currentConfig[key];
                  const isZero = count === 0;
                  const isLow = count > 0 && count <= 3;
                  return (
                    <div
                      key={key}
                      className={`relative bg-zinc-950 border rounded-2xl p-3 flex flex-col justify-between gap-3 transition-all shadow-sm ${
                        isZero
                          ? "border-red-900/40 bg-red-950/10 hover:border-red-800/60"
                          : isLow
                          ? "border-amber-900/40 hover:border-amber-800/60"
                          : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/80"
                      }`}
                    >
                      {/* Card Header: Size Pill + Stock Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-700/80 font-black text-xs text-white flex items-center justify-center shadow-xs">
                            {sizeLabel}
                          </span>
                          <span className="text-xs font-bold text-zinc-200">
                            Size {sizeLabel}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isZero
                              ? "bg-red-950/70 text-red-400 border-red-800/60"
                              : isLow
                              ? "bg-amber-950/70 text-amber-300 border-amber-800/60"
                              : "bg-emerald-950/70 text-emerald-400 border-emerald-800/60"
                          }`}
                        >
                          {isZero ? "Sold Out" : `${count} left`}
                        </span>
                      </div>

                      {/* Stepper Control: - [count] + */}
                      <div className="flex items-center w-full bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden p-0.5 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-500 transition-all">
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveDeptConfig({
                              [key]: Math.max(0, count - 1),
                            } as Partial<DeptConfig>)
                          }
                          disabled={isZero}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-600 cursor-pointer active:scale-90 shrink-0"
                          aria-label={`Decrease size ${sizeLabel}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={count}
                          onChange={(e) =>
                            updateActiveDeptConfig({
                              [key]: Math.max(0, parseInt(e.target.value) || 0),
                            } as Partial<DeptConfig>)
                          }
                          className="w-full min-w-0 bg-transparent text-center text-xs sm:text-sm font-bold text-white font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none py-1"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveDeptConfig({
                              [key]: count + 1,
                            } as Partial<DeptConfig>)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer active:scale-90 shrink-0"
                          aria-label={`Increase size ${sizeLabel}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Image Assets */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    4. Image Assets ({images.length} photos)
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Click any picture to preview and edit its details. Use the department tags to assign to Men or Women.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {dropMode === "dual_drop" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          uploadTargetDeptRef.current = "women";
                          setActiveDept("women");
                          multiFileInputRef.current?.click();
                        }}
                        disabled={uploadingImage}
                        className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className={`w-3.5 h-3.5 ${uploadingImage ? "animate-spin" : ""}`} />
                        <span>Upload Women&apos;s Photos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          uploadTargetDeptRef.current = "men";
                          setActiveDept("men");
                          multiFileInputRef.current?.click();
                        }}
                        disabled={uploadingImage}
                        className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className={`w-3.5 h-3.5 ${uploadingImage ? "animate-spin" : ""}`} />
                        <span>Upload Men&apos;s Photos</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        uploadTargetDeptRef.current = activeDept;
                        multiFileInputRef.current?.click();
                      }}
                      disabled={uploadingImage}
                      className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className={`w-3.5 h-3.5 ${uploadingImage ? "animate-spin" : ""}`} />
                      <span>{uploadingImage ? "Uploading..." : `Upload to ${activeDept.toUpperCase()}`}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addImageSlot}
                    className="text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slot</span>
                  </button>
                </div>
              </div>

              {/* Status summary of Men and Women photo counts in Dual Drop */}
              {dropMode === "dual_drop" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      womenImagesCount > 0
                        ? "bg-rose-950/20 border-rose-800/40 text-rose-300"
                        : "bg-amber-950/30 border-amber-800/50 text-amber-300"
                    }`}
                  >
                    <span>Women&apos;s drop: <strong>{womenImagesCount}</strong> photo{womenImagesCount === 1 ? "" : "s"}</span>
                    {womenImagesCount === 0 && (
                      <span className="text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">
                        Missing photos
                      </span>
                    )}
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      menImagesCount > 0
                        ? "bg-sky-950/20 border-sky-800/40 text-sky-300"
                        : "bg-amber-950/30 border-amber-800/50 text-amber-300"
                    }`}
                  >
                    <span>Men&apos;s drop: <strong>{menImagesCount}</strong> photo{menImagesCount === 1 ? "" : "s"}</span>
                    {menImagesCount === 0 && (
                      <span className="text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">
                        Missing photos
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Hidden file input for multi-file upload */}
              <input
                ref={multiFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleUploadFiles(e.target.files, null);
                }}
              />

              {/* Hidden file input for single slot upload */}
              <input
                ref={singleSlotFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleUploadFiles(e.target.files, activeSlotTarget);
                }}
              />

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverImages(true);
                }}
                onDragLeave={() => setIsDragOverImages(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverImages(false);
                  if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files, null);
                }}
                onClick={() => multiFileInputRef.current?.click()}
                className={`border border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                  isDragOverImages
                    ? "border-amber-400 bg-amber-400/10"
                    : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-950"
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>
                    {uploadingImage
                      ? "Uploading image files to server..."
                      : `Drag & drop photos here to add to ${activeDept.toUpperCase()} drop, or click to browse computer`}
                  </span>
                </div>
              </div>

              {/* Image Slots List */}
              <div className="space-y-2">
                {images.map((slot, idx) => {
                  const isSelected = activeImageIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => selectImageSlot(idx)}
                      className={`flex flex-col sm:flex-row sm:items-center gap-2.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 border-amber-400 shadow-lg ring-1 ring-amber-400/40"
                          : "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
                          {slot.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getCleanImageUrl(slot.url)}
                              alt={`Slot ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-600" />
                          )}
                          <span
                            className={`absolute top-0.5 left-0.5 text-[8px] font-black uppercase px-1 rounded shadow-xs ${
                              slot.department === "women"
                                ? "bg-rose-600 text-white"
                                : slot.department === "men"
                                ? "bg-sky-600 text-white"
                                : "bg-purple-600 text-white"
                            }`}
                          >
                            {slot.department === "women"
                              ? "WOMEN"
                              : slot.department === "men"
                              ? "MEN"
                              : slot.department.toUpperCase()}
                          </span>
                          {slot.color && (
                            <span
                              className="absolute top-0.5 right-0.5 text-[7px] font-black uppercase px-1 rounded shadow-xs flex items-center gap-0.5 bg-black/85 text-zinc-200 border border-white/20"
                              title={`Color: ${slot.color}`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: getTeeColor(slot.color).bg }}
                              />
                              <span className="truncate max-w-[40px]">{slot.color}</span>
                            </span>
                          )}
                          {isSelected && (
                            <span className="absolute bottom-0 inset-x-0 bg-amber-400 text-zinc-950 text-[9px] font-black text-center py-0.5 leading-none">
                              PREVIEW
                            </span>
                          )}
                        </div>

                        {/* URL input */}
                        <input
                          type="text"
                          placeholder="Image URL (/uploads/... or https://...)"
                          value={slot.url}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                          className="flex-1 bg-transparent border-0 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none px-2 min-w-0"
                        />
                      </div>

                      {/* Department & Color controls for this picture */}
                      <div
                        className="flex items-center gap-1.5 shrink-0 self-end sm:self-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Color Dropdown */}
                        <select
                          value={slot.color || ""}
                          onChange={(e) => changeSlotColor(idx, e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                          title="Assign colorway to this photo"
                        >
                          <option value="">🎨 Color: Auto</option>
                          {availableColors.map((c) => (
                            <option key={c} value={c}>
                              🎨 {c}
                            </option>
                          ))}
                          {slot.color && !availableColors.includes(slot.color) && (
                            <option value={slot.color}>🎨 {slot.color}</option>
                          )}
                        </select>

                        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => changeSlotDepartment(idx, "women")}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              slot.department === "women"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            👩 Women
                          </button>
                          <button
                            type="button"
                            onClick={() => changeSlotDepartment(idx, "men")}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              slot.department === "men"
                                ? "bg-sky-600 text-white shadow-xs"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            👨 Men
                          </button>
                          <button
                            type="button"
                            onClick={() => changeSlotDepartment(idx, "unisex")}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              slot.department === "unisex"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            Unisex
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveSlotTarget(idx);
                            singleSlotFileInputRef.current?.click();
                          }}
                          className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                          title="Upload local file to this slot"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Browse</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeImageSlot(idx)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges & Visibility */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                5. Badges & Storefront Visibility
              </h3>

              <div>
                <label className="block text-xs text-zinc-400 mb-2">
                  Select Badges to highlight on the card:
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_BADGES.map((b) => {
                    const active = badges.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => toggleBadge(b)}
                        className={`text-xs font-bold uppercase px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          active
                            ? "bg-amber-400 text-zinc-950 border-amber-400 shadow-sm font-black"
                            : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {active && "✓ "}
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    Visible on Storefront
                  </p>
                  <p className="text-xs text-zinc-400">
                    Enable or disable this product from appearing in the live customer catalog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    isVisible ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                  aria-label="Toggle visible on storefront"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isVisible ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </form>

          {/* Right Live Preview: 5 cols */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-0 w-full max-w-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                <span>Live Card Preview</span>
                <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => switchActiveDept("women")}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      activeDept === "women"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Women ({womenImagesCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => switchActiveDept("men")}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      activeDept === "men"
                        ? "bg-sky-500 text-white shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Men ({menImagesCount})
                  </button>
                </div>
              </div>

              {/* Mockup Card */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-left">
                {/* Image */}
                <div className="h-64 bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                  {previewImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getCleanImageUrl(previewImageUrl)}
                      alt="preview"
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  ) : (
                    <div className="text-center text-zinc-600 p-4">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-xs">No image uploaded for this slot</p>
                    </div>
                  )}

                  {/* Badges in Preview */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {badges.map((b) => (
                      <span
                        key={b}
                        className="text-[10px] font-black uppercase tracking-wider bg-black/90 text-amber-400 border border-amber-400/40 px-2.5 py-0.5 rounded shadow-lg backdrop-blur-sm"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Out of Stock Overlay */}
                  {currentTotalStock === 0 && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-xs font-bold text-red-400 bg-red-950/90 border border-red-800 px-3 py-1.5 rounded-full uppercase tracking-wider">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          activeDept === "women"
                            ? "bg-rose-950/80 text-rose-300 border-rose-800/40"
                            : activeDept === "men"
                            ? "bg-sky-950/80 text-sky-300 border-sky-800/40"
                            : activeDept === "unisex"
                            ? "bg-purple-950/80 text-purple-300 border-purple-800/40"
                            : "bg-zinc-800 text-zinc-200 border-zinc-700"
                        }`}
                      >
                        {activeDept === "women" ? "WOMEN" : activeDept === "men" ? "MEN" : activeDept.toUpperCase()}
                      </span>
                      <span className="font-semibold text-zinc-200">
                        {currentConfig.category || "Category"}
                      </span>
                    </div>
                    <span className="font-medium text-zinc-400">
                      {activeSlot?.color || currentConfig.color || "Color"}
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-100 text-sm line-clamp-1">
                    {title || "Product Title Preview"}
                  </h4>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-lg font-bold text-white">
                      {formatInr(currentConfig.discountPrice ?? currentConfig.price)}
                    </span>
                    {currentConfig.discountPrice && (
                      <>
                        <span className="text-xs line-through text-zinc-500">
                          {formatInr(currentConfig.price)}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {currentDiscountPct}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Sizing badges in preview */}
                  <div className="pt-2 flex items-center gap-1">
                    {(["stockS", "stockM", "stockL", "stockXL"] as const).map((s) => {
                      const count = currentConfig[s];
                      return (
                        <span
                          key={s}
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            count > 0
                              ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                              : "bg-zinc-900 text-zinc-600 border-zinc-800 line-through"
                          }`}
                        >
                          {s.replace("stock", "")}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-end gap-3 bg-zinc-950/60">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-edit-form"
            disabled={busy}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
              isDualDrop
                ? "bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-400/20 font-bold"
                : "bg-white hover:bg-zinc-100 text-zinc-950"
            }`}
          >
            {busy ? (
              "Saving Products..."
            ) : isDualDrop ? (
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-zinc-950" />
                ⚡ Publish Dual Drops (Save Men &amp; Women)
              </span>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              `Create ${activeDept === "women" ? "Women's" : activeDept === "men" ? "Men's" : activeDept === "unisex" ? "Unisex" : "Kids"} Product`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
