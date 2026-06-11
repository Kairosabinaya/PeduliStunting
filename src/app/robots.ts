import type { MetadataRoute } from "next";

import { APP_URL } from "@/config/app";
import { ROBOTS_DISALLOWED_ROUTES } from "@/config/seo";

/**
 * Crawler policy for the public surface. User-owned surfaces (tracker,
 * account) and machine endpoints are excluded; everything else is indexable.
 * Served by Next at `/robots.txt`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOWED_ROUTES],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
