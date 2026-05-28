/**
 * ACT 6 — Panduan praktis per usia. Setiap tab adalah satu fase Buku KIA
 * 2024 yang penting untuk pencegahan stunting. Konten ringkas tapi dense:
 * "yang dialami / yang dilakukan / yang dihindari / mengapa penting".
 *
 * Sumber halaman KIA dicantumkan per tab. Saat 16 artikel library lama
 * di-drop di Phase 1, kontennya dikondensasi ke struktur ini sebagai
 * data statis — tetap dapat di-update tanpa migrasi DB.
 */

export interface GuideCallout {
  /** Tone preset for callout chrome. */
  readonly tone: "warning" | "success" | "info";
  /** Headline of the callout. */
  readonly title: string;
  /** Body text. */
  readonly body: string;
}

export interface GuideColumn {
  /** Column heading. */
  readonly heading: string;
  /** Bullet list. */
  readonly items: readonly string[];
}

export interface GuideTab {
  /** Stable id used as anchor + tab key (e.g. `kehamilan`). */
  readonly id: string;
  /** Short label shown on the tab trigger. */
  readonly label: string;
  /** Sub-label rendered under the label (e.g. "270 hari"). */
  readonly subLabel: string;
  /** Section headline rendered when the tab is active. */
  readonly headline: string;
  /** Lead paragraph. */
  readonly lead: string;
  /** Four columns of structured advice. */
  readonly columns: readonly [
    GuideColumn,
    GuideColumn,
    GuideColumn,
    GuideColumn,
  ];
  /** Optional list of callouts rendered above the columns. */
  readonly callouts: readonly GuideCallout[];
  /** Source label rendered at the bottom of the tab content. */
  readonly sourceLabel: string;
}

export const GUIDE_TABS: readonly GuideTab[] = [
  {
    id: "kehamilan",
    label: "Kehamilan",
    subLabel: "270 hari",
    headline: "Masa keemasan seorang ibu.",
    lead: "Pencegahan stunting dimulai sebelum bayi lahir. Gizi, periksa rutin, dan kebiasaan harian ibu menentukan berat & panjang bayi saat lahir.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "Naik berat 5–18 kg sesuai status gizi awal",
          "Trimester 1: mual, mudah lelah, rentan keguguran",
          "Trimester 2: gerak bayi terasa di ±5 bulan",
          "Trimester 3: lelah, sulit tidur, sering BAK (buang air kecil)",
          "Janin: jeruk nipis → jagung → semangka",
        ],
      },
      {
        heading: "Yang dilakukan",
        items: [
          "Periksa kehamilan minimal 6× ke faskes (ANC/Antenatal Care)",
          "TTD (Tablet Tambah Darah) atau multivitamin harian — mencegah anemia",
          "Porsi gizi lebih: 3× makan utama + 2× selingan",
          "Ikuti Kelas Ibu Hamil",
          "USG minimal 2× (T1 & T3)",
          "Imunisasi Tetanus sesuai jadwal",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Rokok dan paparan asap rokok",
          "Alkohol, soda, kopi/teh berlebihan",
          "Obat tanpa resep dokter",
          "Stres berlebihan & aktivitas terlalu berat",
          "Tidur telentang lama di T2–T3",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "Bayi lahir cukup bulan (38–40 minggu)",
          "Berat lahir ≥ 2.500 g, panjang ≥ 48 cm",
          "Mencegah komplikasi kehamilan",
          "Pencegahan stunting dimulai dari rahim",
        ],
      },
    ],
    callouts: [
      {
        tone: "warning",
        title: "Tanda bahaya trimester 1",
        body: "Demam tinggi, mual-muntah hebat, perdarahan, nyeri perut hebat, batuk lama >2 minggu, diare berulang, atau kecemasan berlebihan — segera ke faskes.",
      },
      {
        tone: "success",
        title: "Layanan gratis",
        body: "Pemeriksaan kehamilan, TTD + multivitamin, status gizi, lab, USG 2×, tekanan darah, skrining jiwa, imunisasi tetanus, Kelas Ibu Hamil.",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 4–17",
  },
  {
    id: "bayi-0-6",
    label: "0–6 bulan",
    subLabel: "ASI eksklusif",
    headline: "ASI saja — itu sudah cukup.",
    lead: "Berikan hanya ASI sampai usia 6 bulan. Jangan tambahkan air, makanan, atau minuman lain — kecuali atas anjuran tenaga kesehatan.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "Lambung tumbuh: kelereng → bola pingpong → telur ayam → telur bebek",
          "Frekuensi menyusu: 5–12× hari 1 → 8–12× setelah 1 bulan",
          "Tidur 12–16 jam/hari (termasuk siang)",
          "Berat naik konsisten bila ASI cukup",
        ],
      },
      {
        heading: "Yang dilakukan",
        items: [
          "Inisiasi Menyusu Dini (IMD) dalam 1 jam pertama",
          "Susui semau bayi; hindari botol & dot",
          "Pemeriksaan: 0–6 jam, 6–48 jam, 3–7 hari, 8–28 hari",
          "SHK (Skrining Hipotiroid Kongenital) 48–72 jam",
          "Skrining Penyakit Jantung Bawaan 24–48 jam",
          "Imunisasi: HB0 < 24 jam, BCG + OPV1 di 1 bulan",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Air putih, madu, teh, susu formula sebelum 6 bulan",
          "Membuang kolostrum (ASI pertama)",
          "Membungkus bayi terlalu tebal",
          "Penggunaan gawai — bahkan satu kali",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "ASI mengandung antibodi yang tidak ada di susu formula",
          "Mencegah diare, ISPA, dan stunting",
          "Menstimulasi ikatan ibu–bayi",
          "Lambung bayi sangat kecil — ASI cukup",
        ],
      },
    ],
    callouts: [
      {
        tone: "info",
        title: "Inisiasi Menyusu Dini (IMD)",
        body: "Bayi baru lahir wajib mendapat IMD via kontak kulit ke kulit dalam 1 jam pertama, selama 1 jam. Menstimulasi produksi ASI, melepas plasenta, mengurangi pendarahan ibu.",
      },
      {
        tone: "warning",
        title: "Tanda bahaya 0–28 hari",
        body: "Sesak napas (<40 atau >60×/menit), aktivitas lemah, kulit biru di sekitar mulut, muntah hijau, kencing <6×/hari, kejang, suhu >38,5°C atau <36,5°C, tali pusat bernanah, kuning, atau tinja pucat.",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 25, 38–48",
  },
  {
    id: "bayi-6-12",
    label: "6–12 bulan",
    subLabel: "MPASI dimulai",
    headline: "MPASI kaya protein hewani.",
    lead: "Mulai MPASI (Makanan Pendamping ASI) tepat di usia 6 bulan dengan tekstur sesuai usia. Prioritaskan protein hewani: daging, telur, ikan. ASI lanjut.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "Mulai duduk, merangkak, lalu berdiri berpegangan",
          "Tumbuh gigi pertama (±6 bulan)",
          "Eksplorasi lewat mulut — semua benda dicicipi",
          "Berat naik ±0,5 kg/bulan",
        ],
      },
      {
        heading: "Yang dilakukan (MPASI)",
        items: [
          "Tepat waktu — mulai usia 6 bulan",
          "Cukup — jumlah, frekuensi, tekstur, variasi sesuai",
          "Aman — cuci tangan + peralatan bersih",
          "Diberikan dengan benar — max 30 menit, lingkungan netral",
          "8 grup: ASI, makanan pokok, kacang, susu, daging, telur, sayur/buah vit-A, sayur/buah lain",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Makanan tinggi gula, garam, MSG",
          "Susu rendah lemak (lemak masih dibutuhkan)",
          "Soda dan minuman kemasan",
          "Makanan instan kemasan",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "Protein hewani membawa asam amino esensial",
          "Otak butuh lemak + zat besi untuk berkembang",
          "70% gizi sudah dari MPASI di akhir periode ini",
          "Imunisasi dasar lengkap mencegah infeksi",
        ],
      },
    ],
    callouts: [
      {
        tone: "info",
        title: "Tekstur MPASI",
        body: "6–8 bulan: disaring (lumat & kental), 2–3 sdm → ½ mangkok 125 ml, 2–3× utama + 1× selingan. 9–11 bulan: dicincang, ½–¾ mangkok, 3–4× + 1–2×. 12–23 bulan: iris-iris, ¾–1 mangkok 250 ml, 3–4× + 1–2×.",
      },
      {
        tone: "success",
        title: "Pemeriksaan terjadwal",
        body: "Cek perkembangan tiap bulan di posyandu, Pemeriksaan Kesehatan Anak Terintegrasi (PKAT) di usia 6–7 bulan, Vitamin A kapsul biru 1× setahun (Februari atau Agustus).",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 56–62",
  },
  {
    id: "balita-12-24",
    label: "12–24 bulan",
    subLabel: "Paling rawan stunting",
    headline: "Periode paling rawan — jangan lengah.",
    lead: "Buku KIA 2024 mencatat stunting paling banyak terjadi di kelompok usia 12–24 bulan. Pemantauan rutin di posyandu sangat krusial.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "Berjalan, lari, naik tangga dengan pegangan",
          "Kosakata bertambah cepat (≥ 10 kata di 18 bln)",
          "Makan makanan keluarga dengan porsi anak",
          "Tidur 11–14 jam/hari (termasuk siang)",
        ],
      },
      {
        heading: "Yang dilakukan",
        items: [
          "Timbang + ukur tiap bulan di posyandu",
          "MPASI kaya protein hewani — porsi semakin besar",
          "ASI lanjut hingga 2 tahun (≈ 30% gizi)",
          "Imunisasi lanjutan: DPT-HB-Hib 4 + MR 2 di 18 bln",
          "Vitamin A kapsul merah 2×/tahun (Feb & Agt)",
          "Obat cacing 2×/tahun",
          "Pengukuran LiLA (Lingkar Lengan Atas): <11,5 cm buruk, 11,5–12,4 cm kurang, ≥12,4 cm baik",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Soda dan minuman kemasan tinggi gula",
          "Makanan terlalu asam / pedas",
          "Susu/yogurt rendah lemak",
          "Makanan banyak MSG/pengawet",
          "Gawai sendirian tanpa pendampingan",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "Risiko stunting puncak di periode ini",
          "Kemampuan kognitif & motorik dibentuk cepat",
          "Pola makan dewasa mulai terbentuk",
          "Imunisasi lanjutan menutup celah infeksi",
        ],
      },
    ],
    callouts: [
      {
        tone: "info",
        title: "Pola asuh 1,5–3 tahun",
        body: "Hargai kemampuan anak, dorong gerak bebas, ajak bicara dengan kalimat pendek penuh arti, dorong bermain bersama anak lain, latih sopan santun sederhana. Gawai 18–24 bln: max 1 jam/hari + selalu didampingi.",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 64–70",
  },
  {
    id: "balita-2-6",
    label: "2–6 tahun",
    subLabel: "Lanjutkan kebiasaan baik",
    headline: "Pra-sekolah — fondasi dirawat.",
    lead: "Fondasi sudah dibangun. Sekarang dirawat dengan pola hidup bersih, gizi seimbang, dan stimulasi yang tepat.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "3× makan utama bersama keluarga",
          "Tidur 10–13 jam/hari",
          "Bermain aktif + mulai sosialisasi",
          "Mulai mandiri (toilet, makan sendiri)",
        ],
      },
      {
        heading: "Yang dilakukan",
        items: [
          "Minum ≥ 5–7 gelas air/hari",
          "Cuci tangan dengan sabun di 7 momen kritis",
          "Sikat gigi setelah sarapan & sebelum tidur",
          "Vitamin A merah + obat cacing 2×/tahun",
          "Cegah dehidrasi saat diare: oralit + zinc 10 hari",
          "Pemeriksaan gigi tiap 3–6 bulan",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Makanan terlalu manis, asin, atau berlemak",
          "Soda dan kemasan tinggi gula",
          "Layar tanpa pendampingan",
          "Tidur larut malam berkepanjangan",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "Kebiasaan baik di usia ini menetap seumur hidup",
          "Kesiapan masuk PAUD/TK",
          "Sistem imun matang melalui sosialisasi",
          "Pertumbuhan tetap dipantau, walau di luar jendela 1.000 HPK",
        ],
      },
    ],
    callouts: [
      {
        tone: "info",
        title: "Gawai 2–5 tahun",
        body: "Maksimal 1 jam/hari, didampingi orang tua, dengan konten berkualitas. Bukan pengganti pendampingan langsung.",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 71–87",
  },
] as const;
