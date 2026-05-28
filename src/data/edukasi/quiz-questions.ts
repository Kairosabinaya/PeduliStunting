/**
 * Quiz questions for ACT 9. Each item is a binary choice (mitos | fakta);
 * the explanation surfaced after answering cites the same KIA pages used
 * by ACT 7 so the two surfaces stay consistent.
 *
 * Tier calculation lives in `quiz-tiers.ts` so changing thresholds does
 * not require touching question content.
 */

export type QuizAnswer = "mitos" | "fakta";

export interface QuizQuestion {
  /** 1-based id used as React `key` and for analytics if added later. */
  readonly id: number;
  /** Statement displayed to the reader. */
  readonly statement: string;
  /** The correct classification. */
  readonly correctAnswer: QuizAnswer;
  /** Plain-language explanation shown after the reader answers. */
  readonly explanation: string;
  /** Source attribution rendered below the explanation. */
  readonly sourceLabel: string;
}

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 1,
    statement: "Stunting hanya terjadi pada anak yang kurang makan.",
    correctAnswer: "mitos",
    explanation:
      "Stunting disebabkan banyak faktor: gizi kronis ibu hamil, pola asuh, ASI, MPASI, sanitasi, akses kesehatan, dan kondisi sosial-ekonomi. Bukan sekadar 'kurang makan'.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: 2,
    statement:
      "ASI eksklusif diberikan sampai bayi berusia 6 bulan — tanpa air putih, madu, atau apa pun.",
    correctAnswer: "fakta",
    explanation:
      "ASI mencukupi cairan dan gizi bayi sampai usia 6 bulan. Memberi air, madu, atau makanan apa pun sebelum 6 bulan dapat memicu masalah gizi termasuk stunting.",
    sourceLabel: "Buku KIA 2024, hal. 38",
  },
  {
    id: 3,
    statement: "Bayi gemuk tidak mungkin mengalami stunting.",
    correctAnswer: "mitos",
    explanation:
      "Stunting diukur dari tinggi/panjang badan terhadap usia, bukan berat. Anak bisa berat cukup atau lebih namun tetap stunting bila tinggi di bawah standar WHO.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: 4,
    statement: "MPASI sebaiknya kaya protein hewani — telur, ikan, daging.",
    correctAnswer: "fakta",
    explanation:
      "Protein hewani membawa asam amino esensial yang penting untuk pertumbuhan otak dan tubuh. Diprioritaskan dalam MPASI.",
    sourceLabel: "Buku KIA 2024, hal. 56–57",
  },
  {
    id: 5,
    statement:
      "Stunting bisa dipulihkan sepenuhnya bahkan setelah anak berusia 5 tahun.",
    correctAnswer: "mitos",
    explanation:
      "Jendela emas adalah 1.000 hari pertama (konsepsi hingga 2 tahun). Setelah periode ini, dampak stunting pada perkembangan otak dan tinggi badan sulit dikejar.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: 6,
    statement:
      "Pemeriksaan kehamilan minimal 6 kali ke tenaga kesehatan adalah bagian dari pencegahan stunting.",
    correctAnswer: "fakta",
    explanation:
      "Pemeriksaan rutin memastikan ibu mendapat TTD, deteksi dini masalah, dan kondisi cukup untuk melahirkan bayi dengan berat dan panjang normal.",
    sourceLabel: "Buku KIA 2024, hal. 5",
  },
  {
    id: 7,
    statement:
      "Inisiasi Menyusu Dini (IMD) harus dilakukan dalam 24 jam pertama setelah bayi lahir.",
    correctAnswer: "mitos",
    explanation:
      "IMD harus dilakukan dalam 1 jam pertama setelah kelahiran, dengan kontak kulit ke kulit selama 1 jam. Manfaatnya termasuk stimulasi produksi ASI dan kandungan kolostrum yang protektif.",
    sourceLabel: "Buku KIA 2024, hal. 25",
  },
  {
    id: 8,
    statement: "Anak yang pendek pasti stunting.",
    correctAnswer: "mitos",
    explanation:
      "Tidak semua anak pendek adalah stunting — faktor genetik juga berperan. Diagnosis stunting harus berdasarkan pengukuran tenaga kesehatan dengan standar WHO sesuai usia.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: 9,
    statement:
      "Penggunaan gawai pada bayi di bawah 18 bulan boleh-boleh saja asal sebentar.",
    correctAnswer: "mitos",
    explanation:
      "Bayi/anak di bawah 18 bulan tidak dianjurkan menggunakan gawai, kecuali untuk video call dengan pendampingan. Penggunaan berlebih dikaitkan dengan keterlambatan bicara dan gangguan kognitif.",
    sourceLabel: "Buku KIA 2024, hal. 49",
  },
  {
    id: 10,
    statement:
      "Periode usia 12–24 bulan adalah periode paling rawan stunting di Indonesia.",
    correctAnswer: "fakta",
    explanation:
      "Buku KIA mencatat 'stunting paling banyak terjadi di kelompok usia 12–24 bulan'. Karena itu pemantauan rutin di posyandu sangat krusial di rentang ini.",
    sourceLabel: "Buku KIA 2024, hal. 65",
  },
] as const;

export const QUIZ_TOTAL = QUIZ_QUESTIONS.length;
