"use client";

import { useState } from "react";
import { 
  Sparkles, 
  RotateCcw, 
  Info
} from "lucide-react";
import { broadcastTheme, DEFAULT_THEME, type ThemePayload } from "@/lib/theme";

const THEME_PRESETS: { name: string; desc: string; theme: ThemePayload }[] = [
  {
    name: "Veirdo White / Clean Fashion (Default)",
    desc: "Clean white storefront aesthetic with emerald accents matching Veirdo.in",
    theme: {
      bgPrimary: "#ffffff",
      accentColor: "#16a34a",
      bannerBg: "#ffffff",
      bannerText: "⚡ FREE SHIPPING ON ORDERS ABOVE ₹999 • 100% COTTON OVERSIZED TEES • BUY ANY 2 @ ₹1099",
    },
  },
  {
    name: "Midnight Obsidian & Gold",
    desc: "Luxury high-fashion street tone",
    theme: {
      bgPrimary: "#09090b",
      accentColor: "#fbbf24",
      bannerBg: "#78350f",
      bannerText: "NEW COLLECTION UNLOCKED • EXCLUSIVE LUXURY APPAREL • SHIPS IN 24 HOURS",
    },
  },
  {
    name: "Acid Lime / Underground",
    desc: "High energy neon rave & club culture vibe",
    theme: {
      bgPrimary: "#040804",
      accentColor: "#22c55e",
      bannerBg: "#14532d",
      bannerText: "ACID DROP LIVE NOW • OVERSIZED HEAVYWEIGHT GSM • WORLDWIDE SHIPPING",
    },
  },
  {
    name: "Cyber Cobalt / Electric Blue",
    desc: "Clean futuristic techwear palette",
    theme: {
      bgPrimary: "#030712",
      accentColor: "#38bdf8",
      bannerBg: "#1e3a8a",
      bannerText: "CYBERPUNK WINTER DROP • FREE RETURNS & EXCHANGES • PREMIUM 240 GSM",
    },
  },
  {
    name: "Crimson Blood / Samurai",
    desc: "Aggressive, bold dark aesthetic",
    theme: {
      bgPrimary: "#090505",
      accentColor: "#ef4444",
      bannerBg: "#881337",
      bannerText: "HEAVYWEIGHT LIMITED EDITION • RESTOCK NEVER GUARANTEED • GET YOURS NOW",
    },
  },
  {
    name: "Monochrome Stealth",
    desc: "Pure minimalist black, white, and zinc",
    theme: {
      bgPrimary: "#000000",
      accentColor: "#ffffff",
      bannerBg: "#27272a",
      bannerText: "INKDROP ESSENTIALS • MINIMALIST HEAVYWEIGHT COTTON • CRAFTED IN INDIA",
    },
  },
];

interface ThemePanelProps {
  initial: ThemePayload;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}

export function ThemePanel({ initial, onShowToast }: ThemePanelProps) {
  const [form, setForm] = useState<ThemePayload>(initial);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      const next = (await res.json()) as ThemePayload;
      setForm(next);
      broadcastTheme(next);
      onShowToast("Theme saved & broadcast live to storefront!", "success");
    } catch {
      onShowToast("Failed to save theme settings", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function applyPreset(preset: ThemePayload) {
    setForm(preset);
    broadcastTheme(preset);
    onShowToast("Preset loaded into preview (remember to click Save)", "success");
  }

  function resetDefault() {
    setForm(DEFAULT_THEME);
    broadcastTheme(DEFAULT_THEME);
    onShowToast("Reset to default INKDROP theme", "success");
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Brand Theme & Storefront Customizer
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Customize storefront colors, banner tickers, and brand accents in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetDefault}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving Live..." : "Save & Publish Theme"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Palettes */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-zinc-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold">1-Click Curated Color Themes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {THEME_PRESETS.map((p) => {
                const isSelected =
                  form.bgPrimary === p.theme.bgPrimary &&
                  form.accentColor === p.theme.accentColor &&
                  form.bannerBg === p.theme.bannerBg;

                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.theme)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-zinc-800/90 border-amber-400/80 shadow-md"
                        : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-bold text-zinc-200 truncate">
                        {p.name.split("/")[0]}
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: p.theme.bgPrimary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: p.theme.accentColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: p.theme.bannerBg }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-400 line-clamp-1">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Adjustments */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-zinc-200">
              Custom Color Palette
            </h2>

            {/* Background Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Storefront Background Tone
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.bgPrimary}
                  onChange={(e) => setForm({ ...form, bgPrimary: e.target.value })}
                  className="w-12 h-10 rounded-xl bg-transparent cursor-pointer border border-zinc-700 p-0.5"
                />
                <input
                  type="text"
                  value={form.bgPrimary}
                  onChange={(e) => setForm({ ...form, bgPrimary: e.target.value })}
                  className="w-36 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 uppercase"
                />
                <span className="text-xs text-zinc-500">Main site canvas background</span>
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs font-semibold text-zinc-300">
                Primary Brand Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-12 h-10 rounded-xl bg-transparent cursor-pointer border border-zinc-700 p-0.5"
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-36 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 uppercase"
                />
                <span className="text-xs text-zinc-500">CTA buttons, highlights & badges</span>
              </div>
            </div>

            {/* Banner Background Color */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs font-semibold text-zinc-300">
                Ticker Banner Background
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.bannerBg}
                  onChange={(e) => setForm({ ...form, bannerBg: e.target.value })}
                  className="w-12 h-10 rounded-xl bg-transparent cursor-pointer border border-zinc-700 p-0.5"
                />
                <input
                  type="text"
                  value={form.bannerBg}
                  onChange={(e) => setForm({ ...form, bannerBg: e.target.value })}
                  className="w-36 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 uppercase"
                />
                <span className="text-xs text-zinc-500">Top announcement marquee background</span>
              </div>
            </div>
          </div>

          {/* Announcement Ticker Text */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-zinc-200">
                Announcement Marquee Ticker Copy
              </label>
              <span className="text-xs text-zinc-500">
                {form.bannerText.length} characters
              </span>
            </div>
            <textarea
              rows={3}
              value={form.bannerText}
              onChange={(e) => setForm({ ...form, bannerText: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              placeholder="Enter announcement text scrolling continuously at the top of the storefront..."
            />
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-500" />
              Tip: Use &bull; or / characters to separate bullet points cleanly.
            </p>
          </div>
        </div>

        {/* Live Mockup Column: 5 cols */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Interactive Storefront Mockup</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Live Preview
              </span>
            </div>

            {/* Mockup Frame */}
            <div
              className="rounded-3xl border border-zinc-700/80 overflow-hidden shadow-2xl transition-colors duration-300 flex flex-col"
              style={{ backgroundColor: form.bgPrimary }}
            >
              {/* Ticker in Preview */}
              <div
                className="py-1.5 px-3 text-[11px] font-bold text-white tracking-widest text-center truncate transition-colors duration-300"
                style={{ backgroundColor: form.bannerBg }}
              >
                {form.bannerText || "ANNOUNCEMENT BANNER PREVIEW"}
              </div>

              {/* Mock Header */}
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-black/30 backdrop-blur-md">
                <span className="font-black text-sm tracking-tighter text-white">
                  INKDROP
                </span>
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <span>SHOP</span>
                  <span>DROPS</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: form.accentColor }}
                  />
                </div>
              </div>

              {/* Mock Content */}
              <div className="p-6 space-y-5">
                {/* Hero Snippet */}
                <div className="space-y-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: form.accentColor,
                      color: "#0a0a0a",
                    }}
                  >
                    PREVIEW MODE
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white mt-1">
                    HEAVYWEIGHT ACID WASH COLLECTION
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Engineered luxury oversized silhouette.
                  </p>
                </div>

                {/* Sample Product Card */}
                <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-3">
                  <div className="h-28 rounded-xl bg-zinc-800/60 flex items-center justify-center text-xs text-zinc-400">
                    Product Image Simulation
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">INK ACID TEE</p>
                      <p className="text-[11px] text-zinc-400">₹599 MRP</p>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                      style={{
                        backgroundColor: form.accentColor,
                        color: "#0a0a0a",
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Changes applied here will automatically broadcast instantly across open browser tabs via our live theme sync bus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
