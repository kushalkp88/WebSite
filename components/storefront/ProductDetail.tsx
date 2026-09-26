"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { 
  Heart, 
  Star, 
  Truck, 
  Ruler, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  ShoppingBag, 
  Check 
} from "lucide-react";
import {
  formatInr,
  getProductColorDots,
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
  const [isReduced, setIsReduced] = useState(false);

  const thumbContainerRef = useRef<HTMLDivElement>(null);

  const oos = isOutOfStock(product);
  const sale = salePrice(product);
  const off = percentOff(product);

  const colorDots = useMemo(() => {
    return getProductColorDots(product);
  }, [product]);

  const activeColorIndex = useMemo(() => {
    if (colorDots.length === 0) return 0;
    if (activeImg < colorDots.length) return activeImg;
    return 0;
  }, [colorDots, activeImg]);

  // Auto-scroll the active thumbnail into view when activeImg changes
  useEffect(() => {
    if (thumbContainerRef.current) {
      const activeEl = thumbContainerRef.current.children[activeImg] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeImg]);

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
      image: product.imageUrls[activeImg] ?? product.imageUrls[0] ?? "",
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
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-10">
      <div className="grid gap-8 lg:gap-12 lg:grid-cols-12">
        {/* Left Gallery: 7 cols (Veirdo Model Portrait 3:4 Aspect Ratio) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          {/* Main Large Model Image */}
          <div 
            onClick={() => setIsReduced((v) => !v)}
            className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-100 border border-zinc-200 shadow-sm cursor-pointer select-none group"
            title="Click to reduce / expand image size"
          >
            <ProductImage
              src={product.imageUrls[activeImg] ?? product.imageUrls[0]}
              alt={product.title}
              className={`h-full w-full object-cover object-top transition-all duration-300 ease-out active:scale-90 ${
                isReduced ? "scale-[0.88] p-3 rounded-2xl" : "scale-100"
              }`}
            />

            {/* Prev / Next Image Navigation Arrows */}
            {product.imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImg((prev) => (prev === 0 ? product.imageUrls.length - 1 : prev - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImg((prev) => (prev === product.imageUrls.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Compact Navigation Dots in Pill (Constant Sleek White) */}
            {product.imageUrls.length > 1 && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 hover:bg-black/75 backdrop-blur-md rounded-full shadow-lg border border-white/20 select-none pointer-events-auto transition-all"
              >
                {product.imageUrls.map((_, i) => {
                  const isActive = i === activeImg;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`View image ${i + 1}`}
                      onClick={() => setActiveImg(i)}
                      className={`rounded-full transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "w-2.5 h-2.5 bg-white ring-2 ring-white/40 scale-125 shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                          : "w-2 h-2 bg-white/40 hover:bg-white/80 hover:scale-110"
                      }`}
                    />
                  );
                })}
              </div>
            )}

            {/* Floating Badges */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1 sm:gap-1.5 z-10">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className="bg-white/95 text-zinc-900 border border-zinc-200 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg shadow-2xs backdrop-blur-md"
                >
                  {b}
                </span>
              ))}
              {off > 0 && (
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg shadow-2xs">
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
                  image: product.imageUrls[activeImg] ?? product.imageUrls[0],
                  price: sale,
                })
              }
              className="absolute top-3 sm:top-4 right-3 sm:right-4 grid h-9 sm:h-10 w-9 sm:w-10 place-items-center rounded-full bg-white/90 text-zinc-800 backdrop-blur-md hover:bg-white hover:text-black transition-all shadow-2xs active:scale-90 cursor-pointer"
            >
              <Heart size={16} fill={wished ? "#ef4444" : "none"} className={`sm:w-[18px] sm:h-[18px] ${wished ? "text-red-500" : ""}`} />
            </button>
          </div>

          {/* Thumbnail row (Portrait 3:4 Ratio) */}
          {product.imageUrls.length > 1 && (
            <div className="space-y-1.5">
              <div 
                ref={thumbContainerRef}
                className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 image-scrollbar pt-1 select-none"
              >
                {product.imageUrls.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`group/thumb relative aspect-[3/4] h-20 sm:h-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      i === activeImg
                        ? "border-zinc-950 scale-105 shadow-md ring-2 ring-zinc-950/20"
                        : "border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-400"
                    }`}
                  >
                    <ProductImage src={src} alt="" className="h-full w-full object-cover object-top" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Info: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              {product.section?.toLowerCase() === "unisex" || product.section?.toLowerCase() === "both" ? (
                <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-black border border-purple-200">
                  Unisex
                </span>
              ) : (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black border border-emerald-200">
                  {product.section || "men"}
                </span>
              )}
              <span>•</span>
              <span>{product.category}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
              {product.title}
            </h1>

            {/* Ratings */}
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
              <div className="flex items-center gap-1 font-bold text-amber-500">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span className="underline">{product.reviewCount} customer reviews</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">In High Demand</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 border-y border-zinc-200 py-4">
            <span className="text-3xl font-black text-zinc-900">
              {formatInr(sale)}
            </span>
            {product.discountPrice != null && (
              <>
                <span className="text-base text-zinc-400 line-through font-semibold">
                  {formatInr(product.price)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  Save {off}%
                </span>
              </>
            )}
          </div>

          {/* Colour Swatches with Names */}
          {colorDots.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Colours
                </span>
                {colorDots[activeColorIndex] && (
                  <span className="text-xs font-medium text-zinc-500">
                    Selected:{" "}
                    <strong className="text-zinc-900 font-bold capitalize">
                      {colorDots[activeColorIndex].name}
                    </strong>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {colorDots.map((dot, i) => {
                  const isActive = i === activeColorIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Select ${dot.name}`}
                      onClick={() => {
                        const targetImg = Math.min(i, product.imageUrls.length - 1);
                        setActiveImg(targetImg);
                      }}
                      className={`group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                        isActive
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-sm ring-2 ring-zinc-900/20 scale-[1.02]"
                          : "bg-white text-zinc-800 border-zinc-300 hover:border-zinc-500 hover:text-black"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: dot.bg,
                          boxShadow: dot.isLight
                            ? "inset 0 0 0 1px rgba(0,0,0,0.25)"
                            : "inset 0 0 0 1px rgba(255,255,255,0.25)",
                        }}
                      />
                      <span className="capitalize">{dot.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Select Size
              </span>
              <span className="text-xs text-zinc-500">
                {size && selectedSizeStock > 0 && selectedSizeStock <= 5 ? (
                  <strong className="text-amber-600">Only {selectedSizeStock} left!</strong>
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
                    className={`py-3 rounded-xl text-sm font-black transition-all border flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-md scale-105"
                        : isOos
                        ? "border-zinc-200 bg-zinc-100 text-zinc-400 line-through cursor-not-allowed"
                        : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-500 hover:text-black"
                    }`}
                  >
                    <span>{s}</span>
                    <span className={`text-[10px] font-normal mt-0.5 ${isOos ? "text-zinc-400" : isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
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
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-xs font-black tracking-[0.2em] text-white bg-zinc-900 hover:bg-black uppercase shadow-md transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
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
          </div>

          {/* Free shipping perk note */}
          <p className="text-center text-[11px] text-zinc-600 flex items-center justify-center gap-1.5 pt-1">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Free Express Delivery across India on orders &gt; ₹999</span>
          </p>

          {/* Collapsible Accordions */}
          <div className="border-t border-zinc-200 divide-y divide-zinc-200 pt-2">
            {/* Accordion 1: Fabric & Fit */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === "fabric" ? null : "fabric")}
                className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-900 cursor-pointer"
              >
                <span>Fabric & Silhouette</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSection === "fabric" ? "rotate-180 text-emerald-600" : "text-zinc-400"
                  }`}
                />
              </button>
              {openSection === "fabric" && (
                <div className="mt-3 space-y-2 text-xs text-zinc-600 leading-relaxed animate-fade-in">
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
                className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-900 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Size & Measurement Guide</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSection === "size" ? "rotate-180 text-emerald-600" : "text-zinc-400"
                  }`}
                />
              </button>
              {openSection === "size" && (
                <div className="mt-3 overflow-x-auto text-xs text-zinc-600 animate-fade-in">
                  <table className="w-full text-left border border-zinc-200 rounded-xl overflow-hidden">
                    <thead className="bg-zinc-50 text-[11px] font-bold uppercase text-zinc-700">
                      <tr>
                        <th className="p-2">Size</th>
                        <th className="p-2">Chest (Inches)</th>
                        <th className="p-2">Length (Inches)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      <tr><td className="p-2 font-bold text-zinc-900">S</td><td className="p-2">42</td><td className="p-2">28</td></tr>
                      <tr><td className="p-2 font-bold text-zinc-900">M</td><td className="p-2">44</td><td className="p-2">29</td></tr>
                      <tr><td className="p-2 font-bold text-zinc-900">L</td><td className="p-2">46</td><td className="p-2">30</td></tr>
                      <tr><td className="p-2 font-bold text-zinc-900">XL</td><td className="p-2">48</td><td className="p-2">31</td></tr>
                    </tbody>
                  </table>
                  <p className="mt-2 text-[11px] text-zinc-400 italic">
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
                className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-900 cursor-pointer"
              >
                <span>Delivery & Hassle-Free Returns</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSection === "shipping" ? "rotate-180 text-emerald-600" : "text-zinc-400"
                  }`}
                />
              </button>
              {openSection === "shipping" && (
                <div className="mt-3 space-y-2 text-xs text-zinc-600 leading-relaxed animate-fade-in">
                  <p>• Dispatched within 24-48 hours from our fulfillment hub.</p>
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
