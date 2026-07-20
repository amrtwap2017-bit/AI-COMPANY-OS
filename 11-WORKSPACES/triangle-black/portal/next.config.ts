import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
