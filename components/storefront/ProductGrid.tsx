"use client";

import { useMemo, useState } from "react";
import { Heart, Sparkles, Check, ChevronLeft, ChevronRight } from "lucide-react";
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

export function ProductCard({ product }: { product: ProductDTO }) {
  const oos = isOutOfStock(product);
  const off = percentOff(product);
  const sale = salePrice(product);
  const [picking, setPicking] = useState(false);
  const [addedSize, setAddedSize] = useState<Size | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [isReduced, setIsReduced] = useState(false);

  const addToCart = useShop((s) => s.addToCart);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const wished = useShop((s) =>
    s.wishlist.some((w) => w.productId === product.id),
  );

  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [""];
  const currentImg = images[imgIdx] ?? images[0];

  function handleAdd(size: Size, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const max = stockFor(product, size);
    if (max <= 0) return;

    addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: currentImg,
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

  function handlePrevImage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function handleNextImage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function handleImageClick() {
    setIsReduced((prev) => !prev);
  }

  return (
    <article className="group flex flex-col justify-between transition-all">
      {/* Product Image Frame (Veirdo 3:4 Aspect Ratio - Full Width of Column) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-zinc-100 border border-zinc-200/80 shadow-2xs group/card select-none">
        <Link 
          href={`/product/${product.slug}`} 
          onClick={handleImageClick}
          className={`block h-full w-full transition-transform duration-300 ease-out active:scale-90 ${
            isReduced ? "scale-[0.88] p-2" : "scale-100"
          }`}
        >
          <ProductImage
            src={currentImg}
            alt={product.title}
            className={`h-full w-full object-cover object-top transition-all duration-500 ease-out ${
              isReduced ? "rounded-lg" : ""
            }`}
          />
        </Link>

        {/* Prev / Next Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={handlePrevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={handleNextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Scrolling Pagination Dots for multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full shadow-xs">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImgIdx(i);
                }}
                onMouseEnter={() => setImgIdx(i)}
                className={`transition-all duration-300 cursor-pointer ${
                  imgIdx === i
                    ? "w-4 h-1.5 bg-white rounded-full shadow-xs"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/90 rounded-full"
                }`}
              />
            ))}
          </div>
        )}

        {/* Top Floating Badge (Matching Veirdo e.g. EPIC THREAD COLLECTION / BEST SELLER) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
          {product.badges.map((b) => (
            <span
              key={b}
              className="w-fit bg-white/95 text-zinc-900 border border-zinc-200/80 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9.5px] font-black tracking-wider uppercase rounded shadow-2xs backdrop-blur-md"
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
              image: currentImg,
              price: sale,
            });
          }}
          className="absolute top-2 right-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/80 text-zinc-700 backdrop-blur-md hover:bg-white hover:text-black transition-all shadow-xs active:scale-90 cursor-pointer"
        >
          <Heart size={14} fill={wished ? "#ef4444" : "none"} className={wished ? "text-red-500" : ""} />
        </button>

      </div>

      {/* Product Details Section Below Image */}
      <div className="mt-2 space-y-1">
        {/* Price Row: ₹1,581  ₹2,799  44% OFF */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-black text-zinc-900">
            {formatInr(sale)}
          </span>
          {product.discountPrice != null && (
            <span className="text-[11px] sm:text-xs text-zinc-400 line-through font-normal">
              {formatInr(product.price)}
            </span>
          )}
          {off > 0 && (
            <span className="text-[11px] sm:text-xs font-bold text-emerald-600">
              {off}% OFF
            </span>
          )}
        </div>

        {/* Best Price Offer Row (Matching Veirdo % Best price ₹1,344) */}
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] sm:text-[11px]">
          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-600 text-white text-[8px] font-black leading-none shrink-0">
            %
          </span>
          <span className="truncate">Best price {formatInr(Math.round(sale * 0.73))}</span>
        </div>

        {/* Title */}
        <Link
          href={`/product/${product.slug}`}
          className="block text-xs sm:text-sm font-medium text-zinc-700 hover:text-black transition-colors line-clamp-1 pt-0.5"
        >
          {product.title}
        </Link>

        {/* Quick Size Picker or Full Width Add to Cart Button */}
        {picking ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-1.5 mt-1.5 space-y-1 animate-fade-in">
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
                    className={`flex-1 py-1 text-xs font-bold rounded-md transition-all border cursor-pointer ${
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
            className="w-full flex items-center justify-center py-2 sm:py-2.5 mt-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black tracking-wider text-zinc-900 bg-white border border-zinc-900 uppercase shadow-2xs hover:bg-zinc-900 hover:text-white transition-all cursor-pointer disabled:opacity-40"
          >
            <span>{oos ? "OUT OF STOCK" : "ADD TO CART"}</span>
          </button>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  sort = "featured",
  onSortChange,
}: {
  products: ProductDTO[];
  sort?: string;
  onSortChange?: (val: string) => void;
}) {
  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "low") list.sort((a, b) => salePrice(a) - salePrice(b));
    if (sort === "high") list.sort((a, b) => salePrice(b) - salePrice(a));
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, sort]);

  return (
    <div className="space-y-6">
      {/* Top Sort Header (Visible on Desktop / System View) */}
      <div className="hidden lg:flex items-center justify-between border-b border-zinc-200 pb-4">
        <p className="text-xs font-semibold text-zinc-600">
          Showing <strong className="text-zinc-900">{sorted.length}</strong> items
        </p>

        <label className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-bold tracking-wider text-zinc-900 uppercase cursor-pointer shadow-2xs">
          <span className="text-zinc-500 text-[11px]">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="bg-transparent outline-none cursor-pointer font-bold text-zinc-900 text-xs"
          >
            <option value="featured">Featured Drops</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </label>
      </div>

      {/* Grid: 2 columns on mobile, 2-3 columns on tablet, 3-4 columns on desktop */}
      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 py-20 text-center px-4">
          <Sparkles className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800">No products match your filters</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try resetting your active filters or search query to browse our full catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

