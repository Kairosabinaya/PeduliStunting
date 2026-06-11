import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  experimental: {
    // Default body limit (1MB) too small for avatar uploads — bucket
    // file_size_limit is 2 MiB so the Server Action needs headroom for
    // the multipart boundary on top of the raw bytes.
    serverActions: { bodySizeLimit: "4mb" },
    // Rewrite barrel imports to direct paths so unused exports tree-shake out
    // of each route's bundle.
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Google avatars from OAuth sign-in.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Avatars uploaded to the project's Supabase Storage bucket.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      // Isolates the browsing context group from cross-origin openers.
      // The Content-Security-Policy itself is set per-request in
      // `src/proxy.ts` (nonce-based, so it cannot live in static headers).
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Wrap with the analyzer so `ANALYZE=true pnpm build` emits chunk reports; a
// no-op for normal builds.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
