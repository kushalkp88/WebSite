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

export function ProductCard({ product }: { product: ProductDTO }) {
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
    <article className="group flex flex-col justify-between">
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 shadow-lg group-hover:border-white/25 transition-all duration-300">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <ProductImage
            src={img}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
          />
          <ProductImage
            src={hover}
            alt={`${product.title} Alternate View`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.badges.map((b) => (
            <span
              key={b}
              className="w-fit bg-black/90 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-md shadow-md backdrop-blur-sm"
            >
              {b}
            </span>
          ))}
          {off > 0 && (
            <span
              className="w-fit px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black rounded-md shadow-md"
              style={{ background: "var(--accent-color)" }}
            >
              {off}% OFF
            </span>
          )}
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
          className="absolute top-3 right-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all shadow-md active:scale-90 cursor-pointer"
        >
          <Heart size={15} fill={wished ? "#ef4444" : "none"} className={wished ? "text-red-500" : ""} />
        </button>

        {/* Out of Stock or Quick Add Overlay */}
        {oos ? (
          <div className="absolute inset-x-0 bottom-0 bg-black/85 backdrop-blur-xs py-3.5 text-center text-[11px] font-black tracking-[0.2em] text-zinc-300 uppercase border-t border-white/10">
            Out of Stock
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100 z-10">
            {picking ? (
              <div className="bg-black/95 border border-white/20 rounded-xl p-2.5 shadow-2xl backdrop-blur-xl space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400 px-1">
                  <span>Select Size:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setPicking(false);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {SIZES.map((size) => {
                    const n = stockFor(product, size);
                    const isAdded = addedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={n <= 0}
                        onClick={(e) => handleAdd(size, e)}
                        className={`flex-1 py-2 text-xs font-black rounded-lg transition-all border cursor-pointer ${
                          isAdded
                            ? "bg-emerald-500 border-emerald-500 text-black"
                            : n > 0
                            ? "bg-zinc-900 border-zinc-700 text-white hover:bg-white hover:text-black hover:border-white"
                            : "border-zinc-800 bg-zinc-950 text-zinc-600 line-through cursor-not-allowed"
                        }`}
                        title={n > 0 ? `${size}: ${n} in stock` : `${size}: Out of stock`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5 mx-auto" /> : size}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setPicking(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black tracking-[0.18em] text-black uppercase shadow-2xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1 font-semibold">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-zinc-200">{product.rating.toFixed(1)}</span>
            <span className="text-zinc-500">({product.reviewCount})</span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">{product.category}</span>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="block font-bold text-sm leading-snug text-zinc-100 hover:text-white transition-colors line-clamp-1"
        >
          {product.title}
        </Link>

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-base font-black text-white">
            {formatInr(sale)}
          </span>
          {product.discountPrice != null && (
            <span className="text-xs text-zinc-500 line-through">
              {formatInr(product.price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: ProductDTO[] }) {
  const [sort, setSort] = useState("featured");

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "low") list.sort((a, b) => salePrice(a) - salePrice(b));
    if (sort === "high") list.sort((a, b) => salePrice(b) - salePrice(a));
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, sort]);

  return (
    <div className="space-y-6">
      {/* Top Sort Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="text-xs font-semibold text-zinc-400">
          Showing <strong className="text-white">{sorted.length}</strong> items
        </p>

        <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-zinc-900/80 px-3.5 py-2 text-xs font-bold tracking-wider text-white uppercase cursor-pointer">
          <span className="text-zinc-400 text-[11px]">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent outline-none cursor-pointer font-bold text-white"
          >
            <option value="featured" className="bg-zinc-900 text-white">Featured Drops</option>
            <option value="low" className="bg-zinc-900 text-white">Price: Low to High</option>
            <option value="high" className="bg-zinc-900 text-white">Price: High to Low</option>
            <option value="rating" className="bg-zinc-900 text-white">Highest Rated</option>
          </select>
        </label>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-zinc-900/40 py-20 text-center px-4">
          <Sparkles className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-200">No products match your filters</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Try resetting your active filters or search query to browse our full catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
