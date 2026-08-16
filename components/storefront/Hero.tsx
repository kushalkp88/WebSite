"use client";

import Link from "next/link";
import { ArrowDownRight, Sparkles, Flame, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 py-16 sm:py-24 flex items-center justify-center">
      {/* Background Graphic / Image Overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero.jpg"
        alt="INKDROP Streetwear Collection"
        className="absolute inset-0 h-full w-full object-cover object-[center_20%] opacity-40 scale-105"
      />
      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary,#0a0a0a)] via-black/70 to-black/80" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Floating Season Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-1.5 backdrop-blur-md shadow-xl mb-5">
          <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent-color)" }} />
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white">
            SEASON DROP 04 • OVERSIZED SILHOUETTES
          </span>
          <Flame className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Main Headline */}
        <h1 className="font-[family-name:var(--font-instrument)] text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white font-normal leading-[1.02] max-w-4xl mx-auto">
          Raw Streetwear. <br />
          <span className="italic font-light opacity-90">Unfiltered</span> Expression.
        </h1>

        <p className="mt-4 max-w-lg mx-auto text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
          Engineered from 240 GSM combed cotton with precision acid wash finishes and heavyweight boxy drape.
        </p>

        {/* Offer Highlight Box */}
        <div className="mt-6 inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 backdrop-blur-xl shadow-lg">
          <Sparkles className="w-4 h-4" style={{ color: "var(--accent-color)" }} />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300">
            LAUNCH COMBO:
          </span>
          <span
            className="text-xs sm:text-sm font-black tracking-wider"
            style={{ color: "var(--accent-color)" }}
          >
            ANY 2 OVERSIZED TEES @ ₹1099
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href="#catalog"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-[0.16em] text-black transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: "var(--accent-color)" }}
          >
            <span>Explore Collection</span>
            <ArrowDownRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
          </a>

          <Link
            href="/?badge=BEST%20SELLER#catalog"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-[0.16em] text-white border border-white/20 bg-black/60 backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all active:scale-95"
          >
            <span>Best Sellers</span>
          </Link>
        </div>

        {/* Specs Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
            240 GSM French Terry
          </span>
          <span>•</span>
          <span>Pre-Shrunk Bio Washed</span>
          <span>•</span>
          <span>High-Density HD Prints</span>
        </div>
      </div>
    </section>
  );
}
