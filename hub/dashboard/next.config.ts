import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/ai/:path*",
        destination: "http://localhost:8001/api/v1/ai/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8001/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
