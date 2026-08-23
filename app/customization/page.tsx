"use client";

import { useState } from "react";
import { StoreShell } from "@/components/storefront/StoreShell";
import { useShop } from "@/lib/cart-store";
import { Sparkles, Upload, Type, Check, RefreshCw, ShoppingBag, Palette, Shirt } from "lucide-react";
import type { Size } from "@/lib/product";

const COLORS = [
  { id: "black", name: "Pitch Black", bg: "#18181b", text: "#ffffff" },
  { id: "white", name: "Optic White", bg: "#f4f4f5", text: "#18181b" },
  { id: "navy", name: "Midnight Navy", bg: "#1e293b", text: "#ffffff" },
  { id: "beige", name: "Vintage Sand", bg: "#e7e5e4", text: "#1c1917" },
  { id: "green", name: "Forest Green", bg: "#14532d", text: "#ffffff" },
  { id: "crimson", name: "Acid Crimson", bg: "#881337", text: "#ffffff" },
];

const FITS = [
  { id: "oversized", name: "Heavyweight Oversized (240 GSM)", basePrice: 799 },
  { id: "regular", name: "Classic Regular Fit (180 GSM)", basePrice: 699 },
  { id: "hoodie", name: "Fleece Streetwear Hoodie (380 GSM)", basePrice: 1499 },
  { id: "sweatshirt", name: "Boxy Drop-Shoulder Sweatshirt", basePrice: 1299 },
  { id: "croptop", name: "Women Boyfriend Crop Top", basePrice: 649 },
];

const PRESET_GRAPHICS = [
  { id: "flame", name: "Unhinged Flame", icon: "??", label: "UNHINGED FLAME" },
  { id: "skull", name: "Cyber Punk", icon: "?", label: "CYBER PROTOCOL" },
  { id: "acid", name: "Acid Bloom", icon: "??", label: "ACID TOXICITY" },
  { id: "cross", name: "Gothic Cross", icon: "??", label: "GOTHIC CHAOS" },
];

export default function CustomizationPage() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedFit, setSelectedFit] = useState(FITS[0]);
  const [selectedSize, setSelectedSize] = useState<Size>("L");
  const [selectedGraphic, setSelectedGraphic] = useState(PRESET_GRAPHICS[0]);
  const [customText, setCustomText] = useState("UNHINGED");
  const [textColor, setTextColor] = useState("#ffffff");
  const [position, setPosition] = useState<"center" | "pocket" | "back">("center");
  const [added, setAdded] = useState(false);

  const addToCart = useShop((s) => s.addToCart);

  const finalPrice = selectedFit.basePrice + (customText.trim() ? 150 : 0);

  function handleAddToCart() {
    addToCart({
      productId: `custom-${Date.now()}`,
      slug: "custom-unhinged-tee",
      title: `Custom ${selectedFit.name} (${selectedColor.name})`,
      image: "/products/black-hang.jpg",
      price: finalPrice,
      size: selectedSize,
      qty: 1,
      maxStock: 99,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <StoreShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="mb-8 border-b border-zinc-200 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-3">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>UNHINGED CUSTOM STUDIO</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Build Your Custom Streetwear
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">
            Choose your fit, color, graphic placement, and custom print. Hand-crafted in 240+ GSM heavyweight cotton.
          </p>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Mockup Canvas */}
          <div className="lg:col-span-7 bg-zinc-100 rounded-3xl border border-zinc-200 p-8 flex flex-col items-center justify-center min-h-[480px] sm:min-h-[560px] relative overflow-hidden shadow-inner">
            {/* T-Shirt Canvas Silhouette */}
            <div
              className="relative w-72 sm:w-96 aspect-[3/4] rounded-3xl shadow-2xl transition-all duration-300 flex flex-col items-center justify-center border border-black/10"
              style={{ backgroundColor: selectedColor.bg }}
            >
              {/* Collar Simulation */}
              <div className="absolute top-0 w-28 h-10 border-b-4 border-black/20 rounded-b-full" />

              {/* Graphic Print Placement */}
              <div
                className={`transition-all duration-300 flex flex-col items-center justify-center p-4 text-center ${
                  position === "pocket"
                    ? "absolute top-16 left-12 scale-75"
                    : position === "back"
                    ? "scale-110"
                    : "scale-100"
                }`}
              >
                <span className="text-4xl sm:text-5xl filter drop-shadow-md select-none animate-pulse">
                  {selectedGraphic.icon}
                </span>
                {customText.trim() && (
                  <p
                    className="font-black text-sm sm:text-base uppercase tracking-widest mt-2 select-none"
                    style={{ color: textColor }}
                  >
                    {customText}
                  </p>
                )}
                <span
                  className="text-[9px] font-bold tracking-widest opacity-60 uppercase mt-1 select-none"
                  style={{ color: textColor }}
                >
                  {selectedGraphic.label}
                </span>
              </div>

              {/* Placement Badge */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                {position.toUpperCase()} PRINT
              </div>
            </div>

            {/* Print View Switcher */}
            <div className="mt-6 flex items-center gap-2 bg-white p-1.5 rounded-full border border-zinc-300 shadow-sm">
              <button
                type="button"
                onClick={() => setPosition("center")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                  position === "center" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-black"
                }`}
              >
                Front Center
              </button>
              <button
                type="button"
                onClick={() => setPosition("pocket")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                  position === "pocket" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-black"
                }`}
              >
                Chest Badge
              </button>
              <button
                type="button"
                onClick={() => setPosition("back")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                  position === "back" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-black"
                }`}
              >
                Full Back
              </button>
            </div>
          </div>

          {/* Right: Studio Customizer Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Fit / Silhouette Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <Shirt className="w-3.5 h-3.5 text-emerald-600" />
                1. Select Silhouette & Fabric
              </label>
              <div className="space-y-2">
                {FITS.map((fit) => (
                  <button
                    key={fit.id}
                    type="button"
                    onClick={() => setSelectedFit(fit)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      selectedFit.id === fit.id
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                        : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold uppercase">{fit.name}</p>
                    </div>
                    <span className="text-xs font-black">?{fit.basePrice}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-emerald-600" />
                2. Select Base Fabric Color: <span className="text-zinc-500 font-semibold">{selectedColor.name}</span>
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c);
                      setTextColor(c.id === "white" || c.id === "beige" ? "#18181b" : "#ffffff");
                    }}
                    style={{ backgroundColor: c.bg }}
                    className={`w-9 h-9 rounded-full border-2 transition-transform ${
                      selectedColor.id === c.id ? "scale-110 border-emerald-500 ring-2 ring-emerald-500/20" : "border-zinc-300"
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Graphic Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                3. Choose Graphic Motif
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_GRAPHICS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGraphic(g)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                      selectedGraphic.id === g.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="text-lg">{g.icon}</span>
                    <span className="truncate">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text Option */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-emerald-600" />
                4. Custom Print Text (+?150)
              </label>
              <input
                type="text"
                maxLength={24}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter custom slogan or phrase..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs text-zinc-900 uppercase font-mono tracking-wider outline-none focus:border-zinc-900"
              />
            </div>

            {/* Size Picker */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900">
                5. Select Size
              </label>
              <div className="flex gap-2">
                {(["S", "M", "L", "XL"] as Size[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${
                      selectedSize === s
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                        : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="border-t border-zinc-200 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase">Estimated Total</p>
                  <p className="text-2xl font-black text-zinc-900">?{finalPrice}</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  SHIPS IN 48 HOURS
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-zinc-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added Custom Piece to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Custom Piece to Bag (?{finalPrice})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
