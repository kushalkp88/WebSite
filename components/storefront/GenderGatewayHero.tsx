"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function GenderGatewayHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGender = searchParams.get("gender")?.toLowerCase();

  function handleSelect(gender: "men" | "women") {
    router.push(`/catalog?gender=${gender}`);
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
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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

        {/* Two-Column Circular Portals */}
        <div className="grid grid-cols-2 gap-6 sm:gap-12 md:gap-16 max-w-2xl sm:max-w-3xl mx-auto items-center">
          {/* ================= MEN'S CIRCULAR PORTAL ================= */}
          <div
            onClick={() => handleSelect("men")}
            className="group flex flex-col items-center cursor-pointer"
          >
            {/* Circular Frame Wrapper */}
            <div
              className={`relative w-36 h-36 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full p-1.5 sm:p-2 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.8)] ${
                currentGender === "men"
                  ? "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 ring-4 ring-emerald-400/30 scale-105"
                  : "bg-gradient-to-b from-white/25 via-zinc-800 to-white/10 group-hover:from-emerald-400 group-hover:via-emerald-500/50 group-hover:to-cyan-400 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]"
              }`}
            >
              {/* Inner Circle Clipping Container */}
              <div className="w-full h-full rounded-full overflow-hidden relative bg-zinc-900 border border-black">
                {/* Male Model Image */}
                <Image
                  src="/hero/men-model.jpg"
                  alt="Men's Streetwear Collection"
                  fill
                  priority
                  sizes="(max-width: 640px) 144px, (max-width: 768px) 240px, 288px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Vignette Overlay for Photographic Depth */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              </div>
            </div>

            {/* Streetwear Pill Button */}
            <div className="mt-4 sm:mt-6 w-full max-w-[160px] sm:max-w-[200px]">
              <Link
                href="/catalog?gender=men"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect("men");
                }}
                className={`relative flex items-center justify-center gap-2 w-full rounded-full py-2.5 sm:py-3.5 text-xs sm:text-sm font-black tracking-[0.18em] uppercase transition-all duration-300 shadow-xl ${
                  currentGender === "men"
                    ? "bg-emerald-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105"
                    : "bg-white text-zinc-950 hover:bg-emerald-400 hover:text-black group-hover:bg-emerald-400 group-hover:text-black group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                }`}
              >
                <span>MEN</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ================= WOMEN'S CIRCULAR PORTAL ================= */}
          <div
            onClick={() => handleSelect("women")}
            className="group flex flex-col items-center cursor-pointer"
          >
            {/* Circular Frame Wrapper */}
            <div
              className={`relative w-36 h-36 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full p-1.5 sm:p-2 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.8)] ${
                currentGender === "women"
                  ? "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 ring-4 ring-emerald-400/30 scale-105"
                  : "bg-gradient-to-b from-white/25 via-zinc-800 to-white/10 group-hover:from-emerald-400 group-hover:via-emerald-500/50 group-hover:to-cyan-400 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]"
              }`}
            >
              {/* Inner Circle Clipping Container */}
              <div className="w-full h-full rounded-full overflow-hidden relative bg-zinc-900 border border-black">
                {/* Female Model Image */}
                <Image
                  src="/hero/women-model.jpg"
                  alt="Women's Streetwear Collection"
                  fill
                  priority
                  sizes="(max-width: 640px) 144px, (max-width: 768px) 240px, 288px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Vignette Overlay for Photographic Depth */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              </div>
            </div>

            {/* Streetwear Pill Button */}
            <div className="mt-4 sm:mt-6 w-full max-w-[160px] sm:max-w-[200px]">
              <Link
                href="/catalog?gender=women"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect("women");
                }}
                className={`relative flex items-center justify-center gap-2 w-full rounded-full py-2.5 sm:py-3.5 text-xs sm:text-sm font-black tracking-[0.18em] uppercase transition-all duration-300 shadow-xl ${
                  currentGender === "women"
                    ? "bg-emerald-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105"
                    : "bg-white text-zinc-950 hover:bg-emerald-400 hover:text-black group-hover:bg-emerald-400 group-hover:text-black group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                }`}
              >
                <span>WOMEN</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
