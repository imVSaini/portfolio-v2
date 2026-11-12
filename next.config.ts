import type { NextConfig } from "next";

import { site } from "./src/data/site";

const nextConfig: NextConfig = {
  env: { BUILD_YEAR: String(new Date().getFullYear()) },
  poweredByHeader: false,
  images: {
    remotePatterns: [new URL(`${site.assetsUrl}/**`)],
  },
  async rewrites() {
    const acceptsMarkdown = [
      { type: "header" as const, key: "accept", value: "(.*)text/markdown(.*)" },
    ];

    return {
      beforeFiles: [
        { source: "/", destination: "/index.md", has: acceptsMarkdown },
        { source: "/blog/:slug", destination: "/blog/:slug/index.md", has: acceptsMarkdown },
        {
          source: "/case-studies/:slug",
          destination: "/case-studies/:slug/index.md",
          has: acceptsMarkdown,
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
