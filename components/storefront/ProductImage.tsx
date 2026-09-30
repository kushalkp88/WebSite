"use client";

import { buildImageKitUrl, type ImageVariant } from "@/lib/image-kit-utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  variant?: ImageVariant;
  priority?: boolean;
  width?: number;
  height?: number;
};

export function ProductImage({
  src,
  alt,
  className,
  variant = "card",
  priority = false,
  width,
  height,
}: Props) {
  const optimizedSrc = buildImageKitUrl(src, variant);

  // If the image is served from ImageKit, provide a 2x retina srcSet
  let srcSet: string | undefined;
  if (src && src.includes("ik.imagekit.io")) {
    const cleanUrl = src.split("?")[0];
    if (variant === "card") {
      const card1x = `${cleanUrl}?tr=w-400,h-533,fo-auto,q-80,f-auto`;
      const card2x = `${cleanUrl}?tr=w-800,h-1066,fo-auto,q-80,f-auto`;
      srcSet = `${card1x} 1x, ${card2x} 2x`;
    } else if (variant === "thumb") {
      const thumb1x = `${cleanUrl}?tr=w-150,h-200,fo-auto,q-75,f-auto`;
      const thumb2x = `${cleanUrl}?tr=w-300,h-400,fo-auto,q-75,f-auto`;
      srcSet = `${thumb1x} 1x, ${thumb2x} 2x`;
    }
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
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
