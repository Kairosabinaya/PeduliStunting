/**
 * Saran stimulasi yang ditampilkan saat orang tua menandai milestone sebagai
 * `delayed`. Konten mengacu pada panduan Buku KIA 2024.
 *
 * Buku KIA memberi paket aktivitas per rentang usia, bukan per domain
 * perkembangan. Karena itu, saran stimulasi tidak dibedakan berdasarkan domain.
 *
 * Rentang usia yang belum tersedia sengaja dikosongkan. UI akan menampilkan
 * pesan fallback agar tidak ada panduan yang dikarang.
 */

export interface StimulationGuide {
  /** Minimum age in months, inclusive. */
  readonly minAgeMonths: number;
  /** Maximum age in months, inclusive. */
  readonly maxAgeMonths: number;
  readonly heading: string;
  readonly tips: readonly string[];
  readonly sourceLabel: string;
}

export const STIMULATION_GUIDES: readonly StimulationGuide[] = [
  {
    minAgeMonths: 0,
    maxAgeMonths: 6,
    heading: "Stimulasi 0–6 bulan",
    tips: [
      "Peluk, cium, dan ayun bayi dengan lembut saat berinteraksi.",
      "Tatap mata bayi, tersenyum, dan ajak bicara saat menjalani rutinitas.",
      "Tirukan ocehan bayi untuk melatih komunikasi dua arah.",
      "Gantungkan benda berwarna atau berbunyi di tempat yang aman.",
      "Ajak bayi meraih dan menggenggam mainan ringan.",
    ],
    sourceLabel: "Buku KIA 2024",
  },
  {
    minAgeMonths: 12,
    maxAgeMonths: 18,
    heading: "Stimulasi 12–18 bulan",
    tips: [
      "Latih anak berjalan mundur dan naik tangga dengan pendampingan.",
      "Ajak bermain lempar tangkap dengan bola yang lembut.",
      "Susun balok atau puzzle sederhana bersama anak.",
      "Berikan krayon besar dan biarkan anak mencoret bebas.",
    ],
    sourceLabel: "Buku KIA 2024",
  },
  {
    minAgeMonths: 18,
    maxAgeMonths: 24,
    heading: "Stimulasi 18–24 bulan",
    tips: [
      "Ajak anak berbicara, bertanya, bercerita, atau bernyanyi setiap hari.",
      "Latih tanya jawab sederhana melalui permainan pura-pura, seperti telepon-teleponan.",
      "Libatkan anak saat merapikan mainan atau benda sehari-hari.",
      "Biasakan makan bersama keluarga agar anak belajar mandiri dan meniru kebiasaan baik.",
    ],
    sourceLabel: "Buku KIA 2024",
  },
];

/**
 * Cari panduan stimulasi yang mencakup awal rentang milestone.
 * Mengembalikan `null` jika belum ada panduan yang sesuai.
 *
 * Strategi pencocokan:
 * - Ambil guide dengan `minAgeMonths <= milestoneMin`
 * - Pastikan `maxAgeMonths >= milestoneMin`
 * - Jika ada lebih dari satu kandidat, pilih guide dengan `minAgeMonths`
 *   paling besar agar hasilnya paling dekat dengan rentang milestone.
 */
export function findStimulationGuide(
  milestoneMin: number,
  _milestoneMax: number,
): StimulationGuide | null {
  let best: StimulationGuide | null = null;

  for (const guide of STIMULATION_GUIDES) {
    const covers =
      guide.minAgeMonths <= milestoneMin && guide.maxAgeMonths >= milestoneMin;

    if (!covers) continue;

    if (best === null || guide.minAgeMonths > best.minAgeMonths) {
      best = guide;
    }
  }

  return best;
}
