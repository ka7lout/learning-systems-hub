import type { NextConfig } from "next";

/**
 * Preview/proxy note: the app is served behind a host-rewriting proxy in the
 * development sandbox, so server actions must accept the forwarded origin.
 */
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["*.e2b.app", "*.vercel.app", "localhost"],
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Framing is restricted with frame-ancestors rather than X-Frame-Options so
          // that the development preview can embed the app while production stays locked.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://*.e2b.app" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
        ],
      },
    ];
  },
};

export default config;
