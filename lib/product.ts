import type { Product } from "@prisma/client";

export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export const PRODUCT_SECTIONS = ["men", "women", "kids"] as const;
export type ProductSection = (typeof PRODUCT_SECTIONS)[number];

export const PRODUCT_CATEGORIES = [
  "Regular/Classic Fit",
  "Oversized Fit",
  "Boyfriend Fit",
  "Crop Top",
  "Sweatshirt",
  "Hoodie",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

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
  white: { bg: "#f8fafc", border: "#cbd5e1" },
  grey: { bg: "#6b7280", border: "#9ca3af" },
  gray: { bg: "#6b7280", border: "#9ca3af" },
  navy: { bg: "#1e293b", border: "#334155" },
  "royal blue": { bg: "#2563eb", border: "#3b82f6" },
  blue: { bg: "#3b82f6", border: "#60a5fa" },
  red: { bg: "#dc2626", border: "#ef4444" },
  beige: { bg: "#d4b996", border: "#c2a37d" },
  "olive green": { bg: "#556b2f", border: "#6b8e23" },
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
};

export function getTeeColor(colorName: string): Omit<ColorDot, "name"> {
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

export function getProductColorDots(product: {
  color: string;
  imageUrls: string[];
}): ColorDot[] {
  const parts = product.color
    ? product.color
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  if (parts.length > 0) {
    return parts.map((name) => ({
      name,
      ...getTeeColor(name),
    }));
  }

  const detected = product.imageUrls
    .map((imgUrl) => {
      const lowerImg = imgUrl.toLowerCase();
      for (const key of Object.keys(COLOR_MAP)) {
        if (lowerImg.includes(key)) {
          return {
            name: key,
            ...getTeeColor(key),
          };
        }
      }
      return null;
    })
    .filter((d): d is ColorDot => d !== null);

  if (detected.length > 0) {
    return detected;
  }

  return [];
}

