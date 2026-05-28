/**
 * Copy for ACT 11 — the closing band and the footnotes list. Footnote
 * entries themselves live in `src/data/edukasi/footnotes.ts` so the
 * presentation file is pure markup.
 */

export const CLOSING_COPY = {
  eyebrow: "Penutup",
  footnoteBackLabel: "Kembali ke teks",
  footnoteBackAriaTemplate: (number: number): string =>
    `Kembali ke teks dari catatan kaki ${number}`,
  headline: [
    { kind: "text", value: "Setiap anak Indonesia berhak" } as const,
    { kind: "break" } as const,
    { kind: "text", value: "tumbuh " } as const,
    {
      kind: "highlight",
      value: "sehat dan cerdas",
      variant: "white" as const,
    } as const,
    { kind: "text", value: "." } as const,
  ],
  body: [
    "Mulai dari satu keluarga, satu posyandu, satu kabupaten.",
    "Perubahan dimulai dari pemahaman yang sama.",
  ],
  ctaPrimary: { label: "Pelajari peta nasional", href: "/map" },
  ctaSecondary: { label: "Mulai pantau anak", href: "/tracker" },
  footnoteHeading: "Sumber & catatan",
  footnoteIntro:
    "Setiap angka di halaman ini terhubung ke sumber resmi. Klik nomor superscript pada teks untuk melompat ke entri terkait.",
  metaCopyright: "© 2026 Peduli Stunting",
  metaSources: "Sumber data: SSGI 2024, SKI 2023, BPS RI, Buku KIA 2024",
  metaIndependent: "Independen, non-komersial",
  lastUpdatedPrefix: "Halaman ini terakhir diperbarui",
  lastUpdatedDate: "28 Mei 2026",
  caveat:
    "Data dapat berubah seiring rilis survei berikutnya. Kontribusi koreksi terbuka melalui repositori publik.",
} as const;

export type ClosingHeadlineWord =
  | { readonly kind: "text"; readonly value: string }
  | { readonly kind: "break" }
  | {
      readonly kind: "highlight";
      readonly value: string;
      readonly variant: "white";
    };
