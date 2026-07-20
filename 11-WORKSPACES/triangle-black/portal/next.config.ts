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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' http://localhost:8030 http://localhost:8001 http://127.0.0.1:8030 http://127.0.0.1:8001",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/ai/:path*",
        destination: "http://localhost:8001/api/v1/ai/:path*",
      },
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
        source: "/api/v1/approvals",
        destination: "http://localhost:8030/api/v1/approvals/",
      },
      {
        source: "/api/v1/customers/:path*",
        destination: "http://localhost:8030/api/v1/customers/:path*",
      },
      {
        source: "/api/v1/customers",
        destination: "http://localhost:8030/api/v1/customers/",
      },
      {
        source: "/api/v1/projects/:path*",
        destination: "http://localhost:8030/api/v1/projects/:path*",
      },
      {
        source: "/api/v1/projects",
        destination: "http://localhost:8030/api/v1/projects/",
      },
      {
        source: "/api/v1/executive/:path*",
        destination: "http://localhost:8030/api/v1/executive/:path*",
      },
      {
        source: "/api/v1/suppliers/:path*",
        destination: "http://localhost:8030/api/v1/suppliers/:path*",
      },
      {
        source: "/api/v1/suppliers",
        destination: "http://localhost:8030/api/v1/suppliers/",
      },
      {
        source: "/api/v1/rfqs/:path*",
        destination: "http://localhost:8030/api/v1/rfqs/:path*",
      },
      {
        source: "/api/v1/rfqs",
        destination: "http://localhost:8030/api/v1/rfqs/",
      },
      {
        source: "/api/v1/:path*/",
        destination: "http://localhost:8030/api/v1/:path*/",
      },
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8030/api/v1/:path*/",
      },
    ];
  },
};

export default nextConfig;
