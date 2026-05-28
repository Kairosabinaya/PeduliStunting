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
}

export const TIMELINE_FRAMES: readonly TimelineFrame[] = [
  {
    id: "frame-trimester-1",
    startDay: 0,
    endDayExclusive: 91,
    railLabel: "T1",
    title: "Trimester 1 · Pondasi terbentuk",
    sizeAnalogy: "Sebesar jeruk nipis",
    body: "Otak dan organ vital mulai terbentuk. Di akhir bulan ke-3, panjang janin sekitar 10 cm dengan berat ±28 gram — kira-kira sebesar jeruk nipis.",
    actions: [
      "Periksa kehamilan minimal 1× di trimester ini (ANC/Antenatal Care)",
      "Mulai TTD (Tablet Tambah Darah) harian",
      "Hindari rokok, alkohol, dan obat tanpa resep",
    ],
    sourceLabel: "Buku KIA 2024, hal. 4–7",
  },
  {
    id: "frame-trimester-2",
    startDay: 91,
    endDayExclusive: 181,
    railLabel: "T2",
    title: "Trimester 2 · Organ menyempurna",
    sizeAnalogy: "Sebesar jagung",
    body: "Fungsi organ berkembang dan ibu mulai merasakan gerakan bayi sekitar bulan ke-5. Naik berat 4–8 kg total di periode ini.",
    actions: [
      "ANC minimal 2× di trimester ini",
      "Lanjutkan TTD + porsi gizi seimbang",
      "Ikuti Kelas Ibu Hamil bila tersedia di posyandu",
    ],
    sourceLabel: "Buku KIA 2024, hal. 16",
  },
  {
    id: "frame-trimester-3",
    startDay: 181,
    endDayExclusive: 271,
    railLabel: "T3",
    title: "Trimester 3 · Siap lahir",
    sizeAnalogy: "Sebesar semangka",
    body: "Bayi siap lahir dengan target berat 2.500–3.999 gram dan panjang ≥ 48 cm. ANC menjadi lebih sering untuk memastikan persalinan aman.",
    actions: [
      "Periksa minimal 3× termasuk 1× oleh dokter + USG",
      "Skrining preeklampsia dan posisi janin",
      "Siapkan rencana persalinan + tas bersalin",
    ],
    sourceLabel: "Buku KIA 2024, hal. 17",
  },
  {
    id: "frame-0-6-months",
    startDay: 271,
    endDayExclusive: 451,
    railLabel: "0–6 bln",
    title: "0–6 bulan · ASI eksklusif",
    sizeAnalogy: "Lambung dari kelereng → telur bebek",
    body: "Inisiasi Menyusu Dini (IMD) dalam 1 jam pertama. ASI saja — tanpa air, madu, atau makanan lain. Frekuensi menyusu 8–12 kali per hari.",
    actions: [
      "ASI eksklusif, semau bayi, hindari botol dan dot",
      "Imunisasi dasar dimulai (HB0 < 24 jam, BCG + OPV1 di 1 bulan)",
      "Pemeriksaan rutin: 0–6 jam, 6–48 jam, 3–7 hari, 8–28 hari",
    ],
    sourceLabel: "Buku KIA 2024, hal. 38–48",
  },
  {
    id: "frame-6-12-months",
    startDay: 451,
    endDayExclusive: 731,
    railLabel: "6–12 bln",
    title: "6–12 bulan · MPASI mulai",
    sizeAnalogy: "Tumbuh aktif, mulai duduk + merangkak",
    body: "Mulai MPASI kaya protein hewani — daging, telur, ikan. ASI tetap lanjut. Imunisasi dasar lengkap dan Vitamin A kapsul biru.",
    actions: [
      "MPASI (Makanan Pendamping ASI) 8 grup makanan, tekstur sesuai usia",
      "ASI dilanjutkan hingga 2 tahun",
      "PKAT (Pemeriksaan Kesehatan Anak Terintegrasi) di usia 6–7 bulan",
    ],
    sourceLabel: "Buku KIA 2024, hal. 56–62",
  },
  {
    id: "frame-12-24-months",
    startDay: 731,
    endDayExclusive: 1001,
    railLabel: "12–24 bln",
    title: "12–24 bulan · Periode paling rawan",
    sizeAnalogy: "Toddler berjalan, makan makanan keluarga",
    body: "Kelompok usia 12–24 bulan adalah periode paling rawan stunting. Pemantauan rutin di posyandu sangat krusial di rentang ini.",
    actions: [
      "Timbang + ukur tiap bulan di posyandu",
      "Vitamin A kapsul merah 2×/tahun (Februari + Agustus)",
      "Obat cacing 2×/tahun + imunisasi lanjutan (DPT-HB-Hib 4 & MR 2 di 18 bln)",
    ],
    sourceLabel: "Buku KIA 2024, hal. 64–70",
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
