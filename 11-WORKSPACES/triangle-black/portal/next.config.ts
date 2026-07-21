import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  compress: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react","@tanstack/react-query"],
  },
  images: { formats: ["image/webp"], minimumCacheTTL: 60 },

  async rewrites() {
    return [
      // AI Engine routes (Hub AI OS)
      {
        source: "/api/v1/ai/:path*",
        destination: "http://localhost:8001/api/v1/ai/:path*",
      },
      // TB Admin AI signals (separate from AI Engine)
      {
        source: "/api/v1/tb-ai/:path*",
        destination: "http://localhost:8030/api/v1/ai/:path*",
      },
      // TB Admin action routes (no trailing slash)
      {
        source: "/api/v1/actions/:path*",
        destination: "http://localhost:8030/api/v1/actions/:path*",
      },
      {
        source: "/api/v1/maintenance/:path*",
        destination: "http://localhost:8030/api/v1/maintenance/:path*",
      },
      {
        source: "/api/v1/analytics/:path*",
        destination: "http://localhost:8030/api/v1/analytics/:path*",
      },
      {
        source: "/api/v1/approvals/:path*",
        destination: "http://localhost:8030/api/v1/approvals/:path*",
      },
      {
        source: "/api/v1/customers/:path*",
        destination: "http://localhost:8030/api/v1/customers/:path*",
      },
      {
        source: "/api/v1/projects/:path*",
        destination: "http://localhost:8030/api/v1/projects/:path*",
      },
      // TB Admin collection routes (with trailing slash)
      {
        source: "/api/v1/:path*/",
        destination: "http://localhost:8030/api/v1/:path*/",
      },
      // TB Admin all other routes (appends trailing slash)
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8030/api/v1/:path*/",
      },
    ];
  },
};

export default nextConfig;
