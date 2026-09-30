import ImageKit from "imagekit";

const globalForImageKit = globalThis as unknown as { imagekit?: ImageKit };

export function isImageKitConfigured(): boolean {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_URL_ENDPOINT,
  );
}

export function getImageKitClient(): ImageKit {
  if (!isImageKitConfigured()) {
    throw new Error(
      "ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env",
    );
  }

  if (!globalForImageKit.imagekit) {
    globalForImageKit.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
    });
  }

  return globalForImageKit.imagekit;
}
