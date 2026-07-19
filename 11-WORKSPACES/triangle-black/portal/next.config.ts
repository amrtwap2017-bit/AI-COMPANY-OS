import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // AI Engine — all AI features
      {
        source: "/api/v1/ai/:path*",
        destination: "http://localhost:8001/api/v1/ai/:path*",
      },
      // TB Admin — all business data
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8030/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
