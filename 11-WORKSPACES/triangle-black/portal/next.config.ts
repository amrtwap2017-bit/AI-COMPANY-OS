import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // Performance
  compress: true,
  poweredByHeader: false,

  // Remove console in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  // Optimize specific heavy packages
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-query",
      "date-fns",
    ],
  },

  // Image optimization
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 60,
    unoptimized: false,
  },

  // API rewrites to TB Admin (real routes)
  async rewrites() {
    return [
      {
        source: "/api/v1/ai/:path*",
        destination: "http://localhost:8001/api/v1/ai/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8030/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
