export type ImageVariant = "thumb" | "card" | "detail" | "raw";

/**
 * Builds an optimized ImageKit transformation URL.
 * Automatically enforces 3:4 portrait apparel aspect ratio,
 * smart auto-focus, WebP/AVIF auto-format conversion, and quality compression.
 */
export function buildImageKitUrl(
  url?: string | null,
  variant: ImageVariant = "card",
): string {
  if (!url || typeof url !== "string") {
    return "/products/rack.jpg";
  }

  // Preserve legacy local paths (e.g., /products/black-hang.jpg) or external Unsplash URLs
  if (!url.includes("ik.imagekit.io")) {
    return url;
  }

  // Strip any existing hash fragments and query params before applying transformations
  const baseUrl = url.split("#")[0].split("?")[0];

  switch (variant) {
    case "thumb":
      // Admin tables, small carts, thumbnail strip: 150x200 (3:4)
      return `${baseUrl}?tr=w-150,h-200,fo-auto,q-75,f-auto`;

    case "card":
      // Catalog grid: 400x533 (3:4)
      return `${baseUrl}?tr=w-400,h-533,fo-auto,q-80,f-auto`;

    case "detail":
      // High-res zoom view: 1200x1600 (3:4)
      return `${baseUrl}?tr=w-1200,h-1600,fo-auto,q-85,f-auto`;

    case "raw":
    default:
      return baseUrl;
  }
}
