import type { NextConfig } from "next";

function getSupabaseRewriteTarget(): string | null {
  const target =
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!target || target.includes("supabase.co")) {
    return null;
  }
  return target.replace(/\/$/, "");
}

const supabaseRewriteTarget = getSupabaseRewriteTarget();

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "@img/sharp-linux-x64", "@img/sharp-libvips-linux-x64"],
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  rewrites: supabaseRewriteTarget
    ? async () => [
        {
          source: "/supabase-api/:path*",
          destination: `${supabaseRewriteTarget}/:path*`,
        },
      ]
    : undefined,
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Content-Type",
          value: "application/javascript; charset=utf-8",
        },
        {
          key: "Cache-Control",
          value: "no-cache, no-store, must-revalidate",
        },
      ],
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "55421",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
