import type { MetadataRoute } from "next";

import { APP_URL } from "@/config/app";
import { SITEMAP_ROUTES } from "@/config/seo";

/**
 * XML sitemap for the indexable public routes. The route list lives in
 * `@/config/seo` so robots/sitemap/navigation cannot drift apart.
 * Served by Next at `/sitemap.xml`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_ROUTES.map((route) => ({
    url: new URL(route.path, APP_URL).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
