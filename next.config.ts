import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  transpilePackages: ["lucide-react", "@venuecms/sdk"],
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eisvdiypdhqebatccxpr.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination:
          "https://eisvdiypdhqebatccxpr.supabase.co/storage/v1/object/public/venue-platform-media-public-dev/:path*",
      },
    ];
  },
  cacheComponents: true,
  experimental: {
    // Optimistic client cache for faster navigation
    staleTimes: {
      dynamic: 60,
      static: 180, // Cache static content for 3 minutes
    },
  },
};

export default withNextIntl(nextConfig);
