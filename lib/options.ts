import { COLOR_MAP } from "./product";

export interface ColorOption {
  name: string;
  hex?: string;
  border?: string;
}

export const APPAREL_COLOR_KEYWORDS: { pattern: RegExp; hex: string; border?: string; isLight?: boolean }[] = [
  // Greys & Blacks
  { pattern: /heather\s*gr[ea]y/i, hex: "#9ca3af", border: "#cbd5e1", isLight: true },
  { pattern: /charcoal/i, hex: "#374151", border: "#4b5563" },
  { pattern: /acid\s*wash/i, hex: "#232326", border: "#52525b" },
  { pattern: /black/i, hex: "#18181b", border: "#27272a" },
  { pattern: /gr[ea]y|slate/i, hex: "#6b7280", border: "#9ca3af" },

  // Whites & Neutrals
  { pattern: /off\s*white|ivory|cream|vintage\s*cream/i, hex: "#faf7f2", border: "#e5e0d8", isLight: true },
  { pattern: /white/i, hex: "#f8fafc", border: "#cbd5e1", isLight: true },
  { pattern: /sand|khaki|tan/i, hex: "#d8c7a9", border: "#c2b294", isLight: true },
  { pattern: /beige|oatmeal|nude/i, hex: "#d4b996", border: "#c2a37d", isLight: true },

  // Blues & Teals
  { pattern: /teal|cyan|turquoise/i, hex: "#0d9488", border: "#14b8a6" },
  { pattern: /sky\s*blue|baby\s*blue|ice\s*blue|light\s*blue/i, hex: "#38bdf8", border: "#7dd3fc" },
  { pattern: /navy/i, hex: "#1e293b", border: "#334155" },
  { pattern: /royal\s*blue|cobalt/i, hex: "#2563eb", border: "#3b82f6" },
  { pattern: /blue/i, hex: "#1d4ed8", border: "#3b82f6" },

  // Greens
  { pattern: /matcha/i, hex: "#739e82", border: "#52796f" },
  { pattern: /sage/i, hex: "#8a9a86", border: "#6c7a68" },
  { pattern: /mint/i, hex: "#a7f3d0", border: "#6ee7b7", isLight: true },
  { pattern: /olive/i, hex: "#556b2f", border: "#6b8e23" },
  { pattern: /bottle\s*green|forest\s*green|dark\s*emerald|emerald/i, hex: "#064e3b", border: "#047857" },
  { pattern: /green/i, hex: "#15803d", border: "#22c55e" },

  // Pinks & Purples
  { pattern: /baby\s*pink|light\s*pink|pastel\s*pink/i, hex: "#f472b6", border: "#fbcfe8", isLight: true },
  { pattern: /dusky\s*pink|dusty\s*pink|rose/i, hex: "#ec4899", border: "#f472b6" },
  { pattern: /pink/i, hex: "#ec4899", border: "#f472b6" },
  { pattern: /lavender|lilac/i, hex: "#c4b5fd", border: "#a78bfa", isLight: true },
  { pattern: /plum/i, hex: "#581c87", border: "#7e22ce" },
  { pattern: /purple|violet/i, hex: "#9333ea", border: "#a855f7" },

  // Yellows & Oranges
  { pattern: /pale\s*yellow|butter\s*yellow|light\s*yellow/i, hex: "#fef08a", border: "#fde047", isLight: true },
  { pattern: /mustard/i, hex: "#d97706", border: "#f59e0b" },
  { pattern: /yellow/i, hex: "#eab308", border: "#facc15", isLight: true },
  { pattern: /rust|terracotta/i, hex: "#c86d51", border: "#9a3412" },
  { pattern: /peach|coral/i, hex: "#fb923c", border: "#fdba74" },
  { pattern: /orange/i, hex: "#ea580c", border: "#f97316" },

  // Reds & Browns
  { pattern: /maroon|burgundy|wine/i, hex: "#800020", border: "#991b1b" },
  { pattern: /red|crimson/i, hex: "#dc2626", border: "#ef4444" },
  { pattern: /coffee|chocolate|dark\s*brown/i, hex: "#451a03", border: "#78350f" },
  { pattern: /brown/i, hex: "#78350f", border: "#92400e" },
];

export function autoDetectColorHex(colorName: string): string {
  if (!colorName) return "#6b7280";
  const trimmed = colorName.trim();
  for (const entry of APPAREL_COLOR_KEYWORDS) {
    if (entry.pattern.test(trimmed)) {
      return entry.hex;
    }
  }
  return "#6b7280";
}

/**
 * Resolves color dot: if savedHex was a dummy "#8a9a86" or "#3f3f46" from earlier form defaults,
 * or if autoDetect finds a specific apparel match, it returns the true matching color.
 */
export function resolveColorDot(name: string, savedHex?: string): string {
  if (!name) return "#6b7280";
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // If saved hex was the old dummy "#8a9a86" (and name is not Sage Green)
  // or old dummy "#3f3f46" (and name is not Charcoal)
  const isOldDummy =
    (savedHex === "#8a9a86" && !lower.includes("sage")) ||
    (savedHex === "#3f3f46" && !lower.includes("charcoal"));

  if (!savedHex || isOldDummy) {
    return autoDetectColorHex(trimmed);
  }

  // Check if there is a specific keyword match for this color name
  for (const entry of APPAREL_COLOR_KEYWORDS) {
    if (entry.pattern.test(trimmed)) {
      return entry.hex;
    }
  }

  return savedHex;
}

export interface FitOption {
  name: string;
  description?: string;
}

export interface ProductOptions {
  colors: ColorOption[];
  fits: FitOption[];
}

export const DEFAULT_COLOR_OPTIONS: ColorOption[] = [
  { name: "Black", hex: "#18181b", border: "#27272a" },
  { name: "Acid Wash Black", hex: "#232326", border: "#52525b" },
  { name: "White", hex: "#f8fafc", border: "#cbd5e1" },
  { name: "Off White", hex: "#faf7f2", border: "#e5e0d8" },
  { name: "Beige", hex: "#d4b996", border: "#c2a37d" },
  { name: "Maroon", hex: "#800020", border: "#991b1b" },
  { name: "Navy Blue", hex: "#1e293b", border: "#334155" },
  { name: "Royal Blue", hex: "#2563eb", border: "#3b82f6" },
  { name: "Charcoal Grey", hex: "#374151", border: "#4b5563" },
  { name: "Grey", hex: "#6b7280", border: "#9ca3af" },
  { name: "Olive Green", hex: "#556b2f", border: "#6b8e23" },
  { name: "Bottle Green", hex: "#064e3b", border: "#047857" },
  { name: "Brown", hex: "#78350f", border: "#92400e" },
  { name: "Rust", hex: "#b45309", border: "#d97706" },
  { name: "Red", hex: "#dc2626", border: "#ef4444" },
  { name: "Lavender", hex: "#c4b5fd", border: "#a78bfa" },
  { name: "Purple", hex: "#9333ea", border: "#a855f7" },
  { name: "Pink", hex: "#ec4899", border: "#f472b6" },
  { name: "Mustard Yellow", hex: "#d97706", border: "#f59e0b" },
];

export const DEFAULT_FIT_OPTIONS: FitOption[] = [
  { name: "Oversized Fit", description: "Relaxed drop-shoulder silhouette" },
  { name: "Regular/Classic Fit", description: "Standard everyday fit" },
  { name: "Boxy Fit", description: "Wide chest with structured cut" },
  { name: "Relaxed Fit", description: "Casual, loose-fitting silhouette" },
  { name: "Boyfriend Fit", description: "Slightly oversized casual look" },
  { name: "Crop Top", description: "Short length modern street cut" },
  { name: "Sweatshirt", description: "Cozy fleece crewneck" },
  { name: "Hoodie", description: "Classic pullover hooded sweatshirt" },
];

export const DEFAULT_OPTIONS: ProductOptions = {
  colors: DEFAULT_COLOR_OPTIONS,
  fits: DEFAULT_FIT_OPTIONS,
};

const STORAGE_KEY = "inkdrop_catalog_options_v1";
const EVENT_NAME = "inkdrop:options-updated";

/**
 * Read options from localStorage or defaults synchronously
 */
export function getSavedOptions(): ProductOptions {
  if (typeof window === "undefined") {
    return DEFAULT_OPTIONS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OPTIONS;
    const parsed = JSON.parse(raw) as Partial<ProductOptions>;
    return {
      colors: Array.isArray(parsed.colors) && parsed.colors.length > 0 ? parsed.colors : DEFAULT_COLOR_OPTIONS,
      fits: Array.isArray(parsed.fits) && parsed.fits.length > 0 ? parsed.fits : DEFAULT_FIT_OPTIONS,
    };
  } catch {
    return DEFAULT_OPTIONS;
  }
}

/**
 * Save options to local cache and notify listeners
 */
export function saveLocalOptions(options: ProductOptions): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: options }));
  } catch (err) {
    console.error("Failed to save options to localStorage:", err);
  }
}

/**
 * Fetch options from the API route (syncing local cache)
 */
export async function loadOptionsFromServer(): Promise<ProductOptions> {
  try {
    const res = await fetch("/api/options", { cache: "no-store" });
    if (!res.ok) {
      return getSavedOptions();
    }
    const data = (await res.json()) as ProductOptions;
    if (data && Array.isArray(data.colors) && Array.isArray(data.fits)) {
      saveLocalOptions(data);
      return data;
    }
  } catch (err) {
    console.warn("Could not fetch options from server, using local/defaults:", err);
  }
  return getSavedOptions();
}

/**
 * Save options to the API route and notify all clients
 */
export async function saveOptionsToServer(options: ProductOptions): Promise<ProductOptions> {
  saveLocalOptions(options);
  try {
    const res = await fetch("/api/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    if (res.ok) {
      const data = (await res.json()) as ProductOptions;
      saveLocalOptions(data);
      return data;
    }
  } catch (err) {
    console.error("Failed to persist options to server:", err);
  }
  return options;
}

/**
 * Subscribe to live option updates
 */
export function subscribeToOptions(callback: (options: ProductOptions) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<ProductOptions>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getSavedOptions());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getSavedOptions());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

/**
 * Helper to get color swatch with support for custom defined colors
 */
export function getRegisteredTeeColor(
  colorName: string,
  customColors?: ColorOption[]
): { bg: string; border: string; isLight: boolean } {
  if (!colorName) {
    return { bg: "#3f3f46", border: "#71717a", isLight: false };
  }

  const clean = colorName.trim().toLowerCase();

  // 1. Check custom colors first
  if (customColors && customColors.length > 0) {
    const match = customColors.find((c) => c.name.trim().toLowerCase() === clean);
    if (match) {
      const hex = resolveColorDot(match.name, match.hex);
      const isLight =
        hex.toLowerCase() === "#ffffff" ||
        hex.toLowerCase() === "#f8fafc" ||
        hex.toLowerCase() === "#faf7f2" ||
        clean.includes("white") ||
        clean.includes("cream") ||
        clean.includes("yellow");
      return {
        bg: hex,
        border: match.border ?? (isLight ? "#cbd5e1" : "rgba(255,255,255,0.15)"),
        isLight,
      };
    }
  }

  // 2. Fall back to COLOR_MAP
  const sortedKeys = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (clean.includes(key)) {
      const val = COLOR_MAP[key];
      const isLight =
        key === "white" ||
        key === "off white" ||
        key === "cream" ||
        key === "yellow";
      return {
        bg: val.bg,
        border: val.border ?? (isLight ? "#cbd5e1" : "rgba(255,255,255,0.15)"),
        isLight,
      };
    }
  }

  return {
    bg: "#3f3f46",
    border: "#71717a",
    isLight: false,
  };
}
