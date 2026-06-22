/**
 * SEO constants: canonical descriptions, Open Graph card, and favicon paths.
 *
 * Single source for everything `generateMetadata`/`metadata` exports consume,
 * so copy never drifts between routes. The OG image and favicons are emitted
 * by `scripts/optimize-images.ts`.
 */

import { APP_NAME } from "./app";

/** Default meta description, inherited by every route without its own. */
export const APP_DESCRIPTION =
  "Peduli Stunting menghubungkan data stunting nasional, edukasi Buku KIA, dan pemantauan pertumbuhan anak dalam satu aplikasi.";

/** Landing-specific meta description (scroll story + choropleth). */
export const LANDING_DESCRIPTION =
  "Kenali stunting lewat data nyata: peta sebaran kabupaten/kota, edukasi 1000 hari pertama kehidupan, dan pemantauan tumbuh kembang anak.";

/** Open Graph card rendered by scripts/optimize-images.ts (1200x630). */
export const OG_IMAGE = {
  path: "/brand/og-image.png",
  width: 1200,
  height: 630,
  alt: `${APP_NAME} — peta, data, dan pemantauan stunting Indonesia`,
} as const;

/** Favicon set emitted by scripts/optimize-images.ts. */
export const FAVICONS = {
  icon32: "/brand/favicon-32.png",
  icon192: "/brand/favicon-192.png",
  appleTouch: "/brand/apple-touch-180.png",
} as const;

/**
 * Routes crawlers must not index: user-owned surfaces and machine endpoints.
 * `/auth/callback` is a token-exchange hop with no content.
 */
export const ROBOTS_DISALLOWED_ROUTES = [
  "/tracker",
  "/account",
  "/api/",
  "/auth/callback",
] as const;

export interface SitemapRoute {
  readonly path: string;
  readonly changeFrequency: "weekly" | "monthly";
  readonly priority: number;
}

/** Indexable public routes listed in the XML sitemap. */
export const SITEMAP_ROUTES: readonly SitemapRoute[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/map", changeFrequency: "weekly", priority: 0.9 },
  { path: "/data", changeFrequency: "weekly", priority: 0.9 },
  { path: "/prediksi", changeFrequency: "weekly", priority: 0.8 },
  { path: "/auth/sign-in", changeFrequency: "monthly", priority: 0.3 },
  { path: "/auth/sign-up", changeFrequency: "monthly", priority: 0.3 },
] as const;
