/**
 * Six frames of the 1.000 Hari Pertama Kehidupan (HPK) journey. Each
 * frame maps a chunk of the 0–1000 day range to a narrative milestone,
 * a size analogy, and Buku KIA 2024 callouts.
 *
 * Frames are evaluated by ACT 5's pinned scroll: the active frame is the
 * one whose `[startDay, endDay]` window covers the current day count
 * (derived from scrollYProgress * 1000).
 */

export interface TimelineFrame {
  /** Stable id used for React keys + side-panel transition. */
  readonly id: string;
  /** Inclusive start of the day-range this frame represents. */
  readonly startDay: number;
  /** Exclusive end of the day-range. The final frame uses 1001 so day 1000 still selects it. */
  readonly endDayExclusive: number;
  /** Short label rendered on the progress rail. */
  readonly railLabel: string;
  /** Headline of the side panel. */
  readonly title: string;
  /** Size analogy used by the visual + body copy. */
  readonly sizeAnalogy: string;
  /** Two- to three-sentence body copy. */
  readonly body: string;
  /** Bullet list — "yang perlu dilakukan". */
  readonly actions: readonly string[];
  /** Source attribution shown beneath the panel. */
  readonly sourceLabel: string;
  /**
   * Illustration asset for this frame. Square (1000x1000) PNG with a
   * transparent background, sat on a light backing panel by the consuming
   * component so the dark line-art stays legible in dark mode.
   */
  readonly image: string;
}

export const TIMELINE_FRAMES: readonly TimelineFrame[] = [
  {
    id: "frame-trimester-1",
    startDay: 0,
    endDayExclusive: 91,
    railLabel: "Trimester 1",
    title: "Fondasi mulai terbentuk",
    sizeAnalogy: "Sebesar jeruk nipis",
    body: "Otak dan organ vital mulai terbentuk. Pada akhir bulan ketiga, panjang janin sekitar 10 cm dengan berat sekitar 28 gram, kira-kira sebesar jeruk nipis.",
    actions: [
      "Periksa kehamilan minimal 1 kali pada trimester ini",
      "Mulai minum tablet tambah darah setiap hari",
      "Hindari rokok, alkohol, dan obat tanpa resep dokter",
    ],
    sourceLabel: "Buku KIA 2024, hal. 4–7",
    image: "/edukasi/1000 hari - 1.png",
  },
  {
    id: "frame-trimester-2",
    startDay: 91,
    endDayExclusive: 181,
    railLabel: "Trimester 2",
    title: "Organ berkembang",
    sizeAnalogy: "Sebesar jagung",
    body: "Fungsi organ janin terus berkembang. Sekitar bulan kelima, ibu biasanya mulai merasakan gerakan bayi. Kenaikan berat badan selama periode ini umumnya sekitar 4 sampai 8 kg.",
    actions: [
      "Periksa kehamilan minimal 2 kali pada trimester ini",
      "Lanjutkan tablet tambah darah dan penuhi gizi seimbang",
      "Ikuti kelas ibu hamil jika tersedia di posyandu atau puskesmas",
    ],
    sourceLabel: "Buku KIA 2024, hal. 16",
    image: "/edukasi/1000 hari - 2.png",
  },
  {
    id: "frame-trimester-3",
    startDay: 181,
    endDayExclusive: 271,
    railLabel: "Trimester 3",
    title: "Siap lahir",
    sizeAnalogy: "Sebesar semangka",
    body: "Menjelang lahir, berat bayi diharapkan berada di kisaran 2.500 sampai 3.999 gram dengan panjang minimal 48 cm. Pemeriksaan kehamilan menjadi lebih sering untuk memantau kesiapan ibu dan bayi.",
    actions: [
      "Periksa kehamilan minimal 3 kali, termasuk 1 kali dengan dokter dan USG",
      "Skrining preeklampsia dan pemeriksaan posisi janin",
      "Siapkan rencana persalinan dan tas bersalin",
    ],
    sourceLabel: "Buku KIA 2024, hal. 17",
    image: "/edukasi/1000 hari - 3.png",
  },
  {
    id: "frame-0-6-months",
    startDay: 271,
    endDayExclusive: 451,
    railLabel: "0–6 bulan",
    title: "ASI eksklusif",
    sizeAnalogy: "LAMBUNG BAYI TUMBUH DARI SEKECIL KELERENG",
    body: "Mulai dengan Inisiasi Menyusu Dini dalam 1 jam pertama setelah lahir. Berikan ASI saja, tanpa air, madu, atau makanan lain. Bayi biasanya menyusu 8 sampai 12 kali per hari.",
    actions: [
      "Berikan ASI eksklusif sesuai kebutuhan bayi",
      "Mulai imunisasi dasar sesuai jadwal",
      "Lakukan pemeriksaan bayi baru lahir sesuai anjuran tenaga kesehatan",
    ],
    sourceLabel: "Buku KIA 2024, hal. 38–48",
    image: "/edukasi/1000 hari - 4.png",
  },
  {
    id: "frame-6-12-months",
    startDay: 451,
    endDayExclusive: 731,
    railLabel: "6–12 bulan",
    title: "Mulai MPASI",
    sizeAnalogy: "MULAI DUDUK, MERANGKAK, DAN MAKIN AKTIF",
    body: "Bayi mulai mendapat MPASI yang bergizi, terutama sumber protein hewani seperti daging, telur, dan ikan. ASI tetap dilanjutkan. Lengkapi imunisasi dasar dan berikan kapsul vitamin A biru sesuai jadwal.",
    actions: [
      "Berikan MPASI bergizi dengan tekstur sesuai usia",
      "Lanjutkan ASI hingga usia 2 tahun atau lebih",
      "Lakukan pemeriksaan kesehatan anak pada usia 6 sampai 7 bulan",
    ],
    sourceLabel: "Buku KIA 2024, hal. 56–62",
    image: "/edukasi/1000 hari - 5.png",
  },
  {
    id: "frame-12-24-months",
    startDay: 731,
    endDayExclusive: 1001,
    railLabel: "12–24 bulan",
    title: "Masa rawan stunting",
    sizeAnalogy: "MULAI BERJALAN DAN MAKAN MENU KELUARGA",
    body: "Usia 12 sampai 24 bulan merupakan masa yang rawan terhadap stunting. Karena itu, pertumbuhan anak perlu dipantau rutin di posyandu.",
    actions: [
      "Timbang berat badan dan ukur tinggi badan setiap bulan di posyandu",
      "Berikan kapsul vitamin A merah 2 kali setahun",
      "Berikan obat cacing 2 kali setahun sesuai anjuran dan lengkapi imunisasi lanjutan",
    ],
    sourceLabel: "Buku KIA 2024, hal. 64–70",
    image: "/edukasi/1000 hari - 6.png",
  },
] as const;

export const TIMELINE_TOTAL_DAYS = 1000;

/**
 * Resolve the active frame for a given day count. Returns the last frame
 * if the count exceeds the timeline so the final state stays sticky.
 *
 * The cast away from `TimelineFrame | undefined` is sound because
 * `TIMELINE_FRAMES` is a non-empty literal tuple defined in this file —
 * the last index always resolves. We keep the type narrow at the
 * boundary so callers do not need to null-check.
 */
export function resolveTimelineFrame(day: number): TimelineFrame {
  const clamped = Math.max(0, Math.min(TIMELINE_TOTAL_DAYS, day));
  const match = TIMELINE_FRAMES.find(
    (frame) => clamped >= frame.startDay && clamped < frame.endDayExclusive,
  );
  if (match) return match;
  const last = TIMELINE_FRAMES[TIMELINE_FRAMES.length - 1];
  if (!last) {
    throw new Error("TIMELINE_FRAMES is unexpectedly empty");
  }
  return last;
}
