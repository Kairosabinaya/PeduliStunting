/**
 * Saran stimulasi yang dapat ditampilkan ketika orang tua menandai milestone
 * sebagai `delayed`. Konten diturunkan dari panduan Buku KIA 2024 (lihat
 * brief Section 11). Saran tidak berubah lintas domain — Buku KIA memberi
 * paket aktivitas per rentang usia, bukan per domain perkembangan.
 *
 * Rentang yang belum disupply Buku KIA (mis. 24-48 bulan) sengaja kosong;
 * UI menampilkan pesan fallback agar tidak ada panduan yang dikarang.
 */

export interface StimulationGuide {
  /** Minimum age (months, inclusive) saat panduan ini mulai berlaku. */
  readonly minAgeMonths: number;
  /** Maximum age (months, inclusive) saat panduan ini masih relevan. */
  readonly maxAgeMonths: number;
  readonly heading: string;
  readonly tips: readonly string[];
  readonly sourceLabel: string;
}

export const STIMULATION_GUIDES: readonly StimulationGuide[] = [
  {
    minAgeMonths: 0,
    maxAgeMonths: 6,
    heading: "Stimulasi 0-6 bulan",
    tips: [
      "Peluk, cium, dan ayun lembut bayi setiap kali kontak.",
      "Senyum, tatap mata, dan ajak bicara sambil melakukan rutinitas.",
      "Tirukan ocehan bayi untuk mendorong komunikasi dua arah.",
      "Gantungkan benda berwarna atau berbunyi di atas tempat tidurnya.",
      "Ajak bayi meraih dan menggenggam mainan ringan.",
    ],
    sourceLabel: "Buku KIA 2024",
  },
  {
    minAgeMonths: 12,
    maxAgeMonths: 18,
    heading: "Stimulasi 12-18 bulan",
    tips: [
      "Latih berjalan mundur dan naik tangga dengan dampingan.",
      "Bermain tangkap dan lempar bola lembut.",
      "Susun balok atau puzzle sederhana bersama.",
      "Latih menggambar bebas dengan krayon besar.",
    ],
    sourceLabel: "Buku KIA 2024",
  },
  {
    minAgeMonths: 18,
    maxAgeMonths: 24,
    heading: "Stimulasi 18-24 bulan",
    tips: [
      "Ajak anak bicara, bertanya, bercerita, atau bernyanyi setiap hari.",
      "Latih tanya-jawab dan main telpon-telponan.",
      "Libatkan dalam merapikan mainan dan benda sehari-hari.",
      "Makan bersama keluarga supaya anak meniru kemandirian.",
    ],
    sourceLabel: "Buku KIA 2024",
  },
];

/**
 * Find the stimulation guide whose window covers the START of the milestone
 * range. Returns `null` when no guide covers the range — caller renders a
 * fallback message.
 *
 * Strategi pencocokan: kandidat = guide yang `minAgeMonths <= milestoneMin
 * AND maxAgeMonths >= milestoneMin`. Dari kandidat ambil yang `minAgeMonths`
 * paling besar (paling dekat dengan awal rentang milestone). Pendekatan ini
 * mencegah ambiguitas saat dua guide berbatas, mis. milestone(12-18)
 * memilih guide "12-18" bukan "18-24" walau keduanya tumpang tindih.
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
