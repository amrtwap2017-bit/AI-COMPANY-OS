// @ts-nocheck
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sprint 68: Proxy all /api/v1 calls to backend on port 8030
  // This is the CORRECT fix — frontend and backend share the same domain in production
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8030/api/v1/:path*",
      },
    ];
  },

  // Existing config below
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001"],
    },
  },
};

export default nextConfig;
