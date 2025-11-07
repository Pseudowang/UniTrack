import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.uniqlo.cn",
      },
      {
        protocol: "https",
        hostname: "uniqlo.cn",
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
