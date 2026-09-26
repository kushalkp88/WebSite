import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
