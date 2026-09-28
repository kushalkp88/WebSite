"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Shirt,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Save,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import {
  type ColorOption,
  type FitOption,
  type ProductOptions,
  DEFAULT_COLOR_OPTIONS,
  DEFAULT_FIT_OPTIONS,
  getSavedOptions,
  saveOptionsToServer,
  loadOptionsFromServer,
  subscribeToOptions,
  autoDetectColorHex,
  resolveColorDot,
} from "@/lib/options";

interface OptionsManagerProps {
  onShowToast?: (message: string, type?: "success" | "error") => void;
  isModal?: boolean;
  onClose?: () => void;
}

export function OptionsManager({ onShowToast, isModal = false, onClose }: OptionsManagerProps) {
  const [options, setOptions] = useState<ProductOptions>(() => {
    const local = getSavedOptions();
    return {
      ...local,
      colors: local.colors.map((c) => ({
        ...c,
        hex: resolveColorDot(c.name, c.hex),
      })),
    };
  });
  const [colors, setColors] = useState<ColorOption[]>(options.colors);
  const [fits, setFits] = useState<FitOption[]>(options.fits);

  // New color form state (just color name!)
  const [newColorName, setNewColorName] = useState("");

  // New fit form state
  const [newFitName, setNewFitName] = useState("");
  const [newFitDesc, setNewFitDesc] = useState("");

  // Inline editing states
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [editColorName, setEditColorName] = useState("");

  const [editingFitIndex, setEditingFitIndex] = useState<number | null>(null);
  const [editFitName, setEditFitName] = useState("");
  const [editFitDesc, setEditFitDesc] = useState("");

  // Save states
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch live from server and auto-sanitize any outdated dummy hex colors
  useEffect(() => {
    loadOptionsFromServer().then((serverOptions) => {
      const sanitizedColors = serverOptions.colors.map((c) => ({
        ...c,
        hex: resolveColorDot(c.name, c.hex),
      }));
      setOptions({ ...serverOptions, colors: sanitizedColors });
      setColors(sanitizedColors);
      setFits(serverOptions.fits);

      const hadMismatched = serverOptions.colors.some(
        (c) => c.hex !== resolveColorDot(c.name, c.hex)
      );
      if (hadMismatched) {
        saveOptionsToServer({ colors: sanitizedColors, fits: serverOptions.fits });
      }
    });

    const unsub = subscribeToOptions((updated) => {
      const sanitizedColors = updated.colors.map((c) => ({
        ...c,
        hex: resolveColorDot(c.name, c.hex),
      }));
      setOptions({ ...updated, colors: sanitizedColors });
      setColors(sanitizedColors);
      setFits(updated.fits);
    });
    return unsub;
  }, []);

  function markChanged() {
    setHasChanges(true);
    setSavedSuccess(false);
  }

  // --- Color Handlers ---
  function handleAddColor(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const name = newColorName.trim();
    if (!name) return;

    if (colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      onShowToast?.(`Color "${name}" already exists in the palette!`, "error");
      return;
    }

    const hex = resolveColorDot(name);
    const updated = [...colors, { name, hex }];
    setColors(updated);
    setNewColorName("");
    markChanged();
  }

  function handleDeleteColor(index: number) {
    const color = colors[index];
    setColors(colors.filter((_, i) => i !== index));
    markChanged();
    onShowToast?.(`Removed "${color.name}" from palette.`);
  }

  function startEditColor(index: number) {
    setEditingColorIndex(index);
    setEditColorName(colors[index].name);
  }

  function saveEditColor(index: number) {
    const name = editColorName.trim();
    if (!name) return;
    const updated = [...colors];
    const hex = resolveColorDot(name);
    updated[index] = { ...updated[index], name, hex };
    setColors(updated);
    setEditingColorIndex(null);
    markChanged();
  }

  function moveColor(index: number, direction: "up" | "down") {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= colors.length) return;
    const updated = [...colors];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setColors(updated);
    markChanged();
  }

  function resetColorsToDefault() {
    if (confirm("Reset color palette to standard default colors?")) {
      setColors(DEFAULT_COLOR_OPTIONS);
      markChanged();
      onShowToast?.("Colors reset to standard palette.");
    }
  }

  // --- Fit Handlers ---
  function handleAddFit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const name = newFitName.trim();
    if (!name) return;

    if (fits.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      onShowToast?.(`Fit "${name}" already exists in the catalog!`, "error");
      return;
    }

    const updated = [...fits, { name, description: newFitDesc.trim() || undefined }];
    setFits(updated);
    setNewFitName("");
    setNewFitDesc("");
    markChanged();
  }

  function handleDeleteFit(index: number) {
    const fit = fits[index];
    setFits(fits.filter((_, i) => i !== index));
    markChanged();
    onShowToast?.(`Removed "${fit.name}".`);
  }

  function startEditFit(index: number) {
    setEditingFitIndex(index);
    setEditFitName(fits[index].name);
    setEditFitDesc(fits[index].description || "");
  }

  function saveEditFit(index: number) {
    const name = editFitName.trim();
    if (!name) return;
    const updated = [...fits];
    updated[index] = { name, description: editFitDesc.trim() || undefined };
    setFits(updated);
    setEditingFitIndex(null);
    markChanged();
  }

  function moveFit(index: number, direction: "up" | "down") {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fits.length) return;
    const updated = [...fits];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFits(updated);
    markChanged();
  }

  function resetFitsToDefault() {
    if (confirm("Reset garment fits to standard defaults?")) {
      setFits(DEFAULT_FIT_OPTIONS);
      markChanged();
      onShowToast?.("Garment fits reset to defaults.");
    }
  }

  // --- Save All Changes ---
  async function handleSave() {
    setSaving(true);
    try {
      const payload: ProductOptions = {
        colors,
        fits,
      };
      await saveOptionsToServer(payload);
      setHasChanges(false);
      setSavedSuccess(true);
      onShowToast?.("Colors & fits updated! Dropdown menus will now reflect your changes.", "success");
      setTimeout(() => setSavedSuccess(false), 3000);
      if (isModal && onClose) {
        setTimeout(onClose, 600);
      }
    } catch {
      onShowToast?.("Failed to save changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`space-y-6 ${isModal ? "p-0" : "max-w-6xl mx-auto"}`}>
      {/* Top Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Catalog Colors & Garment Fits
                {hasChanges && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Unsaved Edits
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Customize the exact standard color palette and fit options shown in the product image dropdowns.
              </p>
            </div>
          </div>
        </div>

        {/* Global Save & Close Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (!hasChanges && !isModal)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
              hasChanges || isModal
                ? "bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-400/20 scale-100 hover:scale-102 active:scale-98"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                <span>Saved & Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save Colors & Fits"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns (Left: Colors, Right: Fits) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= COLUMN 1: COLORS ================= */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white flex items-center gap-2">
                🎨 Color Palette
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                {colors.length} options
              </span>
            </div>
            <button
              type="button"
              onClick={resetColorsToDefault}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 hover:underline flex items-center gap-1 cursor-pointer"
              title="Reset colors to standard Inkdrop defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Defaults</span>
            </button>
          </div>

          {/* Add New Color Form */}
          <form
            onSubmit={handleAddColor}
            className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Add Color Name
            </span>

            <div className="flex items-center gap-2">
              {/* Name Input */}
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Enter color name (e.g. Sage Green, Charcoal, Lavender...)"
                className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Color</span>
              </button>
            </div>
          </form>

          {/* Active Colors List */}
          <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
            {colors.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No colors in the palette. Add one above or click &quot;Defaults&quot;.
              </div>
            ) : (
              colors.map((c, idx) => {
                const isEditing = editingColorIndex === idx;
                return (
                  <div
                    key={`${c.name}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-all text-xs"
                  >
                    {isEditing ? (
                      /* Inline Edit Mode */
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                        <input
                          type="text"
                          value={editColorName}
                          onChange={(e) => setEditColorName(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-amber-400 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveEditColor(idx)}
                          className="p-1 rounded bg-amber-400 text-zinc-950 hover:bg-amber-300 cursor-pointer"
                          title="Save edit"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingColorIndex(null)}
                          className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Real Color Swatch Circle */}
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-sm border border-white/20"
                          style={{ backgroundColor: resolveColorDot(c.name, c.hex) }}
                        />
                        <span className="font-semibold text-zinc-100 truncate">{c.name}</span>
                      </div>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveColor(idx, "up")}
                          className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === colors.length - 1}
                          onClick={() => moveColor(idx, "down")}
                          className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditColor(idx)}
                          className="p-1 text-zinc-500 hover:text-amber-400 cursor-pointer"
                          title="Edit color"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteColor(idx)}
                          className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                          title="Delete color"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: FITS ================= */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white flex items-center gap-2">
                👕 Garment Fits
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                {fits.length} options
              </span>
            </div>
            <button
              type="button"
              onClick={resetFitsToDefault}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 hover:underline flex items-center gap-1 cursor-pointer"
              title="Reset fits to standard Inkdrop defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Defaults</span>
            </button>
          </div>

          {/* Add New Fit Form */}
          <form
            onSubmit={handleAddFit}
            className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Add New Garment Fit
            </span>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFitName}
                  onChange={(e) => setNewFitName(e.target.value)}
                  placeholder="e.g. Heavyweight Boxy Fit, Baby Tee..."
                  className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Fit</span>
                </button>
              </div>

              <input
                type="text"
                value={newFitDesc}
                onChange={(e) => setNewFitDesc(e.target.value)}
                placeholder="Optional description (e.g. Relaxed drop-shoulder silhouette)"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </form>

          {/* Active Fits List */}
          <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
            {fits.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No fits configured. Add one above or click &quot;Defaults&quot;.
              </div>
            ) : (
              fits.map((f, idx) => {
                const isEditing = editingFitIndex === idx;
                return (
                  <div
                    key={`${f.name}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-all text-xs"
                  >
                    {isEditing ? (
                      /* Inline Edit Mode */
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                        <input
                          type="text"
                          value={editFitName}
                          onChange={(e) => setEditFitName(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-amber-400 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveEditFit(idx)}
                          className="p-1 rounded bg-amber-400 text-zinc-950 hover:bg-amber-300 cursor-pointer"
                          title="Save edit"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFitIndex(null)}
                          className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <Shirt className="w-4 h-4 text-amber-400/80 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-semibold text-zinc-100 block truncate">{f.name}</span>
                          {f.description && (
                            <span className="text-[10px] text-zinc-500 block truncate">{f.description}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveFit(idx, "up")}
                          className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === fits.length - 1}
                          onClick={() => moveFit(idx, "down")}
                          className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditFit(idx)}
                          className="p-1 text-zinc-500 hover:text-amber-400 cursor-pointer"
                          title="Edit fit name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFit(idx)}
                          className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                          title="Delete fit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Live Dropdown Preview Section */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Live Dropdown Menu Preview in Image Slots</span>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Here is how your dropdown menus appear inside each uploaded photo slot in the product editor:
        </p>

        <div className="flex flex-wrap items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
          {/* Sample Color Dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Color Menu:</span>
            <select
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-400 focus:outline-none cursor-pointer block min-w-[160px]"
            >
              <option value="">🎨 Color: Auto</option>
              {colors.map((c) => (
                <option key={c.name} value={c.name}>
                  🎨 {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sample Fit Dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Fit Menu:</span>
            <select
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-400 focus:outline-none cursor-pointer block min-w-[160px]"
            >
              <option value="">👕 Fit: Auto</option>
              {fits.map((f) => (
                <option key={f.name} value={f.name}>
                  👕 {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 ml-auto pt-2 sm:pt-0">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Updates saved here take effect immediately in all product forms.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
