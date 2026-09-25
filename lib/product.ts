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
