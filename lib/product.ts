import type { Product } from "@prisma/client";

export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export const PRODUCT_SECTIONS = ["men", "women", "kids", "unisex"] as const;
export type ProductSection = (typeof PRODUCT_SECTIONS)[number];

export const PRODUCT_CATEGORIES = [
  "Oversized Fit",
  "Regular/Classic Fit",
  "Boxy Fit",
  "Relaxed Fit",
  "Boyfriend Fit",
  "Crop Top",
  "Sweatshirt",
  "Hoodie",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export const STANDARD_FITS = PRODUCT_CATEGORIES;

export const STANDARD_COLORS = [
  "Black",
  "Acid Wash Black",
  "White",
  "Off White",
  "Beige",
  "Maroon",
  "Navy Blue",
  "Royal Blue",
  "Charcoal Grey",
  "Grey",
  "Olive Green",
  "Bottle Green",
  "Brown",
  "Rust",
  "Red",
  "Lavender",
  "Purple",
  "Pink",
  "Mustard Yellow",
] as const;

export type ProductDTO = {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  imageUrls: string[];
  badges: string[];
  color: string;
  category: string;
  section: string;
  stockS: number;
  stockM: number;
  stockL: number;
  stockXL: number;
  isVisible: boolean;
  rating: number;
  reviewCount: number;
};

export function stockFor(
  p: Pick<ProductDTO, "stockS" | "stockM" | "stockL" | "stockXL">,
  size: Size,
) {
  return { S: p.stockS, M: p.stockM, L: p.stockL, XL: p.stockXL }[size];
}

export function totalStock(
  p: Pick<ProductDTO, "stockS" | "stockM" | "stockL" | "stockXL">,
) {
  return p.stockS + p.stockM + p.stockL + p.stockXL;
}

export function isOutOfStock(
  p: Pick<ProductDTO, "stockS" | "stockM" | "stockL" | "stockXL">,
) {
  return totalStock(p) === 0;
}

export function salePrice(p: Pick<ProductDTO, "price" | "discountPrice">) {
  return p.discountPrice ?? p.price;
}

export function percentOff(p: Pick<ProductDTO, "price" | "discountPrice">) {
  if (!p.discountPrice || p.price <= 0) return 0;
  return Math.round((1 - p.discountPrice / p.price) * 100);
}

export function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export const STOREFRONT_PRODUCT_SELECT = {
  id: true,
  title: true,
  slug: true,
  price: true,
  discountPrice: true,
  imageUrls: true,
  badges: true,
  color: true,
  category: true,
  section: true,
  stockS: true,
  stockM: true,
  stockL: true,
  stockXL: true,
  isVisible: true,
  rating: true,
  reviewCount: true,
} as const;

export type StorefrontProductRow = {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  imageUrls: string;
  badges: string;
  color: string;
  category: string;
  section: string;
  stockS: number;
  stockM: number;
  stockL: number;
  stockXL: number;
  isVisible: boolean;
  rating: number;
  reviewCount: number;
};

function safeParseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeProduct(p: StorefrontProductRow | Product): ProductDTO {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    discountPrice: p.discountPrice,
    imageUrls: safeParseJsonArray(p.imageUrls),
    badges: safeParseJsonArray(p.badges),
    color: p.color,
    category: p.category,
    section: p.section ?? "men",
    stockS: p.stockS,
    stockM: p.stockM,
    stockL: p.stockL,
    stockXL: p.stockXL,
    isVisible: p.isVisible,
    rating: p.rating,
    reviewCount: p.reviewCount,
  };
}

export const COLOR_MAP: Record<string, { bg: string; border?: string }> = {
  black: { bg: "#18181b", border: "#27272a" },
  "acid wash black": { bg: "#232326", border: "#52525b" },
  "acid wash": { bg: "#27272a", border: "#52525b" },
  white: { bg: "#f8fafc", border: "#cbd5e1" },
  "off white": { bg: "#faf7f2", border: "#e5e0d8" },
  grey: { bg: "#6b7280", border: "#9ca3af" },
  gray: { bg: "#6b7280", border: "#9ca3af" },
  navy: { bg: "#1e293b", border: "#334155" },
  "navy blue": { bg: "#1e293b", border: "#334155" },
  "royal blue": { bg: "#2563eb", border: "#3b82f6" },
  blue: { bg: "#3b82f6", border: "#60a5fa" },
  red: { bg: "#dc2626", border: "#ef4444" },
  beige: { bg: "#d4b996", border: "#c2a37d" },
  "olive green": { bg: "#556b2f", border: "#6b8e23" },
  "bottle green": { bg: "#064e3b", border: "#047857" },
  olive: { bg: "#556b2f", border: "#6b8e23" },
  green: { bg: "#16a34a", border: "#22c55e" },
  teal: { bg: "#0d9488", border: "#14b8a6" },
  maroon: { bg: "#800020", border: "#991b1b" },
  yellow: { bg: "#eab308", border: "#facc15" },
  brown: { bg: "#78350f", border: "#92400e" },
  purple: { bg: "#9333ea", border: "#a855f7" },
  pink: { bg: "#ec4899", border: "#f472b6" },
  orange: { bg: "#ea580c", border: "#f97316" },
  "charcoal gray": { bg: "#374151", border: "#4b5563" },
  "charcoal grey": { bg: "#374151", border: "#4b5563" },
  charcoal: { bg: "#374151", border: "#4b5563" },
  lavender: { bg: "#c4b5fd", border: "#a78bfa" },
  cream: { bg: "#fef3c7", border: "#fde68a" },
  mustard: { bg: "#d97706", border: "#f59e0b" },
  "mustard yellow": { bg: "#d97706", border: "#f59e0b" },
  coral: { bg: "#f43f5e", border: "#fb7185" },
  cyan: { bg: "#06b6d4", border: "#22d3ee" },
  magenta: { bg: "#d946ef", border: "#e879f9" },
  rust: { bg: "#b45309", border: "#d97706" },
  burgundy: { bg: "#701a75", border: "#86198f" },
};

export type ColorDot = {
  name: string;
  bg: string;
  border: string;
  isLight: boolean;
  firstImageIndex: number;
  imageIndices: number[];
};

export function getCleanImageUrl(url: string): string {
  if (!url) return "";
  const hashIdx = url.indexOf("#");
  return hashIdx !== -1 ? url.substring(0, hashIdx) : url;
}

export function getImageColorTag(url: string): string | null {
  if (!url) return null;
  const hashIdx = url.indexOf("#");
  if (hashIdx === -1) return null;
  const fragment = url.substring(hashIdx + 1);
  const match = fragment.match(/(?:^|[&?#])color=([^&]+)/i);
  if (match) {
    try {
      return decodeURIComponent(match[1]).trim();
    } catch {
      return match[1].trim();
    }
  }
  return null;
}

export function getImageFitTag(url: string): string | null {
  if (!url) return null;
  const hashIdx = url.indexOf("#");
  if (hashIdx === -1) return null;
  const fragment = url.substring(hashIdx + 1);
  const match = fragment.match(/(?:^|[&?#])fit=([^&]+)/i);
  if (match) {
    try {
      return decodeURIComponent(match[1]).trim();
    } catch {
      return match[1].trim();
    }
  }
  return null;
}

export function getTeeColor(colorName: string): Omit<ColorDot, "name" | "firstImageIndex" | "imageIndices"> {
  const normalized = colorName.toLowerCase().trim();
  const sortedKeys = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (normalized.includes(key)) {
      const val = COLOR_MAP[key];
      const isLight =
        key === "white" ||
        key === "beige" ||
        key === "yellow" ||
        key === "cream" ||
        normalized.includes("white") ||
        normalized.includes("yellow") ||
        normalized.includes("cream") ||
        normalized.includes("beige");
      return { bg: val.bg, border: val.border || val.bg, isLight };
    }
  }
  return { bg: "#27272a", border: "#3f3f46", isLight: false };
}

/**
 * Resolves each image to its respective color name.
 * Handles explicit tags (#color=...), 1-to-1 comma lists, filename keyword matching,
 * and proportional distribution.
 */
export function resolveImageColors(product: {
  color: string;
  imageUrls: string[];
}): string[] {
  const images = product.imageUrls || [];
  if (images.length === 0) return [];

  // Parse comma-separated colors from product.color
  const colorParts = product.color
    ? product.color
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  // 1. Check for explicit tags on images (#color=...)
  const tags = images.map((img) => getImageColorTag(img));
  const hasAnyTags = tags.some((t) => Boolean(t));
  if (hasAnyTags) {
    let lastKnown = tags.find((t) => Boolean(t)) || colorParts[0] || "Standard";
    return tags.map((t) => {
      if (t) {
        lastKnown = t;
        return t;
      }
      return lastKnown;
    });
  }

  // 2. Exact 1-to-1 match (e.g. 4 colors listed for 4 images: "Olive Green, Olive Green, Beige, Black")
  if (colorParts.length === images.length && images.length > 0) {
    return [...colorParts];
  }

  // 3. Keyword matching against filename if colors exist in product.color
  if (colorParts.length > 0) {
    const matched = images.map((img) => {
      const cleanLower = getCleanImageUrl(img).toLowerCase();
      // Try exact color part first
      const sortedParts = [...colorParts].sort((a, b) => b.length - a.length);
      for (const cp of sortedParts) {
        if (cleanLower.includes(cp.toLowerCase())) {
          return cp;
        }
      }
      // Try individual words (length >= 3)
      for (const cp of sortedParts) {
        const words = cp.toLowerCase().split(/\s+/);
        for (const w of words) {
          if (w.length >= 3 && cleanLower.includes(w)) {
            return cp;
          }
        }
      }
      return null;
    });

    if (matched.some((m) => Boolean(m))) {
      let current = matched.find((m) => Boolean(m)) || colorParts[0];
      return matched.map((m) => {
        if (m) {
          current = m;
          return m;
        }
        return current;
      });
    }
  }

  // 4. Proportional distribution if multiple colors declared and fewer colors than images
  if (colorParts.length > 1) {
    const imagesPerColor = Math.ceil(images.length / colorParts.length);
    return images.map((_, idx) => {
      const colorIdx = Math.min(Math.floor(idx / imagesPerColor), colorParts.length - 1);
      return colorParts[colorIdx];
    });
  }

  // 5. Fallback: single declared color or "Standard"
  const fallback = colorParts[0] || "Standard";
  return images.map(() => fallback);
}

/**
 * Returns deduplicated unique color swatches with firstImageIndex and imageIndices.
 * This ensures storefront displays only unique colors (e.g. 3 dots for 3 colors),
 * while mapping multiple images of the same color to the same swatch.
 */
export function getProductColorDots(product: {
  color: string;
  imageUrls: string[];
}): ColorDot[] {
  const images = product.imageUrls || [];
  const assignedColors = resolveImageColors(product);

  const rawParts = product.color
    ? product.color
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const uniqueColorNames: string[] = [];
  const seen = new Set<string>();

  const addUnique = (name: string) => {
    const key = name.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    uniqueColorNames.push(name.trim());
  };

  // Add colors in defined order
  for (const p of rawParts) {
    addUnique(p);
  }

  // Add any colors found in images
  for (const c of assignedColors) {
    addUnique(c);
  }

  // If still empty and images exist, check COLOR_MAP
  if (uniqueColorNames.length === 0 && images.length > 0) {
    for (const img of images) {
      const cleanLower = getCleanImageUrl(img).toLowerCase();
      for (const key of Object.keys(COLOR_MAP)) {
        if (cleanLower.includes(key)) {
          addUnique(key.charAt(0).toUpperCase() + key.slice(1));
          break;
        }
      }
    }
  }

  if (uniqueColorNames.length === 0) {
    return [];
  }

  return uniqueColorNames.map((name) => {
    const lowerName = name.toLowerCase();

    // Find all image indices matching this color
    const imageIndices: number[] = [];
    assignedColors.forEach((c, idx) => {
      if (c.toLowerCase() === lowerName) {
        imageIndices.push(idx);
      }
    });

    // Fallback if not matched in assignedColors
    if (imageIndices.length === 0 && images.length > 0) {
      images.forEach((img, idx) => {
        const cleanLower = getCleanImageUrl(img).toLowerCase();
        if (cleanLower.includes(lowerName)) {
          imageIndices.push(idx);
        }
      });
    }

    const firstImageIndex = imageIndices.length > 0 ? imageIndices[0] : 0;

    return {
      name,
      ...getTeeColor(name),
      firstImageIndex,
      imageIndices: imageIndices.length > 0 ? imageIndices : [firstImageIndex],
    };
  });
}


