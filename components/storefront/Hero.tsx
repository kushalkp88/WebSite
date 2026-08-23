"use client";

import Link from "next/link";
import { ArrowDownRight, Sparkles, Flame, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-purple-50/30 via-white to-white py-12 sm:py-16 flex items-center justify-center">
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Floating Season Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 shadow-2xs mb-5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900">
            UNHINGED ORIGINALS • OVERSIZED COLLECTION
          </span>
          <Flame className="w-3.5 h-3.5 text-amber-500" />
        </div>

        {/* Main Headline */}
        <h1 className="font-[family-name:var(--font-geist-sans)] text-3xl sm:text-5xl lg:text-6xl tracking-tight text-zinc-900 font-black leading-[1.05] max-w-4xl mx-auto uppercase">
          Trending Streetwear <br />
          <span className="text-emerald-600">Buy 2 @ ₹1099</span>
        </h1>

        <p className="mt-3 max-w-lg mx-auto text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
          Engineered 100% combed cotton tees with high-density graphic prints & relaxed boxy drape.
        </p>

        {/* Offer Highlight Box */}
        <div className="mt-5 inline-flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-2.5 shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-900">
            EXCLUSIVE DEAL:
          </span>
          <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-700">
            FLAT 54% OFF + EXTRA ₹150 OFF ON PREPAID
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href="#catalog"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-[0.16em] text-white bg-zinc-900 hover:bg-black transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Explore T-Shirts</span>
            <ArrowDownRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
          </a>

          <Link
            href="/?badge=BEST%20SELLER#catalog"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-[0.16em] text-zinc-900 border border-zinc-300 bg-white hover:bg-zinc-100 transition-all active:scale-95 shadow-2xs"
          >
            <span>Best Sellers</span>
          </Link>
        </div>

        {/* Specs Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            240 GSM Heavyweight Cotton
          </span>
          <span>•</span>
          <span>Pre-Shrunk Bio Washed</span>
          <span>•</span>
          <span>Doorstep Easy Returns</span>
        </div>
      </div>
    </section>
  );
}
