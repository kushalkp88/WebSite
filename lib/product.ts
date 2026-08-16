import type { Product } from "@prisma/client";

export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

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

export function serializeProduct(p: Product): ProductDTO {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    discountPrice: p.discountPrice,
    imageUrls: JSON.parse(p.imageUrls) as string[],
    badges: JSON.parse(p.badges) as string[],
    color: p.color,
    category: p.category,
    stockS: p.stockS,
    stockM: p.stockM,
    stockL: p.stockL,
    stockXL: p.stockXL,
    isVisible: p.isVisible,
    rating: p.rating,
    reviewCount: p.reviewCount,
  };
}
