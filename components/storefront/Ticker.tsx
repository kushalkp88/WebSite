"use client";

import { useThemeSettings } from "@/components/ThemeProvider";

export function Ticker() {
  const { bannerText } = useThemeSettings();
  const loop = `${bannerText}   ·   ${bannerText}   ·   `;

  return (
    <div
      className="relative z-50 overflow-hidden py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-900 border-b border-zinc-200"
      style={{ background: "var(--banner-bg)" }}
    >
      <div className="ticker-track gap-8 px-4">
        <span className="whitespace-nowrap">{loop}</span>
        <span className="whitespace-nowrap" aria-hidden>
          {loop}
        </span>
      </div>
    </div>
  );
}
