/**
 * WHO Conceptual Framework on Childhood Stunting — five concentric layers
 * dari konteks sosial-ekonomi (terluar) sampai status gizi ibu+anak
 * (inti). Setiap layer punya konten side panel berisi paragraf
 * penjelasan + callout bukti riset/data.
 *
 * Sumber narasi: Stewart et al. (2013) Maternal & Child Nutrition.
 */

export interface DeterminantLayer {
  /** Stable id used as React `key` and tab `aria-controls`. */
  readonly id: string;
  /** Display number (1 = inti, 5 = terluar). Used for badges. */
  readonly level: 1 | 2 | 3 | 4 | 5;
  /** Short label rendered on the ring + tab. */
  readonly label: string;
  /** Long-form description shown in the side panel. */
  readonly description: string;
  /** Headline of the "bukti" callout box. */
  readonly evidenceTitle: string;
  /** Body of the "bukti" callout box. */
  readonly evidenceBody: string;
  /**
   * Optional id from `EDUKASI_FOOTNOTES` that cites the evidence claim.
   * When present, the panel renders a `<FootnoteRef>` at the end of the
   * evidence body so users can jump to the source.
   */
  readonly evidenceFootnoteId?: string;
  /**
   * Tone preset for the badge + panel accent. All five are drawn from the
   * project's blue/green palette and arranged as an outer-blue → inner-green
   * ramp (L5 deep blue → L1 bright green), matching "distal context →
   * proximal child". No warm/red tones (off-palette).
   */
  readonly tone:
    | "secondary"
    | "primary"
    | "primary-soft"
    | "success"
    | "accent";
}

export const DETERMINANT_LAYERS: readonly DeterminantLayer[] = [
  {
    id: "layer-5-context",
    level: 5,
    label: "Kondisi sosial-ekonomi",
    description:
      "Kemiskinan, akses layanan kesehatan, dan kebijakan publik ikut menentukan peluang anak untuk tumbuh sehat sejak awal kehidupan.",
    evidenceTitle: "Disparitas ekonomi",
    evidenceBody:
      "Anak dari keluarga miskin memiliki risiko stunting lebih tinggi. Pada kelompok ini, prevalensinya mencapai sekitar 29,8%.",
    evidenceFootnoteId: "fn-prevalence",
    tone: "secondary", // L5 — deep blue (outermost context)
  },
  {
    id: "layer-4-community",
    level: 4,
    label: "Komunitas & lingkungan",
    description:
      "Air bersih, jamban layak, pengelolaan limbah, dan akses ke posyandu membantu melindungi anak dari infeksi berulang yang dapat memicu stunting.",
    evidenceTitle: "Sanitasi & air",
    evidenceBody:
      "Jamban tidak layak dan air minum tidak aman dapat meningkatkan risiko infeksi berulang pada anak.",
    evidenceFootnoteId: "fn-cameron-2016",
    tone: "primary", // L4 — blue
  },
  {
    id: "layer-3-household",
    level: 3,
    label: "Rumah tangga",
    description:
      "Pendapatan keluarga, pendidikan ibu, jumlah anak, dukungan ayah, dan ketahanan pangan memengaruhi kualitas asupan serta perawatan anak di rumah.",
    evidenceTitle: "Pendidikan ibu",
    evidenceBody:
      "Pendidikan ibu yang rendah sering dikaitkan dengan risiko stunting yang lebih tinggi pada anak.",
    evidenceFootnoteId: "fn-beal-2018",
    tone: "primary-soft", // L3 — light/sky blue (bridges blue → green)
  },
  {
    id: "layer-2-care",
    level: 2,
    label: "Pola asuh & makan",
    description:
      "IMD, ASI eksklusif, MPASI bergizi, frekuensi makan, dan kebersihan makanan adalah bagian dari kebiasaan harian yang langsung memengaruhi tumbuh kembang anak.",
    evidenceTitle: "ASI eksklusif",
    evidenceBody:
      "Tidak mendapat ASI eksklusif selama 6 bulan pertama dapat meningkatkan risiko stunting.",
    evidenceFootnoteId: "fn-beal-2018",
    tone: "success", // L2 — green
  },
  {
    id: "layer-1-health",
    level: 1,
    label: "Kesehatan ibu dan anak",
    description:
      "Gizi ibu sebelum dan selama hamil, berat lahir bayi, imunisasi, serta penanganan saat anak sakit berperan besar dalam mencegah stunting.",
    evidenceTitle: "Imunisasi & stunting",
    evidenceBody:
      "Imunisasi yang tidak lengkap dapat membuat anak lebih rentan terhadap infeksi berulang yang mengganggu penyerapan gizi.",
    tone: "accent", // L1 — bright green (innermost: the child)
  },
] as const;
