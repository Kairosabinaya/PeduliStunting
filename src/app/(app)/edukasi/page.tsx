import type { Metadata } from "next";

import { EDUKASI_METADATA } from "@/config/edukasi";
import { EdukasiScrollytelling } from "@/components/features/edukasi/edukasi-scrollytelling";

export const metadata: Metadata = EDUKASI_METADATA;

/**
 * Authenticated longform read. Identical scrollytelling source as the
 * unauthenticated landing branch of `/map` (see ADR-0010): both render
 * `<EdukasiScrollytelling />`, so edits to ACT components or order
 * propagate to both routes without divergence. Smooth-scroll is provided
 * by the route-scoped `LenisProvider` in this group's layout.
 */
export default function EdukasiPage() {
  return <EdukasiScrollytelling />;
}
