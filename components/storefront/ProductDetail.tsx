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
  Check,
  Info,
  X
} from "lucide-react";
import {
  formatInr,
  getCleanImageUrl,
  getProductColorDots,
  isOutOfStock,
  percentOff,
  salePrice,
  SIZES,
  stockFor,
  type ProductDTO,
  type Size,
} from "@/lib/product";
import { useShopActions, useIsWished } from "@/lib/cart-store";
import { ProductImage } from "./ProductImage";
import { SizeGuide, detectSizeCategory } from "./SizeGuide";

export type GsmOption = {
  name: string;
  gsm: number;
  tagline: string;
  description: string;
  priceOffset: number;
  badge?: string;
};

export const GSM_CONFIG_BY_CATEGORY: Record<"regular" | "oversized" | "crop-top", GsmOption[]> = {
  regular: [
    {
      name: "Gentle",
      gsm: 180,
      tagline: "Light & Soft",
      description: "180 GSM — Gentle combed cotton. Featherlight, breathable, and soft against the skin for relaxed all-day comfort.",
      priceOffset: -50,
    },
    {
      name: "Resonant",
      gsm: 240,
      tagline: "Signature Balance",
      description: "240 GSM — Resonant everyday classic. Structured drape with durable comfort and crisp shape retention.",
      priceOffset: 0,
      badge: "Popular",
    },
    {
      name: "Majestic",
      gsm: 260,
      tagline: "Heavyweight Luxury",
      description: "260 GSM — Majestic dense cotton. Maximum tailored structure, zero cling, and rich, substantial feel.",
      priceOffset: 100,
    },
  ],
  oversized: [
    {
      name: "Breeze",
      gsm: 180,
      tagline: "Light & Airy",
      description: "180 GSM — Breeze lightweight cotton. Fluid drop-shoulder drape engineered for effortless warm-weather style.",
      priceOffset: -50,
    },
    {
      name: "Gale",
      gsm: 240,
      tagline: "Signature Heavy",
      description: "240 GSM — Gale heavyweight streetwear cotton. Distinctive boxy structure, shape retention, and premium handfeel.",
      priceOffset: 0,
      badge: "Popular",
    },
    {
      name: "Storm",
      gsm: 260,
      tagline: "Ultra Heavyweight",
      description: "260 GSM — Storm ultra-dense architectural cotton. Maximum boxy silhouette, zero cling, built to endure.",
      priceOffset: 100,
    },
  ],
  "crop-top": [
    {
      name: "Spark",
      gsm: 180,
      tagline: "Breezy & Light",
      description: "180 GSM — Spark ultra-soft breathable cotton. Featherlight, cooling feel designed for effortless cropped silhouettes.",
      priceOffset: -50,
    },
    {
      name: "Flame",
      gsm: 240,
      tagline: "Signature Sculpt",
      description: "240 GSM — Flame mid-heavy cotton. Structured crop profile that holds its cut without folding or clinging.",
      priceOffset: 0,
      badge: "Popular",
    },
    {
      name: "Blaze",
      gsm: 260,
      tagline: "Dense & Bold",
      description: "260 GSM — Blaze luxury dense cotton. Bold architectural crop shape with crisp lines and premium durability.",
      priceOffset: 100,
    },
  ],
};

export function getGsmConfigForProduct(category?: string, title?: string): {
  categoryKey: "regular" | "oversized" | "crop-top";
  options: GsmOption[];
  fitLabel: string;
} | null {
  const cat = detectSizeCategory(category, title);
  if (cat === "regular") {
    return { categoryKey: "regular", options: GSM_CONFIG_BY_CATEGORY.regular, fitLabel: "Regular Fit" };
  }
  if (cat === "oversized") {
    return { categoryKey: "oversized", options: GSM_CONFIG_BY_CATEGORY.oversized, fitLabel: "Oversized Fit (OS)" };
  }
  if (cat === "crop-top") {
    return { categoryKey: "crop-top", options: GSM_CONFIG_BY_CATEGORY["crop-top"], fitLabel: "Crop Tops" };
  }
  return null;
}

export function ProductDetail({ product }: { product: ProductDTO }) {
  const [size, setSize] = useState<Size | null>(() => {
    // Default to first available size
    return SIZES.find((s) => stockFor(product, s) > 0) ?? null;
  });
  const [activeImg, setActiveImg] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("fabric");
  const [justAdded, setJustAdded] = useState(false);
  const [isReduced, setIsReduced] = useState(false);

  const gsmConfig = useMemo(() => {
    return getGsmConfigForProduct(product.category, product.title);
  }, [product.category, product.title]);

  const isGsmSupported = gsmConfig !== null;
  const gsmOptions = gsmConfig?.options ?? [];

  // Default to index 1 (240 GSM - Resonant / Gale / Flame)
  const [selectedGsmIndex, setSelectedGsmIndex] = useState(1);
  const selectedGsm = gsmOptions[selectedGsmIndex] ?? gsmOptions[1] ?? null;

  const [showGsmModal, setShowGsmModal] = useState(false);

  const thumbContainerRef = useRef<HTMLDivElement>(null);

  const oos = isOutOfStock(product);
  const sale = salePrice(product);
  const off = percentOff(product);

  const currentPriceOffset = selectedGsm ? selectedGsm.priceOffset : 0;
  const currentSale = Math.max(0, sale + currentPriceOffset);
  const currentMrp = Math.max(0, product.price + currentPriceOffset);

  const colorDots = useMemo(() => {
    return getProductColorDots(product);
  }, [product]);

  const activeColorIndex = useMemo(() => {
    if (colorDots.length === 0) return 0;
    const matchIdx = colorDots.findIndex((dot) => dot.imageIndices.includes(activeImg));
    if (matchIdx !== -1) return matchIdx;
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

  const { addToCart, openBag, toggleWishlist } = useShopActions();
  const wished = useIsWished(product.id);

  function handleAdd() {
    if (!size || oos) return;
    const max = stockFor(product, size);
    if (max <= 0) return;

    addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.imageUrls[activeImg] ?? product.imageUrls[0] ?? "",
      price: currentSale,
      size,
      qty: 1,
      maxStock: max,
      gsm: isGsmSupported ? selectedGsm.name : undefined,
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
              variant="detail"
              priority
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
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`group/thumb relative aspect-[3/4] h-20 sm:h-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      i === activeImg
                        ? "border-zinc-950 scale-105 shadow-md ring-2 ring-zinc-950/20"
                        : "border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-400"
                    }`}
                  >
                    <ProductImage
                      src={src}
                      alt=""
                      variant="thumb"
                      className="h-full w-full object-cover object-top"
                    />
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
              {formatInr(currentSale)}
            </span>
            {product.discountPrice != null && (
              <>
                <span className="text-base text-zinc-400 line-through font-semibold">
                  {formatInr(currentMrp)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  Save {off}%
                </span>
              </>
            )}
            {isGsmSupported && (
              <span className="text-xs font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md ml-auto">
                {selectedGsm.name} Edition
              </span>
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
                      key={dot.name}
                      type="button"
                      aria-label={`Select ${dot.name}`}
                      onClick={() => {
                        setActiveImg(dot.firstImageIndex);
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

          {/* Fabric Density / GSM Selector (Regular fits, Oversized & Crop tops only) */}
          {isGsmSupported && gsmOptions.length > 0 && selectedGsm && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Fabric Density
                  </span>
                  {/* Small hidden info icon explaining GSM */}
                  <button
                    type="button"
                    onClick={() => setShowGsmModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-black transition-colors rounded-full px-2 py-0.5 hover:bg-zinc-100 cursor-pointer border border-transparent hover:border-zinc-200"
                    title="Click to learn about fabric density & weights"
                  >
                    <Info size={12} className="text-zinc-500" />
                    <span className="underline decoration-dotted underline-offset-2">What is this?</span>
                  </button>
                </div>

                <span className="text-xs font-medium text-zinc-500">
                  Selected:{" "}
                  <strong className="text-zinc-900 font-bold">
                    {selectedGsm.name}
                  </strong>
                </span>
              </div>

              {/* 3 Selector Cards based on product fit */}
              <div className="grid grid-cols-3 gap-2.5">
                {gsmOptions.map((opt, idx) => {
                  const isSelected = selectedGsmIndex === idx;
                  const optPrice = Math.max(0, sale + opt.priceOffset);

                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedGsmIndex(idx)}
                      className={`relative p-3 rounded-xl transition-all border text-left flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-zinc-900/20 scale-[1.02]"
                          : "bg-white text-zinc-800 border-zinc-300 hover:border-zinc-500 hover:text-black"
                      }`}
                    >
                      {opt.badge && (
                        <span
                          className={`absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isSelected
                              ? "bg-emerald-400 text-zinc-950 font-black shadow-xs"
                              : "bg-zinc-100 text-zinc-700 border border-zinc-300"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black tracking-tight">
                            {opt.name}
                          </span>
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-white bg-white text-zinc-900"
                                : "border-zinc-300 bg-transparent"
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                          </div>
                        </div>
                        <p
                          className={`text-[10px] mt-0.5 font-medium ${
                            isSelected ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          {opt.tagline}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between">
                        <span
                          className={`text-xs font-black ${
                            isSelected ? "text-white" : "text-zinc-900"
                          }`}
                        >
                          {formatInr(optPrice)}
                        </span>
                        {opt.priceOffset !== 0 && (
                          <span
                            className={`text-[10px] font-bold ${
                              isSelected
                                ? opt.priceOffset > 0
                                  ? "text-zinc-300"
                                  : "text-emerald-300"
                                : opt.priceOffset > 0
                                ? "text-zinc-500"
                                : "text-emerald-600"
                            }`}
                          >
                            {opt.priceOffset > 0
                              ? `+${formatInr(opt.priceOffset)}`
                              : `-${formatInr(Math.abs(opt.priceOffset))}`}
                          </span>
                        )}
                      </div>
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
              <div className="flex items-center gap-2">
                {size && selectedSizeStock > 0 && selectedSizeStock <= 5 && (
                  <span className="text-xs text-amber-600 font-semibold">
                    Only {selectedSizeStock} left!
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpenSection("size");
                    const el = document.getElementById("product-accordions");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-black hover:underline cursor-pointer"
                >
                  <Ruler size={13} className="text-zinc-500" />
                  <span>Size Guide (Inches)</span>
                </button>
              </div>
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
                  <span>Add to Bag • {formatInr(currentSale)}</span>
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
          <div id="product-accordions" className="border-t border-zinc-200 divide-y divide-zinc-200 pt-2 scroll-mt-24">
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
                  <p>
                    • <strong>{selectedGsm ? `${selectedGsm.gsm} GSM (${selectedGsm.name} Edition)` : "240 GSM"}</strong>{" "}
                    {selectedGsm?.gsm === 180
                      ? "Featherlight combed cotton for airy, effortless everyday comfort."
                      : selectedGsm?.gsm === 260
                      ? "Ultra-dense luxury cotton for maximum structured architectural drape."
                      : "Signature heavyweight streetwear cotton with shape retention."}
                  </p>
                  <p>• Tailored silhouette designed for comfortable everyday drape.</p>
                  <p>• High-density screen print with fade-resistant discharge inks.</p>
                  <p>• Pre-shrunk & bio-washed for ultra-soft handfeel.</p>
                </div>
              )}
            </div>

            {/* Accordion 2: Size Chart & Measurement Guide */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === "size" ? null : "size")}
                className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-900 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Size & Measurement Guide (Inches)</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSection === "size" ? "rotate-180 text-emerald-600" : "text-zinc-400"
                  }`}
                />
              </button>
              {openSection === "size" && (
                <SizeGuide
                  initialCategory={detectSizeCategory(product.category, product.title)}
                  selectedSize={size ?? undefined}
                />
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

      {/* GSM Explanatory Dialog Modal */}
      {showGsmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowGsmModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                  <Info size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-zinc-900">
                    Understanding Fabric Density (GSM)
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Find your ideal streetwear drape & weight
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGsmModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-600 leading-relaxed">
              <strong>GSM</strong> stands for <em>Grams per Square Meter</em>. It is the global standard metric measuring the density, thickness, and heft of the fabric. A higher GSM gives a more structured, boxy drape that holds its silhouette without clinging.
            </p>

            {/* 3 Tiers Detailed breakdown for this product */}
            <div className="space-y-2.5 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Available options for this product:
              </p>
              {gsmOptions.map((opt, idx) => (
                <div
                  key={opt.name}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    selectedGsmIndex === idx
                      ? "border-zinc-900 bg-zinc-50 shadow-xs ring-1 ring-zinc-900/10"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-zinc-900">
                        {opt.name}
                      </span>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800">
                        {opt.gsm} GSM
                      </span>
                      {opt.badge && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black text-zinc-900">
                      {formatInr(Math.max(0, sale + opt.priceOffset))}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Complete GSM & Fit Nomenclature Guide Matrix */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Official Nomenclature by Fit:
              </p>
              <div className="border border-zinc-200 rounded-xl overflow-hidden text-[11px] bg-zinc-50/50">
                <table className="w-full text-center">
                  <thead className="bg-zinc-100 border-b border-zinc-200 font-black text-zinc-900 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-2.5 text-left">GSM</th>
                      <th className={`py-2 px-2 ${gsmConfig?.categoryKey === "regular" ? "bg-zinc-900 text-white" : ""}`}>
                        Regular Types
                      </th>
                      <th className={`py-2 px-2 ${gsmConfig?.categoryKey === "oversized" ? "bg-zinc-900 text-white" : ""}`}>
                        OS (Oversized)
                      </th>
                      <th className={`py-2 px-2 ${gsmConfig?.categoryKey === "crop-top" ? "bg-zinc-900 text-white" : ""}`}>
                        Crop tops
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-medium">
                    <tr className={selectedGsm?.gsm === 180 ? "bg-emerald-50/70" : ""}>
                      <td className="py-2 px-2.5 text-left font-mono font-bold text-zinc-900">180</td>
                      <td className={`py-2 px-2 ${gsmConfig?.categoryKey === "regular" ? "font-bold text-zinc-950" : "text-zinc-600"}`}>
                        Gentle
                      </td>
                      <td className={`py-2 px-2 ${gsmConfig?.categoryKey === "oversized" ? "font-bold text-zinc-950" : "text-zinc-600"}`}>
                        Breeze
                      </td>
                      <td className={`py-2 px-2 ${gsmConfig?.categoryKey === "crop-top" ? "font-bold text-zinc-950" : "text-zinc-600"}`}>
                        Spark
                      </td>
                    </tr>
                    <tr className={selectedGsm?.gsm === 240 ? "bg-emerald-50/70" : ""}>
                      <td className="py-2 px-2.5 text-left font-mono font-bold text-zinc-900">240</td>
                      <td className={`py-2 px-2 ${gsmConfig?.categoryKey === "regular" ? "font-bold text-zinc-950" : "text-zinc-600"}`}>
                        Resonant
                      </td>
                      <td className={`py-2 px-2 ${gsmConfig?.categoryKey === "oversized" ? "font-bold text-zinc-950" : "text-zinc-600"}`}>
                        Gale
                      </td>
                      <td className={`py-2 px-2 ${gsmConfig?.categoryKey === "crop-top" ? "font-bold text-zinc-950" : "text-zinc-600"}`}>
                        Flame
                      </td>
                    </tr>
                    <tr className={selectedGsm?.gsm === 260 ? "bg-emerald-50/70" : ""}>
                      <td className="py-2 px-2.5 text-left font-mono font-bold text-zinc-900">260</td>
                      <td className={`py-2 px-2 ${gsmConfig?.categoryKey === "regular" ? "font-bold text-zinc-950" : "text-zinc-600"}`}>
                        Majestic
                      </td>
                      <td className={`py-2 px-2 ${gsmConfig?.categoryKey === "oversized" ? "font-bold text-zinc-950" : "text-zinc-600"}`}>
                        Storm
                      </td>
                      <td className={`py-2 px-2 ${gsmConfig?.categoryKey === "crop-top" ? "font-bold text-zinc-950" : "text-zinc-600"}`}>
                        Blaze
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowGsmModal(false)}
                className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-zinc-900 hover:bg-black transition-colors cursor-pointer shadow-md"
              >
                Got It, Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
