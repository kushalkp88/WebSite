import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/men",
        destination: "/catalog?gender=men",
        permanent: true,
      },
      {
        source: "/women",
        destination: "/catalog?gender=women",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
