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
      "Stunting adalah gagal tumbuh akibat kekurangan gizi kronis. Ia memengaruhi otak dan kemampuan belajar — bukan sekadar tinggi badan.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: "myth-water-under-6-months",
    mythText: "Bayi sebelum 6 bulan boleh diberi air putih supaya tidak haus.",
    factText:
      "ASI sudah memenuhi seluruh kebutuhan cairan dan gizi bayi. Memberi air, makanan, atau minuman lain sebelum 6 bulan justru memicu masalah gizi, termasuk stunting.",
    sourceLabel: "Buku KIA 2024, hal. 38",
  },
  {
    id: "myth-reversible-anytime",
    mythText: "Stunting bisa dipulihkan kapan saja, bahkan saat anak remaja.",
    factText:
      "Jendela emas pencegahan adalah 1.000 hari pertama — konsepsi hingga usia 2 tahun. Setelahnya, dampak pada otak dan tinggi badan sulit dikejar.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: "myth-throw-kolostrum",
    mythText: "Membuang ASI pertama (kolostrum) karena terlihat kotor.",
    factText:
      "Kolostrum sangat berharga — kaya gizi dan antibodi yang melindungi bayi dari penyakit. Tidak boleh dibuang.",
    sourceLabel: "Buku KIA 2024, hal. 25",
  },
  {
    id: "myth-mpasi-rice-only",
    mythText: "MPASI cukup dengan bubur nasi dan sayur — daging belum perlu.",
    factText:
      "MPASI harus kaya protein hewani: daging, telur, ikan. Protein hewani membawa asam amino esensial untuk pertumbuhan otak.",
    sourceLabel: "Buku KIA 2024, hal. 56–57",
  },
  {
    id: "myth-fat-baby-safe",
    mythText: "Anak gemuk pasti tidak stunting.",
    factText:
      "Stunting diukur dari panjang/tinggi badan terhadap usia. Anak yang berat cukup pun bisa stunting bila tinggi di bawah standar WHO.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: "myth-only-poor-families",
    mythText: "Stunting hanya masalah keluarga miskin.",
    factText:
      "Quintile termiskin memang 29,8% (lebih tinggi dari nasional 19,8%), tapi stunting bukan eksklusif keluarga miskin. Pola asuh, ASI, MPASI, dan akses kesehatan menentukan di setiap lapisan ekonomi.",
    sourceLabel: "SSGI 2024",
  },
  {
    id: "myth-formula-equals-asi",
    mythText: "Pemberian susu formula sama bagusnya dengan ASI.",
    factText:
      "ASI mengandung gizi dan antibodi yang tidak bisa direplikasi oleh susu formula. WHO dan Kemenkes merekomendasikan ASI eksklusif 0–6 bulan lalu lanjut hingga 2 tahun.",
    sourceLabel: "Buku KIA 2024, hal. 34",
  },
  {
    id: "myth-short-equals-stunting",
    mythText: "Anak pendek pasti stunting — pasti karena gizi.",
    factText:
      "Tidak semua anak pendek adalah stunting; faktor genetik berperan. Diagnosis harus berdasarkan pengukuran tenaga kesehatan dengan standar WHO sesuai usia.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: "myth-immunization-unrelated",
    mythText: "Imunisasi tidak ada hubungannya dengan stunting.",
    factText:
      "Imunisasi dasar yang tidak lengkap berkorelasi dengan risiko stunting yang lebih tinggi — karena infeksi berulang mengganggu penyerapan gizi.",
    sourceLabel: "SKI 2023",
  },
] as const;
