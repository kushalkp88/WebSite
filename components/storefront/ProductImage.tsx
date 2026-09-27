"use client";

import { getCleanImageUrl } from "@/lib/product";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function ProductImage({ src, alt, className }: Props) {
  const cleanSrc = getCleanImageUrl(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cleanSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src =
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><rect fill="#18181b" width="100%" height="100%"/></svg>`,
          );
      }}
    />
  );
}
