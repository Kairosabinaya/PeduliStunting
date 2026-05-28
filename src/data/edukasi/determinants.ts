/**
 * WHO Conceptual Framework on Childhood Stunting — five concentric layers
 * dari konteks sosial-ekonomi (terluar) sampai status gizi ibu+anak
 * (inti). Setiap layer punya konten side panel berisi paragraf
 * penjelasan + callout bukti riset/data.
 *
 * Sumber narasi: Stewart et al. (2013) Maternal & Child Nutrition, dan
 * SSGI 2024 untuk angka quintile.
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
  /** Tone preset for the ring + panel accent. */
  readonly tone: "primary" | "secondary" | "success" | "warm" | "danger";
}

export const DETERMINANT_LAYERS: readonly DeterminantLayer[] = [
  {
    id: "layer-5-context",
    level: 5,
    label: "Konteks sosial-ekonomi & politik",
    description:
      "Kebijakan ekonomi, distribusi sumber daya, akses ke layanan kesehatan dasar, dan ketahanan pangan tingkat nasional menentukan lantai dasar peluang setiap anak Indonesia.",
    evidenceTitle: "Disparitas ekonomi",
    evidenceBody:
      "Kelompok ekonomi quintile 1 (termiskin) mencatat prevalensi stunting 29,8% — sekitar 50% lebih tinggi dari rata-rata nasional 19,8% per SSGI 2024.",
    evidenceFootnoteId: "fn-prevalence",
    tone: "secondary",
  },
  {
    id: "layer-4-community",
    level: 4,
    label: "Komunitas & lingkungan",
    description:
      "Akses air bersih, jamban layak, pengelolaan limbah, dan kedekatan dengan fasilitas kesehatan + posyandu aktif menentukan risiko infeksi berulang yang memicu stunting.",
    evidenceTitle: "Sanitasi & air",
    evidenceBody:
      "Kombinasi jamban tidak layak + air minum tidak diolah meningkatkan risiko stunting secara signifikan dalam literatur Indonesia.",
    evidenceFootnoteId: "fn-cameron-2016",
    tone: "warm",
  },
  {
    id: "layer-3-household",
    level: 3,
    label: "Rumah tangga",
    description:
      "Pendapatan keluarga, pendidikan ibu, jumlah anak, dukungan ayah, dan ketahanan pangan rumah tangga menentukan kualitas asupan harian dan kemampuan keluarga merespons sakit.",
    evidenceTitle: "Pendidikan ibu",
    evidenceBody:
      "Pendidikan ibu yang rendah adalah salah satu prediktor stunting paling konsisten dalam literatur Indonesia.",
    evidenceFootnoteId: "fn-beal-2018",
    tone: "primary",
  },
  {
    id: "layer-2-care",
    level: 2,
    label: "Praktik pengasuhan & pemberian makan",
    description:
      "Inisiasi Menyusu Dini, ASI eksklusif 0–6 bulan, MPASI kaya protein hewani, frekuensi makan yang tepat, dan kebersihan makanan adalah praktik harian dengan dampak paling langsung.",
    evidenceTitle: "ASI eksklusif",
    evidenceBody:
      "Tidak ASI eksklusif selama 6 bulan pertama termasuk determinant paling konsisten dalam literatur Indonesia.",
    evidenceFootnoteId: "fn-beal-2018",
    tone: "success",
  },
  {
    id: "layer-1-health",
    level: 1,
    label: "Status kesehatan & gizi ibu + anak",
    description:
      "Status gizi ibu sebelum hamil, anemia ibu hamil (Tablet Tambah Darah), berat lahir bayi, imunisasi lengkap, infeksi berulang (diare, ISPA), dan perawatan saat sakit adalah lapisan paling dekat dengan tubuh anak.",
    evidenceTitle: "Imunisasi & stunting",
    evidenceBody:
      "Bayi yang tidak mendapat imunisasi dasar lengkap berisiko lebih tinggi stunting karena infeksi berulang mengganggu penyerapan gizi.",
    tone: "danger",
  },
] as const;

export interface IncomeQuintilePoint {
  readonly id: string;
  readonly label: string;
  readonly prevalencePct: number;
  readonly note: string;
}

/**
 * SSGI 2024 menyebut quintile 1 (29,8%) dan rata-rata nasional (19,8%)
 * secara eksplisit. Q2-Q5 di-interpolasi sebagai estimasi monoton
 * (selisih kecil ke arah Q5) — angka exact menunggu rilis SSGI detail
 * BKPK. Ditandai sebagai estimasi di tooltip chart.
 */
export const INCOME_QUINTILES: readonly IncomeQuintilePoint[] = [
  {
    id: "q1",
    label: "Q1 (termiskin)",
    prevalencePct: 29.8,
    note: "Hampir 50% lebih tinggi dari rata-rata nasional",
  },
  {
    id: "q2",
    label: "Q2 (bawah)",
    prevalencePct: 24.5,
    note: "Estimasi monoton — angka detail menunggu rilis BKPK",
  },
  {
    id: "q3",
    label: "Q3 (menengah)",
    prevalencePct: 19.8,
    note: "Setara rata-rata nasional",
  },
  {
    id: "q4",
    label: "Q4 (atas)",
    prevalencePct: 16.5,
    note: "Estimasi monoton",
  },
  {
    id: "q5",
    label: "Q5 (terkaya)",
    prevalencePct: 12.2,
    note: "Estimasi monoton",
  },
] as const;

export const INCOME_QUINTILE_NATIONAL = 19.8;
