/**
 * Mitos vs Fakta dataset (ACT 7). Ten cards, each citing a source (page
 * number from Buku KIA 2024 or a national survey name). Order is the
 * narrative ordering used by the section — first card lands on the most
 * common headline misconception, last card on a clinical/operational nuance.
 */

export interface MythCardData {
  /** Stable id used as React `key` and for analytics if added later. */
  readonly id: string;
  /** Front-of-card text — the misconception, written as it is commonly heard. */
  readonly mythText: string;
  /** Back-of-card text — the fact, written in plain language. */
  readonly factText: string;
  /** Source attribution surfaced in small caps under the fact. */
  readonly sourceLabel: string;
}

export const EDUKASI_MYTHS: readonly MythCardData[] = [
  {
    id: "myth-stunting-only-height",
    mythText: "Stunting hanya soal anak yang pendek.",
    factText:
      "Stunting adalah gagal tumbuh akibat kekurangan gizi kronis. Dampaknya bukan hanya pada tinggi badan, tetapi juga pada perkembangan otak dan kemampuan belajar anak.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: "myth-water-under-6-months",
    mythText: "Bayi di bawah 6 bulan boleh diberi air putih supaya tidak haus.",
    factText:
      "ASI sudah mencukupi kebutuhan cairan dan gizi bayi sampai usia 6 bulan. Air, madu, makanan, atau minuman lain tidak perlu diberikan kecuali atas anjuran tenaga kesehatan.",
    sourceLabel: "Buku KIA 2024, hal. 38",
  },
  {
    id: "myth-reversible-anytime",
    mythText: "Stunting bisa dipulihkan kapan saja, bahkan saat anak remaja.",
    factText:
      "Pencegahan paling penting dilakukan pada 1.000 hari pertama kehidupan, sejak kehamilan hingga anak berusia 2 tahun. Setelah lewat masa ini, dampaknya lebih sulit dikejar.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: "myth-throw-kolostrum",
    mythText:
      "ASI pertama atau kolostrum sebaiknya dibuang karena terlihat kotor.",
    factText:
      "Kolostrum justru sangat berharga. ASI pertama ini kaya gizi dan antibodi yang membantu melindungi bayi dari penyakit.",
    sourceLabel: "Buku KIA 2024, hal. 25",
  },
  {
    id: "myth-mpasi-rice-only",
    mythText: "MPASI cukup dengan bubur nasi dan sayur. Daging belum perlu.",
    factText:
      "MPASI perlu mengandung protein hewani seperti daging, telur, dan ikan. Protein hewani penting untuk mendukung pertumbuhan tubuh dan perkembangan otak anak.",
    sourceLabel: "Buku KIA 2024, hal. 56–57",
  },
  {
    id: "myth-fat-baby-safe",
    mythText: "Anak gemuk pasti tidak stunting.",
    factText:
      "Stunting dilihat dari panjang atau tinggi badan anak terhadap usianya. Anak dengan berat badan cukup pun tetap bisa stunting jika tinggi badannya berada di bawah standar.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: "myth-only-poor-families",
    mythText: "Stunting hanya terjadi pada keluarga miskin.",
    factText:
      "Risiko stunting memang lebih tinggi pada keluarga miskin, tetapi stunting bisa terjadi di berbagai lapisan ekonomi. Pola asuh, ASI, MPASI, sanitasi, dan akses layanan kesehatan tetap berperan penting.",
    sourceLabel: "SSGI 2024",
  },
  {
    id: "myth-formula-equals-asi",
    mythText: "Susu formula sama baiknya dengan ASI.",
    factText:
      "ASI mengandung gizi dan antibodi yang tidak dapat sepenuhnya digantikan oleh susu formula. Karena itu, bayi dianjurkan mendapat ASI eksklusif sampai usia 6 bulan dan dilanjutkan hingga 2 tahun atau lebih.",
    sourceLabel: "Buku KIA 2024, hal. 34",
  },
  {
    id: "myth-short-equals-stunting",
    mythText: "Anak pendek pasti stunting karena kurang gizi.",
    factText:
      "Tidak semua anak pendek mengalami stunting. Faktor genetik juga bisa berpengaruh. Status stunting perlu ditentukan melalui pengukuran oleh tenaga kesehatan dengan standar yang sesuai usia.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: "myth-immunization-unrelated",
    mythText: "Imunisasi tidak ada hubungannya dengan stunting.",
    factText:
      "Imunisasi membantu melindungi anak dari infeksi berulang. Jika anak sering sakit, penyerapan gizi dapat terganggu dan risiko stunting bisa meningkat.",
    sourceLabel: "SKI 2023",
  },
] as const;
