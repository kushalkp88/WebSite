"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame } from "lucide-react";
import type { ProductDTO } from "@/lib/product";
import { formatInr, percentOff, isOutOfStock } from "@/lib/product";

// Custom SVG Icons matching the reference image
function CottonIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 0-3.6 2.3 4 4 0 0 0-4.8 4.2A4.5 4.5 0 0 0 4 13a4.5 4.5 0 0 0 4.5 4.5H8a4 4 0 0 0 4 4 4 4 0 0 0 4-4h-.5A4.5 4.5 0 0 0 20 13a4.5 4.5 0 0 0-.4-1.9 4 4 0 0 0-4-4.8A4 4 0 0 0 12 2z" />
      <path d="M12 11v6" />
      <path d="M9.5 13.5l2.5-2.5 2.5 2.5" />
    </svg>
  );
}

function BioWashIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8v4H8z" />
      <path d="M6 6h12l1 4v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10l1-4z" />
      <circle cx="12" cy="14" r="2.5" />
      <path d="M12 11.5v-1" />
      <path d="M14.5 14h1" />
      <path d="M9.5 14h-1" />
    </svg>
  );
}

function YarnIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="4" rx="6" ry="2" />
      <ellipse cx="12" cy="20" rx="6" ry="2" />
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 9h12" stroke="#EF4444" strokeWidth="2.2" />
      <path d="M6 15h12" stroke="#EF4444" strokeWidth="2.2" />
      <path d="M6 12h12" stroke="#EF4444" strokeWidth="3" />
    </svg>
  );
}

function NoFadeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a4 4 0 0 0-3.5 2 4 4 0 0 0-4.5 4 4.5 4.5 0 0 0 0 5 4 4 0 0 0 4.5 4 4 4 0 0 0 7 0 4 4 0 0 0 4.5-4 4.5 4.5 0 0 0 0-5 4 4 0 0 0-4.5-4A4 4 0 0 0 12 3z" />
      <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" />
    </svg>
  );
}

function CombIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="5" rx="1.5" transform="rotate(-15 12 8.5)" />
      <path d="M5.5 10l-1 5M8.5 9l-1 5M11.5 8l-1 5M14.5 7l-1 5M17.5 6l-1 5M20.5 5l-1 5" />
    </svg>
  );
}

function PreShrunkIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
      <path d="M3 9h18M3 15h18" />
      <path d="M9 3v18M15 3v18" />
    </svg>
  );
}

export function BrandFeatures({ featuredProducts = [] }: { featuredProducts?: ProductDTO[] }) {
  const previewProducts = featuredProducts.slice(0, 4);

  return (
    <section className="bg-white text-zinc-900 border-b border-zinc-200">
      {/* ========================================================================= */}
      {/* THE 6 CORE FEATURES PANEL (Matching User Reference Image) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0d] via-[#0e0e12] to-zinc-950 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-8 backdrop-blur-md shadow-2xl">
              {/* Center Vertical Divider on sm+ screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 relative text-left">
                {/* Vertical Divider Line */}
                <div className="hidden sm:block absolute top-0 bottom-0 left-1/2 w-px bg-zinc-800 -translate-x-1/2" />

                {/* Left Column Features */}
                <div className="space-y-4 sm:space-y-5 sm:pr-4">
                  <div className="flex items-center gap-3.5 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 transition-transform group-hover:scale-110">
                      <CottonIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                        100% Cotton
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
                        Pure combed natural fibers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 transition-transform group-hover:scale-110">
                      <BioWashIcon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                        Bio - Silicon Washed
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
                        Buttery ultra-soft handfeel
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 transition-transform group-hover:scale-110">
                      <YarnIcon className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                        RED-LABELLED Yarn
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
                        High-tensile premium spun yarn
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column Features */}
                <div className="space-y-4 sm:space-y-5 sm:pl-4">
                  <div className="flex items-center gap-3.5 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 transition-transform group-hover:scale-110">
                      <NoFadeIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                        No FADE
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
                        Reactive dyes, washfast color
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 transition-transform group-hover:scale-110">
                      <CombIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                        Combed Cotton
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
                        Zero-lint, durable weave
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 transition-transform group-hover:scale-110">
                      <PreShrunkIcon className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                        Pre-Shrunk
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
                        Retains perfect fit forever
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Link to Dedicated Catalog */}
          <div className="pt-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-zinc-950 bg-white hover:bg-emerald-400 hover:text-black transition-all duration-300 shadow-xl hover:scale-105"
            >
              <span>Explore All Drops</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CURATED TRENDING DROPS PREVIEW (Without heavy filters) */}
      {/* ========================================================================= */}
      {previewProducts.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-end justify-between border-b border-zinc-200 pb-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Featured Capsule</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
                Trending This Week
              </h3>
            </div>

            <Link
              href="/catalog"
              className="group inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <span>View All ({featuredProducts.length})</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 4-Item Streetwear Card Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {previewProducts.map((p) => {
              const off = percentOff(p);
              const oos = isOutOfStock(p);
              const mainImg = p.imageUrls[0] || "/products/rack.jpg";
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-400 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={mainImg}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {oos ? (
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-zinc-900/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-300 shadow-md">
                        OUT OF STOCK
                      </span>
                    ) : off > 0 ? (
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                        {off}% OFF
                      </span>
                    ) : null}
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-1.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {p.category}
                      </p>
                      <h4 className="text-xs sm:text-sm font-black text-zinc-900 line-clamp-1 group-hover:text-emerald-600 transition-colors uppercase">
                        {p.title}
                      </h4>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xs sm:text-sm font-black text-zinc-900">
                        {formatInr(p.discountPrice ?? p.price)}
                      </span>
                      {p.discountPrice && (
                        <span className="text-[10px] sm:text-xs text-zinc-400 line-through font-medium">
                          {formatInr(p.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
