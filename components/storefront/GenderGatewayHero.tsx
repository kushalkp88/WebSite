"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Flame } from "lucide-react";

const HERO_MEN_IMAGE =
  "https://ik.imagekit.io/unhinged/hero/men-model.jpg?tr=w-600,h-600,fo-auto,q-85,f-auto";
const HERO_WOMEN_IMAGE =
  "https://ik.imagekit.io/unhinged/hero/women-model.jpg?tr=w-600,h-600,fo-auto,q-85,f-auto";

export function GenderGatewayHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGender = searchParams.get("gender")?.toLowerCase();
  const isSaleActive = searchParams.get("sale") === "true";
  const [menSrc, setMenSrc] = useState(HERO_MEN_IMAGE);
  const [womenSrc, setWomenSrc] = useState(HERO_WOMEN_IMAGE);

  function handleSelect(target: "men" | "women" | "sale") {
    if (target === "sale") {
      router.push("/catalog?sale=true");
      return;
    }
    const sp = new URLSearchParams();
    sp.set("gender", target);
    router.push(`/catalog?${sp.toString()}`);
  }

  return (
    <section className="relative overflow-hidden bg-[#0a0a0d] py-8 sm:py-12 md:py-16 border-b border-zinc-800 select-none">
      {/* Industrial Tech Streetwear Grid Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="streetwear-dark-grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="0.75"
            />
            <circle cx="0" cy="0" r="1.5" fill="rgba(255, 255, 255, 0.6)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#streetwear-dark-grid)" />
      </svg>

      {/* Streetwear Giant Outlined Watermark in Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="font-black text-[18vw] leading-none uppercase tracking-tighter text-white/[0.025] select-none whitespace-nowrap">
          UNHINGED
        </span>
      </div>

      {/* Atmospheric Ambient Glow behind circles */}
      <div className="absolute top-1/2 left-[15%] -translate-y-1/2 -translate-x-1/2 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 right-[15%] -translate-y-1/2 translate-x-1/2 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-rose-500/15 blur-[90px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
        {/* Centered Brand Tagline */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight uppercase leading-[1.1] text-white">
            Wear your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              chaos
            </span>{" "}
            with confidence
          </h1>
        </div>

        {/* Three-Column Circular Portals */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-6 md:gap-10 max-w-4xl lg:max-w-5xl mx-auto items-center justify-items-center">
          {/* ================= MEN'S CIRCULAR PORTAL ================= */}
          <div
            onClick={() => handleSelect("men")}
            className="group flex flex-col items-center cursor-pointer w-full"
          >
            {/* Circular Frame Wrapper */}
            <div
              className={`relative w-24 h-24 min-[380px]:w-28 min-[380px]:h-28 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full p-1 sm:p-2 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.8)] ${
                currentGender === "men" && !isSaleActive
                  ? "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 ring-4 ring-emerald-400/30 scale-105"
                  : "bg-gradient-to-b from-white/25 via-zinc-800 to-white/10 group-hover:from-emerald-400 group-hover:via-emerald-500/50 group-hover:to-cyan-400 group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(16,185,129,0.35)]"
              }`}
            >
              {/* Inner Circle Clipping Container */}
              <div className="w-full h-full rounded-full overflow-hidden relative bg-zinc-900 border border-black">
                {/* Male Model Image */}
                <Image
                  src={menSrc}
                  alt="Men's Streetwear Collection"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 176px, 256px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  onError={() => setMenSrc("/hero/men-model.jpg")}
                />

                {/* Vignette Overlay for Photographic Depth */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              </div>
            </div>

            {/* Streetwear Pill Button */}
            <div className="mt-3 sm:mt-5 md:mt-6 w-full max-w-[105px] min-[380px]:max-w-[125px] sm:max-w-[170px] md:max-w-[190px]">
              <Link
                href="/catalog?gender=men"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect("men");
                }}
                className={`relative flex items-center justify-center gap-1 sm:gap-2 w-full rounded-full py-2 sm:py-3 md:py-3.5 text-[10px] min-[380px]:text-xs sm:text-sm font-black tracking-[0.14em] sm:tracking-[0.18em] uppercase transition-all duration-300 shadow-xl ${
                  currentGender === "men" && !isSaleActive
                    ? "bg-emerald-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105"
                    : "bg-white text-zinc-950 hover:bg-emerald-400 hover:text-black group-hover:bg-emerald-400 group-hover:text-black group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                }`}
              >
                <span>MEN</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1 hidden min-[380px]:inline-block" />
              </Link>
            </div>
          </div>

          {/* ================= WOMEN'S CIRCULAR PORTAL ================= */}
          <div
            onClick={() => handleSelect("women")}
            className="group flex flex-col items-center cursor-pointer w-full"
          >
            {/* Circular Frame Wrapper */}
            <div
              className={`relative w-24 h-24 min-[380px]:w-28 min-[380px]:h-28 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full p-1 sm:p-2 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.8)] ${
                currentGender === "women" && !isSaleActive
                  ? "bg-gradient-to-b from-teal-400 via-cyan-500 to-sky-600 ring-4 ring-cyan-400/30 scale-105"
                  : "bg-gradient-to-b from-white/25 via-zinc-800 to-white/10 group-hover:from-teal-400 group-hover:via-cyan-500/50 group-hover:to-sky-400 group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(6,182,212,0.35)]"
              }`}
            >
              {/* Inner Circle Clipping Container */}
              <div className="w-full h-full rounded-full overflow-hidden relative bg-zinc-900 border border-black">
                {/* Female Model Image */}
                <Image
                  src={womenSrc}
                  alt="Women's Streetwear Collection"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 176px, 256px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  onError={() => setWomenSrc("/hero/women-model.jpg")}
                />

                {/* Vignette Overlay for Photographic Depth */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              </div>
            </div>

            {/* Streetwear Pill Button */}
            <div className="mt-3 sm:mt-5 md:mt-6 w-full max-w-[105px] min-[380px]:max-w-[125px] sm:max-w-[170px] md:max-w-[190px]">
              <Link
                href="/catalog?gender=women"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect("women");
                }}
                className={`relative flex items-center justify-center gap-1 sm:gap-2 w-full rounded-full py-2 sm:py-3 md:py-3.5 text-[10px] min-[380px]:text-xs sm:text-sm font-black tracking-[0.14em] sm:tracking-[0.18em] uppercase transition-all duration-300 shadow-xl ${
                  currentGender === "women" && !isSaleActive
                    ? "bg-cyan-400 text-black shadow-[0_0_25px_rgba(6,182,212,0.5)] scale-105"
                    : "bg-white text-zinc-950 hover:bg-cyan-400 hover:text-black group-hover:bg-cyan-400 group-hover:text-black group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                }`}
              >
                <span>WOMEN</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1 hidden min-[380px]:inline-block" />
              </Link>
            </div>
          </div>

          {/* ================= SALE & OFFERS CIRCULAR PORTAL (GRAPHIC EMBLEM) ================= */}
          <div
            onClick={() => handleSelect("sale")}
            className="group flex flex-col items-center cursor-pointer w-full relative"
          >
            {/* Circular Frame Wrapper with Sale Badge */}
            <div
              className={`relative w-24 h-24 min-[380px]:w-28 min-[380px]:h-28 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full p-1 sm:p-2 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.8)] ${
                isSaleActive
                  ? "bg-gradient-to-b from-rose-500 via-red-500 to-amber-500 ring-4 ring-rose-500/40 scale-105 shadow-[0_0_40px_rgba(244,63,94,0.55)]"
                  : "bg-gradient-to-b from-rose-500/40 via-zinc-800 to-amber-500/30 group-hover:from-rose-500 group-hover:via-red-500/70 group-hover:to-amber-500 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(244,63,94,0.45)]"
              }`}
            >
              {/* Floating Sale Tag on Top of Portal */}
              <div className="absolute -top-2.5 sm:-top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-rose-950/60 border border-white/25 whitespace-nowrap">
                <Flame size={12} className="text-amber-200 fill-amber-200 animate-pulse shrink-0" />
                <span>HOT OFFERS</span>
              </div>

              {/* Inner Circle Graphic Container - Streetwear Badge with Icon & SALE */}
              <div className="w-full h-full rounded-full overflow-hidden relative bg-gradient-to-br from-[#18181f] via-[#0c0c10] to-[#050508] border border-rose-950/80 flex flex-col items-center justify-center p-2 sm:p-4 select-none">
                {/* Atmospheric Warm Radial Aura */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.28)_0%,rgba(245,158,11,0.12)_45%,transparent_75%)] pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-75" />

                {/* Subtle Technical Dashed Blueprint Ring */}
                <div className="absolute inset-2 sm:inset-3 rounded-full border border-dashed border-rose-500/25 pointer-events-none group-hover:border-rose-500/40 transition-colors" />

                {/* Glowing Streetwear Flame Icon */}
                <div className="relative z-10 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                  <div className="relative flex items-center justify-center">
                    {/* Outer Crimson Glow Flame */}
                    <Flame className="w-8 h-8 min-[380px]:w-10 min-[380px]:h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-rose-500 fill-rose-500/90 drop-shadow-[0_0_22px_rgba(244,63,94,0.85)]" />
                    {/* Inner Golden Ember Flame */}
                    <Flame className="w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-amber-300 fill-amber-300 absolute bottom-0 drop-shadow-[0_0_12px_rgba(252,211,77,0.95)] animate-pulse" />
                  </div>
                </div>

                {/* Streetwear Typographic Text */}
                <div className="relative z-10 mt-0.5 sm:mt-1.5 md:mt-2 text-center">
                  <span className="block font-black text-xs min-[380px]:text-sm sm:text-2xl md:text-3xl lg:text-4xl tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 drop-shadow-[0_2px_12px_rgba(244,63,94,0.6)]">
                    SALE
                  </span>
                  <span className="hidden sm:block text-[8px] md:text-[9px] lg:text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase mt-0.5">
                    UP TO 60% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Streetwear Pill Button */}
            <div className="mt-3 sm:mt-5 md:mt-6 w-full max-w-[105px] min-[380px]:max-w-[125px] sm:max-w-[170px] md:max-w-[190px]">
              <Link
                href="/catalog?sale=true"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect("sale");
                }}
                className={`relative flex items-center justify-center gap-1 sm:gap-2 w-full rounded-full py-2 sm:py-3 md:py-3.5 text-[10px] min-[380px]:text-xs sm:text-sm font-black tracking-[0.14em] sm:tracking-[0.18em] uppercase transition-all duration-300 shadow-xl ${
                  isSaleActive
                    ? "bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] scale-105"
                    : "bg-white text-zinc-950 hover:bg-gradient-to-r hover:from-rose-500 hover:to-amber-500 hover:text-white group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:via-red-500 group-hover:to-amber-500 group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]"
                }`}
              >
                <span>SALE</span>
                <Flame size={13} className="transition-transform group-hover:scale-110 text-amber-500 fill-amber-500 group-hover:text-amber-200 group-hover:fill-amber-200 hidden min-[380px]:inline-block" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
