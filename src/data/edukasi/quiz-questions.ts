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
      "Stunting dipengaruhi banyak hal, mulai dari gizi ibu saat hamil, pola asuh, ASI, MPASI, sanitasi, akses layanan kesehatan, hingga kondisi sosial-ekonomi. Jadi, penyebabnya bukan hanya kurang makan.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: 2,
    statement:
      "ASI eksklusif diberikan sampai bayi berusia 6 bulan, tanpa air putih, madu, atau makanan lain.",
    correctAnswer: "fakta",
    explanation:
      "ASI sudah mencukupi kebutuhan cairan dan gizi bayi sampai usia 6 bulan. Air, madu, makanan, atau minuman lain tidak perlu diberikan kecuali atas anjuran tenaga kesehatan.",
    sourceLabel: "Buku KIA 2024, hal. 38",
  },
  {
    id: 3,
    statement: "Bayi gemuk tidak mungkin mengalami stunting.",
    correctAnswer: "mitos",
    explanation:
      "Stunting dilihat dari panjang atau tinggi badan anak terhadap usianya, bukan hanya dari berat badan. Anak dengan berat cukup pun tetap bisa stunting jika tinggi badannya berada di bawah standar.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: 4,
    statement:
      "MPASI sebaiknya kaya protein hewani, seperti telur, ikan, dan daging.",
    correctAnswer: "fakta",
    explanation:
      "Protein hewani penting dalam MPASI karena membantu mendukung pertumbuhan tubuh dan perkembangan otak anak. Contohnya telur, ikan, daging, ayam, dan sumber protein hewani lainnya.",
    sourceLabel: "Buku KIA 2024, hal. 56–57",
  },
  {
    id: 5,
    statement:
      "Stunting bisa dipulihkan sepenuhnya kapan saja, bahkan setelah anak berusia 5 tahun.",
    correctAnswer: "mitos",
    explanation:
      "Pencegahan paling penting dilakukan pada 1.000 hari pertama kehidupan, sejak kehamilan hingga anak berusia 2 tahun. Setelah masa ini, dampaknya pada tumbuh kembang anak lebih sulit dikejar.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: 6,
    statement:
      "Pemeriksaan kehamilan minimal 6 kali ke tenaga kesehatan adalah bagian dari pencegahan stunting.",
    correctAnswer: "fakta",
    explanation:
      "Pemeriksaan rutin membantu memantau kondisi ibu dan janin, mendeteksi masalah sejak dini, serta memastikan ibu mendapat layanan penting seperti TTD, pemeriksaan gizi, dan edukasi kesehatan.",
    sourceLabel: "Buku KIA 2024, hal. 5",
  },
  {
    id: 7,
    statement:
      "Inisiasi Menyusu Dini atau IMD cukup dilakukan dalam 24 jam pertama setelah bayi lahir.",
    correctAnswer: "mitos",
    explanation:
      "IMD sebaiknya dilakukan dalam 1 jam pertama setelah bayi lahir melalui kontak kulit ke kulit. Proses ini membantu merangsang produksi ASI dan mendukung pemberian kolostrum.",
    sourceLabel: "Buku KIA 2024, hal. 25",
  },
  {
    id: 8,
    statement: "Anak yang pendek pasti stunting.",
    correctAnswer: "mitos",
    explanation:
      "Tidak semua anak pendek mengalami stunting. Faktor genetik juga bisa berpengaruh. Status stunting perlu ditentukan melalui pengukuran oleh tenaga kesehatan dengan standar yang sesuai usia.",
    sourceLabel: "Buku KIA 2024, hal. 4",
  },
  {
    id: 9,
    statement:
      "Bayi di bawah 18 bulan boleh menggunakan gawai asal hanya sebentar.",
    correctAnswer: "mitos",
    explanation:
      "Bayi di bawah 18 bulan tidak dianjurkan menggunakan gawai, kecuali untuk video call dengan pendampingan. Pada usia ini, interaksi langsung dengan orang tua jauh lebih penting.",
    sourceLabel: "Buku KIA 2024, hal. 49",
  },
  {
    id: 10,
    statement:
      "Usia 12 sampai 24 bulan merupakan salah satu masa paling rawan stunting.",
    correctAnswer: "fakta",
    explanation:
      "Pada usia 12 sampai 24 bulan, pertumbuhan anak perlu dipantau lebih serius. Karena itu, berat dan tinggi badan anak sebaiknya dicek rutin di posyandu setiap bulan.",
    sourceLabel: "Buku KIA 2024, hal. 65",
  },
] as const;

export const QUIZ_TOTAL = QUIZ_QUESTIONS.length;
