"use client";

import { useMemo, useState } from "react";
import { Heart, Star, Sparkles, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import {
  formatInr,
  isOutOfStock,
  percentOff,
  salePrice,
  SIZES,
  stockFor,
  type ProductDTO,
  type Size,
} from "@/lib/product";
import { useShop } from "@/lib/cart-store";
import { ProductImage } from "./ProductImage";

export function ProductCard({
  product,
  isCompactMobile = false,
}: {
  product: ProductDTO;
  isCompactMobile?: boolean;
}) {
  const oos = isOutOfStock(product);
  const off = percentOff(product);
  const sale = salePrice(product);
  const [picking, setPicking] = useState(false);
  const [addedSize, setAddedSize] = useState<Size | null>(null);

  const addToCart = useShop((s) => s.addToCart);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const wished = useShop((s) =>
    s.wishlist.some((w) => w.productId === product.id),
  );

  const img = product.imageUrls[0];
  const hover = product.imageUrls[1] ?? img;

  function handleAdd(size: Size, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const max = stockFor(product, size);
    if (max <= 0) return;

    addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: img,
      price: sale,
      size,
      qty: 1,
      maxStock: max,
    });

    setAddedSize(size);
    setTimeout(() => {
      setAddedSize(null);
      setPicking(false);
    }, 1200);
  }

  return (
    <article
      className={`group flex flex-col justify-between bg-white rounded-2xl border border-zinc-200 shadow-2xs hover:shadow-md transition-all ${
        isCompactMobile ? "p-2 sm:p-3" : "p-3 sm:p-3"
      }`}
    >
      {/* Product Image Frame (Veirdo 3:4 Model Portrait Aspect Ratio) */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-100 border border-zinc-100">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <ProductImage
            src={img}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
          />
          <ProductImage
            src={hover}
            alt={`${product.title} Alternate View`}
            className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
          />
        </Link>

        {/* Top Floating Badge (White pill matching Veirdo e.g. BEST SELLER) */}
        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 flex flex-col gap-1 pointer-events-none z-10">
          {product.badges.map((b) => (
            <span
              key={b}
              className={`w-fit bg-white/95 text-zinc-900 border border-zinc-200/80 font-black tracking-wider uppercase rounded-md shadow-xs backdrop-blur-md ${
                isCompactMobile
                  ? "px-1.5 py-0.5 text-[8px] sm:text-[9px]"
                  : "px-2 py-0.5 text-[9px] sm:text-[10px]"
              }`}
            >
              {b}
            </span>
          ))}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          aria-label="Wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist({
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: img,
              price: sale,
            });
          }}
          className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/80 text-zinc-700 backdrop-blur-md hover:bg-white hover:text-black transition-all shadow-xs active:scale-90 cursor-pointer"
        >
          <Heart size={14} fill={wished ? "#ef4444" : "none"} className={wished ? "text-red-500" : ""} />
        </button>

        {/* Rating Pill on Bottom-Left of Image (Matching Veirdo screenshot ★ 4.5 | 325) */}
        <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-2.5 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-zinc-400">|</span>
          <span>{product.reviewCount}</span>
        </div>

        {/* Color Variant Count Pill on Bottom-Right */}
        <div className="absolute bottom-2 sm:bottom-2.5 right-2 sm:right-2.5 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
          <span className="w-2 h-2 rounded-full bg-zinc-300 border border-black/40" />
          <span>1</span>
        </div>
      </div>

      {/* Product Details Section Below Image */}
      <div className="mt-2.5 sm:mt-3 space-y-1">
        {/* Price Row: ₹549  ₹1,199  54% OFF */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-sm sm:text-base font-black text-zinc-900">
            {formatInr(sale)}
          </span>
          {product.discountPrice != null && (
            <span className="text-[11px] sm:text-xs text-zinc-400 line-through font-medium">
              {formatInr(product.price)}
            </span>
          )}
          {off > 0 && (
            <span className="text-[11px] sm:text-xs font-bold text-emerald-600">
              {off}% OFF
            </span>
          )}
        </div>

        {/* Best Price Offer Pill (Matching Veirdo ✦ Best price ₹399) */}
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2 py-0.5 rounded-md border border-emerald-200/60 w-fit">
          <span className="text-emerald-600">✦</span>
          <span>Best price {formatInr(Math.round(sale * 0.73))}</span>
        </div>

        {/* Title */}
        <Link
          href={`/product/${product.slug}`}
          className="block text-xs font-medium text-zinc-600 hover:text-black transition-colors line-clamp-1 pt-0.5"
        >
          {product.title}
        </Link>

        {/* Quick Size Picker or Add to Cart CTA */}
        {picking ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2 mt-2 space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500 px-1">
              <span>Select Size:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setPicking(false);
                }}
                className="text-zinc-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-1">
              {SIZES.map((size) => {
                const n = stockFor(product, size);
                const isAdded = addedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={n <= 0}
                    onClick={(e) => handleAdd(size, e)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all border cursor-pointer ${
                      isAdded
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : n > 0
                        ? "bg-white border-zinc-300 text-zinc-900 hover:bg-black hover:text-white"
                        : "border-zinc-200 bg-zinc-100 text-zinc-400 line-through cursor-not-allowed"
                    }`}
                  >
                    {isAdded ? <Check className="w-3 h-3 mx-auto" /> : size}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={oos}
            onClick={(e) => {
              e.preventDefault();
              setPicking(true);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-2 rounded-xl text-xs font-black tracking-wider text-zinc-900 bg-white border border-zinc-300 uppercase shadow-2xs hover:bg-zinc-900 hover:text-white transition-all cursor-pointer disabled:opacity-40"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{oos ? "OUT OF STOCK" : "ADD TO CART"}</span>
          </button>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: ProductDTO[] }) {
  const [sort, setSort] = useState("featured");
  const [mobileCols, setMobileCols] = useState<1 | 2>(1);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "low") list.sort((a, b) => salePrice(a) - salePrice(b));
    if (sort === "high") list.sort((a, b) => salePrice(b) - salePrice(a));
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, sort]);

  return (
    <div className="space-y-6">
      {/* Top Sort & View Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4 gap-2">
        <p className="text-xs font-semibold text-zinc-600">
          Showing <strong className="text-zinc-900">{sorted.length}</strong> items
        </p>

        <div className="flex items-center gap-2">
          {/* Mobile Grid Layout Switcher (1 Col Large vs 2 Col Grid) */}
          <div className="flex sm:hidden items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200">
            <button
              type="button"
              onClick={() => setMobileCols(1)}
              title="Large 1-Column View"
              aria-label="Large 1-Column View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                mobileCols === 1
                  ? "bg-white text-zinc-900 shadow-xs font-bold"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              {/* Single large box icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setMobileCols(2)}
              title="Compact 2-Column Grid"
              aria-label="Compact 2-Column Grid"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                mobileCols === 2
                  ? "bg-white text-zinc-900 shadow-xs font-bold"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              {/* 2x2 grid icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="18" x="3" y="3" rx="1" />
                <rect width="7" height="18" x="14" y="3" rx="1" />
              </svg>
            </button>
          </div>

          <label className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-zinc-300 bg-white px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold tracking-wider text-zinc-900 uppercase cursor-pointer shadow-2xs">
            <span className="text-zinc-500 text-[10px] sm:text-[11px] hidden xs:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold text-zinc-900 text-[11px] sm:text-xs"
            >
              <option value="featured" className="bg-white text-zinc-900">Featured Drops</option>
              <option value="low" className="bg-white text-zinc-900">Price: Low to High</option>
              <option value="high" className="bg-white text-zinc-900">Price: High to Low</option>
              <option value="rating" className="bg-white text-zinc-900">Highest Rated</option>
            </select>
          </label>
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 py-20 text-center px-4">
          <Sparkles className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800">No products match your filters</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try resetting your active filters or search query to browse our full catalog.
          </p>
        </div>
      ) : (
        <div
          className={`grid ${
            mobileCols === 1
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 sm:gap-x-6 sm:gap-y-10"
              : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-2.5 gap-y-5 sm:gap-x-6 sm:gap-y-10"
          }`}
        >
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} isCompactMobile={mobileCols === 2} />
          ))}
        </div>
      )}
    </div>
  );
}
