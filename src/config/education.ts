/**
 * Configuration for the Edukasi (education) feature.
 *
 * Every literal consumed by the `/edukasi` list and `/edukasi/[slug]` detail
 * routes lives here so the presentation layer stays pure and the catalogue
 * can be re-tuned without touching components, per project guidelines §2.2 and §10.
 *
 * The topic enum is the source of truth in
 * `@/domain/education/value-objects/article-topic` (which mirrors the
 * `education_articles.topic` CHECK constraint defined in
 * `supabase/migrations/20260525120500_education.sql`). This file decorates
 * each topic with the UI label, blurb, and badge tone that drive the page.
 */

import {
  ARTICLE_TOPICS,
  type ArticleTopic,
} from "@/domain/education/value-objects/article-topic";

/* ─────────────────────────── URL search params ─────────────────────────── */

/** URL search-param key for the active topic filter. */
export const EDUCATION_TOPIC_PARAM = "topik";
/** URL search-param key for the active age-band filter. */
export const EDUCATION_AGE_PARAM = "usia";
/** URL search-param key for the free-text search query. */
export const EDUCATION_SEARCH_PARAM = "cari";
/** URL search-param key for pagination (1-based page number). */
export const EDUCATION_PAGE_PARAM = "halaman";

/* ─────────────────────────── List configuration ─────────────────────────── */

/** Number of articles served per page on the list route. */
export const EDUCATION_PAGE_SIZE = 12;

/** Minimum length of a search term before it is forwarded to the repository. */
export const EDUCATION_SEARCH_MIN_LENGTH = 2;

/** Maximum length accepted from the search input. Longer queries are rejected. */
export const EDUCATION_SEARCH_MAX_LENGTH = 80;

/** ISR revalidation window for `/edukasi` (matches STATE.md §5.1). */
export const EDUCATION_LIST_REVALIDATE_SECONDS = 1800;

/** ISR revalidation window for `/edukasi/[slug]` (matches STATE.md §5.1). */
export const EDUCATION_DETAIL_REVALIDATE_SECONDS = 86_400;

/** Cache tag for the list route — invalidated whenever an article changes. */
export const EDUCATION_LIST_CACHE_TAG = "articles";

/** Build the cache tag for an individual article by slug. */
export function educationArticleCacheTag(slug: string): string {
  return `article:${slug}`;
}

/* ─────────────────────────── Topic catalogue ─────────────────────────── */

/** Visual tone used by the topic Badge on cards. Reserved tones (`rendah`/
 * `sedang`/`tinggi`) are intentionally excluded so the stunting palette keeps
 * its semantic meaning across the map and tracker surfaces. */
export type EducationTopicTone = "neutral" | "primary" | "success";

export interface EducationTopicEntry {
  /** Canonical topic key (mirrors the DB CHECK enum). */
  readonly key: ArticleTopic;
  /** Bahasa Indonesia label shown to the reader. */
  readonly label: string;
  /** One-line description for filter chips and screen readers. */
  readonly description: string;
  /** Badge tone applied to topic chips and article cards. */
  readonly tone: EducationTopicTone;
}

/**
 * Ordered topic catalogue. Order is intentional: it follows the user journey
 * from preconception through early childhood, matching the chapter sequence
 * of Buku KIA 2024.
 */
export const EDUCATION_TOPIC_CATALOG: readonly EducationTopicEntry[] = [
  {
    key: "kehamilan",
    label: "Kehamilan",
    description: "Persiapan, pemeriksaan, dan tanda bahaya selama kehamilan.",
    tone: "primary",
  },
  {
    key: "persalinan",
    label: "Persalinan",
    description: "Tanda persalinan, persiapan tas bersalin, dan rujukan.",
    tone: "primary",
  },
  {
    key: "nifas",
    label: "Nifas",
    description:
      "Pemulihan ibu pasca-melahirkan, KB, dan dukungan psikologis.",
    tone: "primary",
  },
  {
    key: "bayi",
    label: "Bayi",
    description: "Perawatan bayi baru lahir, ASI eksklusif, dan kunjungan neonatal.",
    tone: "success",
  },
  {
    key: "balita",
    label: "Balita",
    description: "Pemantauan pertumbuhan dan perawatan harian balita.",
    tone: "success",
  },
  {
    key: "gizi",
    label: "Gizi",
    description: "MPASI, Isi Piringku, dan pencegahan stunting via gizi.",
    tone: "success",
  },
  {
    key: "imunisasi",
    label: "Imunisasi",
    description: "Jadwal IDL 2024 dan respons pasca-imunisasi.",
    tone: "neutral",
  },
  {
    key: "perkembangan",
    label: "Perkembangan",
    description: "Tonggak motorik, bahasa, dan stimulasi SDIDTK.",
    tone: "neutral",
  },
  {
    key: "kesehatan_umum",
    label: "Kesehatan umum",
    description: "PHBS, tidur, dan kebiasaan harian keluarga.",
    tone: "neutral",
  },
] as const;

/** Quick lookup from topic key to its catalog entry. */
export const EDUCATION_TOPIC_INDEX: Readonly<
  Record<ArticleTopic, EducationTopicEntry>
> = Object.fromEntries(
  EDUCATION_TOPIC_CATALOG.map((entry) => [entry.key, entry]),
) as Readonly<Record<ArticleTopic, EducationTopicEntry>>;

/* ─────────────────────────── Age-band catalogue ─────────────────────────── */

/**
 * An age-band filter is either prenatal-only (articles with both age bounds
 * NULL) or a child range expressed as months. The repository overlaps the
 * filter range with each article's [minAgeMonths, maxAgeMonths] window.
 */
export type EducationAgeRange =
  | { readonly kind: "prenatal" }
  | { readonly kind: "child"; readonly minAgeMonths: number; readonly maxAgeMonths: number };

export interface EducationAgePresetEntry {
  /** Stable key used in URLs. */
  readonly key: string;
  /** Short label shown in the filter chip. */
  readonly label: string;
  /** Helper text shown next to the chip for screen readers. */
  readonly description: string;
  /** How this preset maps to a repository age range. */
  readonly range: EducationAgeRange;
}

/**
 * Ordered preset list. Ranges deliberately overlap at the boundaries so an
 * article tagged 6-8 months appears in both "Bayi 0-6 bln" and
 * "Bayi 6-12 bln". This is intentional — boundary articles are relevant to
 * both audiences.
 */
export const EDUCATION_AGE_PRESETS: readonly EducationAgePresetEntry[] = [
  {
    key: "prakelahiran",
    label: "Prakelahiran",
    description: "Konten untuk masa kehamilan, persalinan, dan nifas.",
    range: { kind: "prenatal" },
  },
  {
    key: "0-6",
    label: "Bayi 0-6 bln",
    description: "Konten yang relevan untuk bayi usia 0 sampai 6 bulan.",
    range: { kind: "child", minAgeMonths: 0, maxAgeMonths: 6 },
  },
  {
    key: "6-12",
    label: "Bayi 6-12 bln",
    description: "Konten yang relevan untuk bayi usia 6 sampai 12 bulan.",
    range: { kind: "child", minAgeMonths: 6, maxAgeMonths: 12 },
  },
  {
    key: "12-24",
    label: "Anak 1-2 thn",
    description: "Konten yang relevan untuk anak usia 12 sampai 24 bulan.",
    range: { kind: "child", minAgeMonths: 12, maxAgeMonths: 24 },
  },
  {
    key: "24-60",
    label: "Balita 2-5 thn",
    description: "Konten yang relevan untuk balita usia 24 sampai 60 bulan.",
    range: { kind: "child", minAgeMonths: 24, maxAgeMonths: 60 },
  },
] as const;

/** Quick lookup from preset key to its entry. */
export const EDUCATION_AGE_PRESET_INDEX: Readonly<
  Record<string, EducationAgePresetEntry>
> = Object.fromEntries(
  EDUCATION_AGE_PRESETS.map((preset) => [preset.key, preset]),
);

/* ─────────────────────────── UI copy ─────────────────────────── */

export const EDUCATION_COPY = {
  eyebrow: "Pengetahuan keluarga",
  title: "Edukasi Buku KIA",
  description:
    "Ringkasan modul resmi Buku Kesehatan Ibu dan Anak 2024 yang sudah dikelompokkan per topik dan rentang usia anak. Cari artikel atau gunakan filter di bawah.",
  searchLabel: "Cari artikel",
  searchPlaceholder: "Contoh: ASI eksklusif, imunisasi, MPASI",
  filtersHeading: "Saring konten",
  resetFiltersLabel: "Bersihkan filter",
  topicFilterLabel: "Topik",
  topicFilterAllLabel: "Semua topik",
  ageFilterLabel: "Rentang usia",
  ageFilterAllLabel: "Semua usia",
  resultsSummary: (total: number): string =>
    total === 1 ? "1 artikel ditemukan" : `${total} artikel ditemukan`,
  emptyTitle: "Belum ada artikel cocok",
  emptyDescription:
    "Coba ganti kata kunci pencarian atau bersihkan filter untuk melihat seluruh koleksi.",
  emptyAction: "Bersihkan filter",
  errorTitle: "Tidak bisa memuat artikel",
  errorDescription:
    "Layanan edukasi sedang tidak dapat dihubungi. Coba muat ulang halaman beberapa saat lagi.",
  errorAction: "Muat ulang",
  loadingLabel: "Memuat artikel...",
  paginationPrevious: "Halaman sebelumnya",
  paginationNext: "Halaman selanjutnya",
  paginationStatus: (current: number, total: number): string =>
    `Halaman ${current} dari ${total}`,
  cardReadMore: "Baca artikel",
  cardSourcePrefix: "Sumber",
} as const;

export const EDUCATION_DETAIL_COPY = {
  backLink: "Kembali ke daftar",
  backLinkAria: "Kembali ke daftar edukasi",
  topicLabel: "Topik",
  ageLabel: "Rentang usia",
  sourceLabel: "Sumber",
  sourceLinkLabel: "Buka sumber resmi",
  publishedLabel: "Diterbitkan",
  notFoundTitle: "Artikel tidak ditemukan",
  notFoundDescription:
    "Artikel yang Anda cari tidak tersedia. Mungkin sudah diperbarui atau dihapus.",
  notFoundAction: "Kembali ke daftar",
} as const;

/* ─────────────────────────── Age range formatting ─────────────────────────── */

/**
 * Render an article's age range as a short, accessible label.
 * Returns `null` when both bounds are NULL (prenatal content).
 */
export function formatEducationAgeRange(
  minAgeMonths: number | null,
  maxAgeMonths: number | null,
): string | null {
  if (minAgeMonths === null && maxAgeMonths === null) return null;
  if (minAgeMonths !== null && maxAgeMonths !== null) {
    return `${minAgeMonths}-${maxAgeMonths} bln`;
  }
  if (minAgeMonths !== null) return `\u2265 ${minAgeMonths} bln`;
  if (maxAgeMonths !== null) return `\u2264 ${maxAgeMonths} bln`;
  return null;
}

/**
 * Render the long-form audience label used in detail meta-cards. Returns
 * "Prakelahiran" for prenatal content and otherwise the formatted range.
 */
export function formatEducationAudienceLabel(
  minAgeMonths: number | null,
  maxAgeMonths: number | null,
): string {
  if (minAgeMonths === null && maxAgeMonths === null) return "Prakelahiran";
  return formatEducationAgeRange(minAgeMonths, maxAgeMonths) ?? "Prakelahiran";
}

/* ─────────────────────────── Topic helpers ─────────────────────────── */

/** Type-narrowing helper for URL parsing. */
export function isEducationTopicKey(value: string): value is ArticleTopic {
  return (ARTICLE_TOPICS as readonly string[]).includes(value);
}

/** Type-narrowing helper for URL parsing. */
export function isEducationAgePresetKey(value: string): boolean {
  return value in EDUCATION_AGE_PRESET_INDEX;
}
