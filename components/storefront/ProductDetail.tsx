"use client";

import { useState } from "react";
import { 
  Heart, 
  Star, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Ruler, 
  ChevronDown, 
  Sparkles, 
  ShoppingBag, 
  Check 
} from "lucide-react";
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

export function ProductDetail({ product }: { product: ProductDTO }) {
  const [size, setSize] = useState<Size | null>(() => {
    // Default to first available size
    return SIZES.find((s) => stockFor(product, s) > 0) ?? null;
  });
  const [activeImg, setActiveImg] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("fabric");
  const [justAdded, setJustAdded] = useState(false);

  const oos = isOutOfStock(product);
  const sale = salePrice(product);
  const off = percentOff(product);

  const addToCart = useShop((s) => s.addToCart);
  const openBag = useShop((s) => s.openBag);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const wished = useShop((s) =>
    s.wishlist.some((w) => w.productId === product.id),
  );

  function handleAdd() {
    if (!size || oos) return;
    const max = stockFor(product, size);
    if (max <= 0) return;

    addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.imageUrls[0] ?? "",
      price: sale,
      size,
      qty: 1,
      maxStock: max,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    openBag();
  }

  const selectedSizeStock = size ? stockFor(product, size) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Left Gallery: 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl">
            <ProductImage
              src={product.imageUrls[activeImg] ?? product.imageUrls[0]}
              alt={product.title}
              className="h-full w-full object-cover"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className="bg-black/90 text-amber-300 border border-amber-400/30 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg shadow-lg backdrop-blur-sm"
                >
                  {b}
                </span>
              ))}
              {off > 0 && (
                <span
                  className="px-3 py-1 text-xs font-black uppercase tracking-wider text-black rounded-lg shadow-lg"
                  style={{ background: "var(--accent-color)" }}
                >
                  {off}% OFF
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <button
              type="button"
              aria-label="Wishlist"
              onClick={() =>
                toggleWishlist({
                  productId: product.id,
                  slug: product.slug,
                  title: product.title,
                  image: product.imageUrls[0],
                  price: sale,
                })
              }
              className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all shadow-lg active:scale-90 cursor-pointer"
            >
              <Heart size={18} fill={wished ? "#ef4444" : "none"} className={wished ? "text-red-500" : ""} />
            </button>
          </div>

          {/* Thumbnail row */}
          {product.imageUrls.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.imageUrls.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                    i === activeImg
                      ? "border-amber-400 scale-105 shadow-md"
                      : "border-white/15 opacity-60 hover:opacity-100"
                  }`}
                >
                  <ProductImage src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
              <span>{product.category}</span>
              <span>•</span>
              <span className="text-zinc-200">{product.color}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              {product.title}
            </h1>

            {/* Ratings */}
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1 font-bold text-amber-400">
                <Star size={14} className="fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span className="underline">{product.reviewCount} customer reviews</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">In High Demand</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 border-y border-white/10 py-4">
            <span className="text-3xl font-black text-white">
              {formatInr(sale)}
            </span>
            {product.discountPrice != null && (
              <>
                <span className="text-base text-zinc-500 line-through font-semibold">
                  {formatInr(product.price)}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                  Save {off}%
                </span>
              </>
            )}
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Select Size
              </span>
              <span className="text-xs text-zinc-400">
                {size && selectedSizeStock > 0 && selectedSizeStock <= 5 ? (
                  <strong className="text-amber-400">Only {selectedSizeStock} left!</strong>
                ) : (
                  "Oversized Boxy Fit"
                )}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {SIZES.map((s) => {
                const stock = stockFor(product, s);
                const isSelected = size === s;
                const isOos = stock <= 0;

                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isOos}
                    onClick={() => setSize(s)}
                    className={`py-3.5 rounded-xl text-sm font-black transition-all border flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-white text-black border-white shadow-xl scale-105"
                        : isOos
                        ? "border-zinc-800 bg-zinc-950/40 text-zinc-600 line-through cursor-not-allowed"
                        : "border-white/15 bg-zinc-900/80 text-zinc-200 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    <span>{s}</span>
                    <span className={`text-[10px] font-normal mt-0.5 ${isOos ? "text-zinc-600" : isSelected ? "text-zinc-800" : "text-zinc-500"}`}>
                      {isOos ? "OOS" : `${stock} left`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to Bag CTA */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={oos || !size || selectedSizeStock <= 0}
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2.5 py-4.5 rounded-2xl text-xs font-black tracking-[0.2em] text-black uppercase shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag!</span>
                </>
              ) : oos || selectedSizeStock <= 0 ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag • {formatInr(sale)}</span>
                </>
              )}
            </button>

            {/* Free shipping perk note */}
            <p className="text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Free Express Delivery across India on orders &gt; ₹999</span>
            </p>
          </div>

          {/* Collapsible Accordions */}
          <div className="border-t border-white/10 divide-y divide-white/10 pt-2">
            {/* Accordion 1: Fabric & Fit */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === "fabric" ? null : "fabric")}
                className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-white cursor-pointer"
              >
                <span>Fabric & Silhouette</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSection === "fabric" ? "rotate-180 text-amber-400" : "text-zinc-500"
                  }`}
                />
              </button>
              {openSection === "fabric" && (
                <div className="mt-3 space-y-2 text-xs text-zinc-300 leading-relaxed animate-fade-in">
                  <p>• <strong>240 GSM</strong> Heavyweight French Terry 100% Combed Cotton.</p>
                  <p>• Drop shoulder, boxy silhouette designed for standard oversized drape.</p>
                  <p>• High-density screen print with fade-resistant discharge inks.</p>
                  <p>• Pre-shrunk & bio-washed for ultra-soft handfeel.</p>
                </div>
              )}
            </div>

            {/* Accordion 2: Size Chart */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === "size" ? null : "size")}
                className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-white cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Size & Measurement Guide</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSection === "size" ? "rotate-180 text-amber-400" : "text-zinc-500"
                  }`}
                />
              </button>
              {openSection === "size" && (
                <div className="mt-3 overflow-x-auto text-xs text-zinc-300 animate-fade-in">
                  <table className="w-full text-left border border-white/10 rounded-xl overflow-hidden">
                    <thead className="bg-white/5 text-[11px] font-bold uppercase text-zinc-400">
                      <tr>
                        <th className="p-2">Size</th>
                        <th className="p-2">Chest (Inches)</th>
                        <th className="p-2">Length (Inches)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <tr><td className="p-2 font-bold text-white">S</td><td className="p-2">42</td><td className="p-2">28</td></tr>
                      <tr><td className="p-2 font-bold text-white">M</td><td className="p-2">44</td><td className="p-2">29</td></tr>
                      <tr><td className="p-2 font-bold text-white">L</td><td className="p-2">46</td><td className="p-2">30</td></tr>
                      <tr><td className="p-2 font-bold text-white">XL</td><td className="p-2">48</td><td className="p-2">31</td></tr>
                    </tbody>
                  </table>
                  <p className="mt-2 text-[11px] text-zinc-500 italic">
                    Note: For a standard fit, size down. For intended streetwear oversized fit, order true to size.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 3: Delivery & Returns */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === "shipping" ? null : "shipping")}
                className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-white cursor-pointer"
              >
                <span>Delivery & Hassle-Free Returns</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSection === "shipping" ? "rotate-180 text-amber-400" : "text-zinc-500"
                  }`}
                />
              </button>
              {openSection === "shipping" && (
                <div className="mt-3 space-y-2 text-xs text-zinc-300 leading-relaxed animate-fade-in">
                  <p>• Dispatched within 24-48 hours from our Mumbai fulfillment hub.</p>
                  <p>• Delivered across metro cities in 2-4 business days.</p>
                  <p>• 7-day hassle-free exchange/return policy with doorstep pickup.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
