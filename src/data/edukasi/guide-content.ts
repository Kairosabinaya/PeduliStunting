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
    headline: "Pencegahan dimulai sejak kehamilan.",
    lead: "Pencegahan stunting dimulai sebelum bayi lahir. Gizi ibu, pemeriksaan rutin, dan kebiasaan sehari-hari selama hamil membantu mendukung pertumbuhan bayi sejak dalam kandungan.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "Berat badan naik sesuai status gizi awal",
          "Trimester 1: mual, mudah lelah, dan rentan keguguran",
          "Trimester 2: gerakan bayi mulai terasa sekitar bulan kelima",
          "Trimester 3: mudah lelah, sulit tidur, dan lebih sering buang air kecil",
          "Ukuran janin berkembang dari kira-kira sebesar jeruk nipis, jagung, hingga semangka",
        ],
      },
      {
        heading: "Yang dilakukan",
        items: [
          "Periksa kehamilan minimal 6 kali ke fasilitas kesehatan",
          "Minum TTD atau multivitamin harian sesuai anjuran",
          "Penuhi gizi harian dengan 3 kali makan utama dan 2 kali selingan",
          "Ikuti kelas ibu hamil jika tersedia",
          "Lakukan USG minimal 2 kali",
          "Lengkapi imunisasi tetanus sesuai jadwal",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Rokok dan paparan asap rokok",
          "Alkohol, soda, kopi, atau teh berlebihan",
          "Obat tanpa resep dokter",
          "Stres berlebihan dan aktivitas terlalu berat",
          "Tidur telentang terlalu lama pada trimester 2 dan 3",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "Mendukung bayi lahir cukup bulan",
          "Membantu bayi lahir dengan berat dan panjang yang sehat",
          "Mengurangi risiko komplikasi kehamilan",
          "Pencegahan stunting dimulai sejak dalam kandungan",
        ],
      },
    ],
    callouts: [
      {
        tone: "warning",
        title: "Tanda bahaya trimester 1",
        body: "Demam tinggi, mual muntah berat, perdarahan, nyeri perut hebat, batuk lama lebih dari 2 minggu, diare berulang, atau cemas berlebihan. Segera periksa ke fasilitas kesehatan.",
      },
      {
        tone: "success",
        title: "Layanan gratis",
        body: "Pemeriksaan kehamilan, TTD dan multivitamin, pemeriksaan status gizi, laboratorium, USG 2 kali, tekanan darah, skrining kesehatan jiwa, imunisasi tetanus, dan kelas ibu hamil.",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 4–17",
  },
  {
    id: "bayi-0-6",
    label: "0–6 bulan",
    subLabel: "ASI eksklusif",
    headline: "ASI saja sudah cukup.",
    lead: "Berikan hanya ASI sampai usia 6 bulan. Tidak perlu menambahkan air, madu, makanan, atau minuman lain, kecuali atas anjuran tenaga kesehatan.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "Lambung bayi masih sangat kecil dan tumbuh bertahap",
          "Bayi menyusu sekitar 8 sampai 12 kali sehari pada bulan pertama",
          "Tidur sekitar 12 sampai 16 jam per hari",
          "Berat badan naik bertahap jika ASI cukup",
        ],
      },
      {
        heading: "Yang dilakukan",
        items: [
          "Lakukan IMD dalam 1 jam pertama",
          "Susui bayi sesuai kebutuhan",
          "Hindari botol dan dot jika tidak diperlukan",
          "Lakukan pemeriksaan bayi baru lahir sesuai jadwal",
          "Lengkapi skrining dan imunisasi dasar awal",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Air putih, madu, teh, susu formula, atau makanan lain sebelum 6 bulan",
          "Membuang kolostrum atau ASI pertama",
          "Membungkus bayi terlalu tebal",
          "Memberikan gawai kepada bayi",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "ASI mengandung antibodi yang tidak ada pada susu formula",
          "Membantu mencegah diare, ISPA, dan stunting",
          "Menguatkan ikatan ibu dan bayi",
          "Lambung bayi masih kecil, sehingga ASI sudah mencukupi kebutuhannya",
        ],
      },
    ],
    callouts: [
      {
        tone: "info",
        title: "Inisiasi Menyusu Dini",
        body: "Bayi baru lahir sebaiknya mendapat IMD melalui kontak kulit ke kulit dalam 1 jam pertama setelah lahir. Proses ini membantu merangsang produksi ASI dan memperkuat ikatan ibu dengan bayi.",
      },
      {
        tone: "warning",
        title: "Tanda bahaya 0 sampai 28 hari",
        body: "Segera periksa ke tenaga kesehatan jika bayi sesak napas, sangat lemah, sulit menyusu, demam, suhu tubuh terlalu rendah, kejang, muntah hijau, kuning, tali pusat bernanah, atau tampak pucat.",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 25, 38–48",
  },
  {
    id: "bayi-6-12",
    label: "6–12 bulan",
    subLabel: "MPASI dimulai",
    headline: "MPASI kaya protein hewani.",
    lead: "Mulai MPASI tepat di usia 6 bulan dengan tekstur yang sesuai. Utamakan protein hewani seperti daging, telur, dan ikan. ASI tetap dilanjutkan.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "Mulai duduk, merangkak, lalu berdiri berpegangan",
          "Gigi pertama mulai tumbuh sekitar usia 6 bulan",
          "Bayi mulai mengeksplorasi benda lewat mulut",
          "Berat badan bertambah secara bertahap",
        ],
      },
      {
        heading: "Yang dilakukan",
        items: [
          "Mulai MPASI tepat waktu pada usia 6 bulan",
          "Berikan makanan yang cukup dari sisi jumlah, frekuensi, tekstur, dan variasi",
          "Jaga kebersihan tangan dan alat makan",
          "Utamakan protein hewani dalam menu harian",
          "Lanjutkan ASI hingga usia 2 tahun atau lebih",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Makanan tinggi gula, garam, dan MSG",
          "Susu rendah lemak",
          "Soda dan minuman kemasan",
          "Makanan instan kemasan",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "Protein hewani membantu memenuhi kebutuhan asam amino esensial",
          "Otak membutuhkan lemak dan zat besi untuk berkembang",
          "Sebagian besar kebutuhan gizi mulai dipenuhi dari MPASI di akhir periode ini",
          "Imunisasi dasar lengkap membantu mencegah infeksi",
        ],
      },
    ],
    callouts: [
      {
        tone: "info",
        title: "Tekstur MPASI",
        body: "Mulai dari makanan lumat dan kental, lalu naik bertahap menjadi cincang, kasar, dan makanan keluarga sesuai usia. Jumlah dan frekuensi makan juga bertambah seiring pertumbuhan bayi.",
      },
      {
        tone: "success",
        title: "Pemeriksaan terjadwal",
        body: "Pantau pertumbuhan di posyandu setiap bulan. Lakukan pemeriksaan kesehatan anak pada usia 6 sampai 7 bulan dan lengkapi vitamin A serta imunisasi sesuai jadwal.",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 56–62",
  },
  {
    id: "balita-12-24",
    label: "12–24 bulan",
    subLabel: "Paling rawan stunting",
    headline: "Masa rawan stunting, jangan lengah.",
    lead: "Pada usia 12 sampai 24 bulan, risiko stunting perlu dipantau lebih serius. Karena itu, pertumbuhan anak sebaiknya dicek rutin di posyandu setiap bulan.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "Mulai berjalan, berlari, dan naik tangga dengan pegangan",
          "Kosakata bertambah cepat",
          "Mulai makan makanan keluarga dengan porsi anak",
          "Tidur sekitar 11 sampai 14 jam per hari, termasuk tidur siang",
        ],
      },
      {
        heading: "Yang dilakukan",
        items: [
          "Timbang berat badan dan ukur tinggi badan setiap bulan di posyandu",
          "Berikan MPASI kaya protein hewani dengan porsi yang makin bertambah",
          "Lanjutkan ASI hingga usia 2 tahun atau lebih",
          "Lengkapi imunisasi lanjutan sesuai jadwal",
          "Berikan vitamin A dan obat cacing sesuai anjuran",
          "Pantau lingkar lengan atas jika tersedia",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Soda dan minuman kemasan tinggi gula",
          "Makanan terlalu asam atau pedas",
          "Susu atau yoghurt rendah lemak",
          "Makanan tinggi MSG atau pengawet",
          "Gawai tanpa pendampingan",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "Risiko stunting tinggi pada periode ini",
          "Kemampuan kognitif dan motorik berkembang cepat",
          "Pola makan anak mulai terbentuk",
          "Imunisasi lanjutan membantu menutup celah risiko infeksi",
        ],
      },
    ],
    callouts: [
      {
        tone: "info",
        title: "Pola asuh 1,5 sampai 3 tahun",
        body: "Hargai kemampuan anak, dorong anak aktif bergerak, ajak berbicara dengan kalimat pendek, latih sopan santun sederhana, dan dampingi penggunaan gawai.",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 64–70",
  },
  {
    id: "balita-2-6",
    label: "2–6 tahun",
    subLabel: "Lanjutkan kebiasaan baik",
    headline: "Fondasi tumbuh kembang tetap dijaga.",
    lead: "Setelah 1.000 hari pertama, pertumbuhan anak tetap perlu dijaga melalui gizi seimbang, pola hidup bersih, tidur cukup, dan stimulasi yang sesuai usia.",
    columns: [
      {
        heading: "Yang dialami",
        items: [
          "Makan utama 3 kali sehari bersama keluarga",
          "Tidur sekitar 10 sampai 13 jam per hari",
          "Bermain aktif dan mulai bersosialisasi",
          "Mulai mandiri, seperti makan dan toilet sendiri",
        ],
      },
      {
        heading: "Yang dilakukan",
        items: [
          "Penuhi kebutuhan cairan setiap hari",
          "Cuci tangan pakai sabun pada momen penting",
          "Sikat gigi setelah sarapan dan sebelum tidur",
          "Berikan vitamin A dan obat cacing sesuai jadwal",
          "Berikan oralit dan zinc saat diare sesuai anjuran",
          "Periksa gigi setiap 3 sampai 6 bulan",
        ],
      },
      {
        heading: "Yang dihindari",
        items: [
          "Makanan terlalu manis, asin, atau berlemak",
          "Soda dan minuman kemasan tinggi gula",
          "Layar tanpa pendampingan",
          "Tidur terlalu larut secara terus-menerus",
        ],
      },
      {
        heading: "Mengapa penting",
        items: [
          "Kebiasaan baik mulai menetap sejak usia ini",
          "Anak bersiap masuk PAUD atau TK",
          "Sistem imun berkembang melalui aktivitas dan sosialisasi",
          "Pertumbuhan tetap perlu dipantau meski sudah lewat 1.000 hari pertama",
        ],
      },
    ],
    callouts: [
      {
        tone: "info",
        title: "Gawai 2 sampai 5 tahun",
        body: "Batasi penggunaan gawai maksimal 1 jam per hari, pilih konten berkualitas, dan selalu dampingi anak. Gawai tidak menggantikan interaksi langsung dengan orang tua.",
      },
    ],
    sourceLabel: "Buku KIA 2024, hal. 71–87",
  },
] as const;
