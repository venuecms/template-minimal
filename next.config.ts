import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  transpilePackages: ["lucide-react"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eisvdiypdhqebatccxpr.supabase.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination:
          "https://eisvdiypdhqebatccxpr.supabase.co/storage/v1/object/public/venue-platform-media-public-dev/:path*",
      },
      {
        source: "/api/:path*",
        destination: `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.API_ROOT}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
