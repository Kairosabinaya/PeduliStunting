/**
 * Page metadata for /edukasi. SEO + OG copy live here so they cannot drift
 * from the in-page hero text. The scrollytelling lands at a single URL;
 * Phase 2 ACT anchors are managed via section ids, not separate routes.
 */

import type { Metadata } from "next";

const TITLE_LONG = "1.000 Hari yang Mengubah Segalanya — Peduli Stunting";
const TITLE_SHORT = "Edukasi Pencegahan Stunting";
const DESCRIPTION =
  "Panduan interaktif pencegahan stunting di Indonesia berbasis Buku KIA 2024 dan SSGI 2024 — dari masa kehamilan hingga anak usia dua tahun.";

export const EDUKASI_METADATA: Metadata = {
  title: TITLE_LONG,
  description: DESCRIPTION,
  openGraph: {
    title: "1.000 Hari yang Mengubah Segalanya",
    description: DESCRIPTION,
    type: "article",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "1.000 Hari yang Mengubah Segalanya",
    description: DESCRIPTION,
  },
};

export const EDUKASI_SHORT_TITLE = TITLE_SHORT;
