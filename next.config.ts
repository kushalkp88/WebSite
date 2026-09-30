import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/photo-*",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/premium_photo-*",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
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
      {
        source: "/kids",
        destination: "/catalog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
