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
  FolderOpen
} from "lucide-react";
import type { ProductDTO } from "@/lib/product";
import { formatInr, isOutOfStock, totalStock, percentOff, PRODUCT_CATEGORIES } from "@/lib/product";

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
                                src={p.imageUrls[0]}
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
                              <span className="font-extrabold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 text-[10px] uppercase tracking-wider">
                                {p.section || "men"}
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
                      src={p.imageUrls[0]}
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
                        <span className="font-extrabold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 text-[10px] uppercase tracking-wider">
                          {p.section || "men"}
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
            onShowToast(
              editing ? "Product updated successfully!" : "New product created successfully!",
              "success"
            );
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
  categories: string[];
  initialImageUrl?: string | null;
  onClose: () => void;
  onSaved: () => void;
  onShowToast?: (msg: string, type?: "success" | "error") => void;
}

function ProductModal({
  product,
  categories,
  initialImageUrl,
  onClose,
  onSaved,
  onShowToast,
}: ProductModalProps) {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(() => {
    const base = {
      ...blankProduct,
      ...product,
      imageUrls: product?.imageUrls?.length ? product.imageUrls : [""],
    };
    if (!product && initialImageUrl) {
      base.imageUrls = [initialImageUrl];
    }
    return base;
  });
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOverImages, setIsDragOverImages] = useState(false);
  const [activeSlotTarget, setActiveSlotTarget] = useState<number | null>(null);
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
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    setForm((f) => ({ ...f, slug }));
  }

  async function handleUploadFiles(files: FileList | File[], targetSlot?: number | null) {
    if (!files || files.length === 0) return;

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
        const next = [...form.imageUrls];
        next[targetSlot] = uploadedUrls[0];
        if (uploadedUrls.length > 1) {
          next.push(...uploadedUrls.slice(1));
        }
        setForm((f) => ({ ...f, imageUrls: next }));
      } else {
        const existingNonEmpty = form.imageUrls.filter((u) => u.trim() !== "");
        const combined = [...existingNonEmpty, ...uploadedUrls];
        setForm((f) => ({ ...f, imageUrls: combined.length ? combined : [""] }));
      }

      onShowToast?.(
        `Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} from your computer!`,
        "success"
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image";
      setErrorMsg(message);
      onShowToast?.(message, "error");
    } finally {
      setUploadingImage(false);
      setActiveSlotTarget(null);
      if (multiFileInputRef.current) multiFileInputRef.current.value = "";
      if (singleSlotFileInputRef.current) singleSlotFileInputRef.current.value = "";
    }
  }

  function handleImageChange(idx: number, val: string) {
    const next = [...form.imageUrls];
    next[idx] = val;
    setForm({ ...form, imageUrls: next });
  }

  function addImageSlot() {
    setForm({ ...form, imageUrls: [...form.imageUrls, ""] });
  }

  function removeImageSlot(idx: number) {
    if (form.imageUrls.length <= 1) {
      setForm({ ...form, imageUrls: [""] });
    } else {
      setForm({
        ...form,
        imageUrls: form.imageUrls.filter((_, i) => i !== idx),
      });
    }
  }

  function toggleBadge(b: string) {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(b)
        ? f.badges.filter((x) => x !== b)
        : [...f.badges, b],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!form.title.trim()) {
      setErrorMsg("Product title is required");
      return;
    }
    if (form.price <= 0) {
      setErrorMsg("Price must be greater than 0");
      return;
    }

    setBusy(true);

    const payload = {
      ...form,
      imageUrls: form.imageUrls.map((u) => u.trim()).filter(Boolean),
      slug: form.slug.trim() || undefined,
    };

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const res = await fetch(url, {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

      onSaved();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(message);
    } finally {
      setBusy(false);
    }
  }

  const currentTotalStock = form.stockS + form.stockM + form.stockL + form.stockXL;
  const currentDiscountPct =
    form.discountPrice && form.discountPrice < form.price
      ? Math.round((1 - form.discountPrice / form.price) * 100)
      : 0;

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
            <h2 id="product-modal-title" className="text-lg font-bold text-white">
              {isEditing && product ? `Edit "${product.title}"` : "Create New Product"}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Fill in product details, pricing, size stock breakdown, and image assets.
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

            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                1. General Information
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Product Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INK ACID OVERSIZED TEE"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Section Selector: Men, Women, Kids */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Section / Department <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { id: "men", label: "Men", subtitle: "Men's Drops" },
                    { id: "women", label: "Women", subtitle: "Women's Drops" },
                    { id: "kids", label: "Kids", subtitle: "Kids' Drops" },
                  ].map((sec) => {
                    const active = (form.section ?? "men").toLowerCase() === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setForm({ ...form, section: sec.id })}
                        className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                          active
                            ? "bg-white text-zinc-950 border-white shadow-md font-bold ring-2 ring-zinc-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider">{sec.label}</span>
                        <span className={`text-[10px] mt-0.5 ${active ? "text-zinc-700 font-semibold" : "text-zinc-500"}`}>
                          {sec.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                    placeholder="e.g. ink-acid-oversized-tee"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="appearance-none w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 pr-10 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                    >
                      {form.category &&
                        !PRODUCT_CATEGORIES.includes(
                          form.category as (typeof PRODUCT_CATEGORIES)[number]
                        ) && (
                          <option value={form.category}>{form.category}</option>
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
                  Colorway / Shade
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acid Charcoal, Jet Black, Bone White"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Pricing & Rating */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                2. Pricing & Ratings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Original MRP (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
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
                    value={form.discountPrice == null ? "" : form.discountPrice}
                    onChange={(e) =>
                      setForm({
                        ...form,
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
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
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
                    value={form.reviewCount}
                    onChange={(e) =>
                      setForm({ ...form, reviewCount: Number(e.target.value) })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Inventory per Size */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  3. Size Inventory Breakdown
                </h3>
                <span className="text-xs font-bold bg-zinc-800 px-2.5 py-0.5 rounded-full text-zinc-300">
                  Total: {currentTotalStock} units
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["stockS", "stockM", "stockL", "stockXL"] as const).map((key) => {
                  const sizeLabel = key.replace("stock", "");
                  const count = form[key];
                  return (
                    <div key={key} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-2">
                        <span>Size {sizeLabel}</span>
                        <span className={count === 0 ? "text-red-400" : "text-emerald-400"}>
                          {count}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, [key]: Math.max(0, f[key] - 1) }))
                          }
                          className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={form[key]}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              [key]: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="w-full text-center bg-zinc-900 border border-zinc-700/80 rounded-lg py-1 text-xs text-zinc-100 font-semibold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, [key]: f[key] + 1 }))
                          }
                          className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Image Assets */}
            <div className="space-y-3 pt-4 border-t border-zinc-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    4. Image Assets
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Upload images from your computer or paste image URLs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => multiFileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className={`w-3.5 h-3.5 ${uploadingImage ? "animate-spin" : ""}`} />
                    <span>{uploadingImage ? "Uploading..." : "Upload from Computer"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={addImageSlot}
                    className="text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add URL</span>
                  </button>
                </div>
              </div>

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
                      : "Drag & drop images here, or click to browse computer files"}
                  </span>
                </div>
              </div>

              {/* Image Slots List */}
              <div className="space-y-2">
                {form.imageUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-1.5 pr-2">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={`Slot ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Image URL (/uploads/... or https://...)"
                      value={url}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                      className="flex-1 bg-transparent border-0 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none px-2"
                    />

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
                      <span className="hidden sm:inline">Browse</span>
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
                ))}
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
                    const active = form.badges.includes(b);
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
                  onClick={() => setForm({ ...form, isVisible: !form.isVisible })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    form.isVisible ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                  aria-label="Toggle visible on storefront"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      form.isVisible ? "translate-x-6" : "translate-x-0"
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
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Storefront Match
                </span>
              </div>

              {/* Mockup Card */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-left">
                {/* Image */}
                <div className="h-64 bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                  {form.imageUrls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.imageUrls[0]}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-zinc-600 p-4">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-xs">No image URL provided</p>
                    </div>
                  )}

                  {/* Badges in Preview */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {form.badges.map((b) => (
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
                      <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700 px-1.5 py-0.5 rounded">
                        {form.section || "men"}
                      </span>
                      <span>{form.category || "Category"}</span>
                    </div>
                    <span>{form.color || "Color"}</span>
                  </div>
                  <h4 className="font-bold text-zinc-100 text-sm line-clamp-1">
                    {form.title || "Product Title Preview"}
                  </h4>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-lg font-bold text-white">
                      {formatInr(form.discountPrice ?? form.price)}
                    </span>
                    {form.discountPrice && (
                      <>
                        <span className="text-xs line-through text-zinc-500">
                          {formatInr(form.price)}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {currentDiscountPct}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Sizing badges in preview */}
                  <div className="pt-2 flex items-center gap-1">
                    {(["S", "M", "L", "XL"] as const).map((s) => {
                      const countKey = `stock${s}` as keyof typeof form;
                      const count = Number(form[countKey]) || 0;
                      return (
                        <span
                          key={s}
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            count > 0
                              ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                              : "bg-zinc-900 text-zinc-600 border-zinc-800 line-through"
                          }`}
                        >
                          {s}
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
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-zinc-100 text-zinc-950 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {busy ? "Saving Product..." : isEditing ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
