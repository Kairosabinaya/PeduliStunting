/**
 * Footnotes registry. Every superscript reference rendered on /edukasi
 * points to an id from this array. The id format is contracted (project guidelines
 * "Constants live in exactly one file per category") so external tools and
 * STATE.md can refer to them stably.
 *
 * The order in the array determines the rendered order in the
 * `<FootnoteList>` at the bottom of the page; it is also the numbering
 * users see in superscripts. Reordering or removing an entry is a
 * user-visible change.
 */

export interface EdukasiFootnote {
  /**
   * Stable identifier. Format: `fn-<slug>` where `<slug>` is descriptive,
   * because numeric ids would shift any time an entry is added in the
   * middle. The displayed superscript number is derived from the array
   * index at render time.
   */
  readonly id: string;
  /** Short label rendered in bold in the list (e.g. "SSGI 2024"). */
  readonly label: string;
  /** One- to two-sentence note explaining what is being cited. */
  readonly note: string;
  /** Optional canonical URL to the primary source. */
  readonly sourceUrl?: string;
}

export const EDUKASI_FOOTNOTES: readonly EdukasiFootnote[] = [
  {
    id: "fn-prevalence",
    label: "SSGI 2024",
    note: "Survei Status Gizi Indonesia 2024, dirilis Kementerian Kesehatan RI Mei 2025. Prevalensi stunting nasional 19,8%, setara 4.482.340 balita.",
    sourceUrl:
      "https://kemkes.go.id/id/ssgi-2024-prevalensi-stunting-nasional-turun-menjadi-198",
  },
  {
    id: "fn-rpjmn",
    label: "RPJMN 2025–2029",
    note: "Target penurunan stunting menjadi 14,2% pada 2029, dengan baseline 21,5% di 2023. Visi jangka panjang menetapkan 5,0% di 2045 dalam dokumen Indonesia Emas.",
  },
  {
    id: "fn-brain-window",
    label: "Buku KIA 2024, hal. 4",
    note: "Perkembangan otak anak mencapai 25% saat lahir, 70% pada usia 0–1 tahun, dan 85% pada usia 1–3 tahun.",
  },
  {
    id: "fn-unicef-neurons",
    label: "UNICEF Early Moments Matter",
    note: "Pada tahun-tahun pertama kehidupan, neuron di otak bayi membentuk koneksi baru dengan kecepatan 700–1.000 per detik.",
  },
  {
    id: "fn-who-framework",
    label: "WHO Conceptual Framework on Childhood Stunting",
    note: "Stewart CP, Iannotti L, Dewey KG, Michaelsen KF, Onyango AW. Maternal & Child Nutrition, 2013. Kerangka determinan stunting multilevel yang dipakai sebagai dasar narasi ACT 4.",
  },
  {
    id: "fn-kia-12-24",
    label: "Buku KIA 2024, hal. 65",
    note: "Stunting paling banyak terjadi pada kelompok usia 12–24 bulan; pemantauan rutin di posyandu sangat krusial di rentang ini.",
  },
  {
    id: "fn-imd",
    label: "Buku KIA 2024, hal. 25",
    note: "Inisiasi Menyusu Dini dilakukan dalam 1 jam pertama setelah kelahiran melalui kontak kulit ke kulit selama 1 jam.",
  },
  {
    id: "fn-mpasi",
    label: "Buku KIA 2024, hal. 56–57",
    note: "MPASI harus kaya protein hewani — daging, telur, ikan — karena mengandung asam amino esensial untuk pertumbuhan otak dan tubuh.",
  },
  {
    id: "fn-gawai",
    label: "Buku KIA 2024, hal. 49",
    note: "Anak di bawah 18 bulan tidak dianjurkan menggunakan gawai, kecuali untuk video call yang didampingi orang tua.",
  },
  {
    id: "fn-beal-2018",
    label: "Beal et al., 2018",
    note: "Beal T, Tumilowicz A, Sutrisna A, Izwardy D, Neufeld LM. A review of child stunting determinants in Indonesia. Maternal & Child Nutrition, 2018. Mengidentifikasi pendidikan ibu rendah dan tidak ASI eksklusif sebagai determinan paling konsisten.",
  },
  {
    id: "fn-cameron-2016",
    label: "Cameron, Shah, Olivia, 2016",
    note: "Cameron L, Shah M, Olivia S. Sanitation, water, and stunting in Indonesia. BMC Public Health, 2016. Kombinasi jamban tidak layak + air minum tidak diolah meningkatkan risiko stunting secara signifikan.",
  },
] as const;

/**
 * Quick lookup from id to entry — kept as a frozen Record so consumers
 * cannot mutate it accidentally. Throws nothing on miss; callers must
 * guard. The index is rebuilt at module init only.
 */
export const EDUKASI_FOOTNOTE_INDEX: Readonly<Record<string, EdukasiFootnote>> =
  Object.freeze(
    Object.fromEntries(EDUKASI_FOOTNOTES.map((entry) => [entry.id, entry])),
  );

/**
 * Return the 1-based display number for a given footnote id. Returns
 * `null` if the id is unknown so callers can decide whether to crash or
 * fall back to text. The display number is derived from array order so
 * inserting a footnote in the middle automatically renumbers everything
 * downstream — that is intentional.
 */
export function getEdukasiFootnoteNumber(id: string): number | null {
  const index = EDUKASI_FOOTNOTES.findIndex((entry) => entry.id === id);
  return index === -1 ? null : index + 1;
}
