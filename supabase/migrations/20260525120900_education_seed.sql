-- Seed representative education articles derived from Buku KIA 2024
-- (Kementerian Kesehatan RI). These are stubs that mirror the canonical
-- chapter structure of the book so the /edukasi UI can be exercised without
-- waiting for the full admin authoring workflow.
--
-- All inserts use ON CONFLICT (slug) DO UPDATE so re-running the migration is
-- idempotent and content edits via admin UI are preserved on conflict-free
-- columns.

INSERT INTO public.education_articles
  (slug, title, topic, min_age_months, max_age_months, summary, body_md, source_label, source_url, published_at)
VALUES
  (
    'persiapan-kehamilan-sehat',
    'Persiapan Kehamilan yang Sehat',
    'kehamilan',
    NULL,
    NULL,
    'Langkah-langkah penting yang perlu disiapkan calon orang tua sebelum dan selama kehamilan: pemeriksaan, gizi, dan dukungan keluarga.',
    $$Setiap kehamilan adalah perjalanan unik yang memerlukan persiapan matang. Pastikan calon ibu memeriksakan diri ke fasilitas pelayanan kesehatan minimal 6 kali selama kehamilan, dengan 2 kali pemeriksaan oleh dokter pada trimester pertama dan ketiga.

**Persiapan utama:**

- Konsumsi tablet tambah darah (TTD) setiap hari sejak masa remaja dan ibu hamil.
- Pastikan status imunisasi Tetanus lengkap untuk melindungi ibu dan bayi.
- Penuhi gizi seimbang: karbohidrat, protein hewani, sayur, dan buah setiap kali makan.
- Hindari rokok, alkohol, dan paparan asap rokok pasif.
- Libatkan suami dan keluarga sebagai pendamping siaga.

**Tanda bahaya yang wajib segera diperiksakan:**

- Perdarahan dari jalan lahir.
- Bengkak di kaki, tangan, atau wajah disertai sakit kepala dan kejang.
- Demam tinggi.
- Air ketuban keluar sebelum waktunya.
- Gerakan janin berkurang atau tidak terasa.

Dengan persiapan yang baik, risiko komplikasi kehamilan dan stunting pada anak dapat ditekan secara signifikan.$$,
    'Buku KIA 2024 hal. 4-10',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '14 days'
  ),
  (
    'tanda-bahaya-kehamilan',
    'Tanda Bahaya Kehamilan yang Wajib Dikenali',
    'kehamilan',
    NULL,
    NULL,
    'Daftar tanda bahaya selama kehamilan yang harus segera dibawa ke fasilitas kesehatan agar nyawa ibu dan bayi terlindungi.',
    $$Mengenali tanda bahaya kehamilan secara dini menyelamatkan nyawa. Segera bawa ibu hamil ke puskesmas atau rumah sakit terdekat bila menemukan salah satu kondisi berikut:

1. **Perdarahan** dari jalan lahir, baik bercak maupun deras.
2. **Bengkak** pada kaki, tangan, atau wajah yang disertai sakit kepala hebat dan/atau kejang (gejala pre-eklampsia).
3. **Demam tinggi** lebih dari 38°C yang tidak turun.
4. **Keluar air-air** dari jalan lahir sebelum waktunya melahirkan.
5. **Janin tidak bergerak** atau gerakannya berkurang dibandingkan hari-hari sebelumnya.
6. **Muntah terus-menerus** sehingga tidak bisa makan atau minum.
7. **Sakit perut hebat** yang tidak hilang dengan istirahat.

Bawa Buku KIA setiap kali memeriksakan diri agar tenaga kesehatan dapat melihat riwayat kehamilan secara utuh.$$,
    'Buku KIA 2024 hal. 11-13',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '13 days'
  ),
  (
    'gizi-seimbang-ibu-hamil',
    'Gizi Seimbang untuk Ibu Hamil',
    'gizi',
    NULL,
    NULL,
    'Panduan praktis menyusun piring gizi seimbang ibu hamil untuk mencegah anemia, BBLR, dan stunting pada anak.',
    $$Kebutuhan energi ibu hamil meningkat 180 kkal pada trimester pertama dan 300 kkal pada trimester berikutnya. Susun "Isi Piringku" setiap kali makan agar gizi seimbang terpenuhi.

**Komposisi piring per kali makan:**

- 1/3 piring karbohidrat (nasi, jagung, ubi, kentang).
- 1/3 piring sayur berwarna-warni.
- 1/6 piring protein hewani (telur, ikan, ayam, daging).
- 1/6 piring buah.

**Wajib setiap hari:**

- 1 tablet tambah darah (TTD) untuk mencegah anemia.
- 8 gelas air putih.
- Aktivitas fisik ringan minimal 30 menit (jalan kaki, senam hamil).

**Hindari** makanan mentah, susu yang belum dipasteurisasi, ikan tinggi merkuri, dan minuman beralkohol. Batasi kafein maksimal 200 mg/hari (sekitar 1 cangkir kopi).$$,
    'Buku KIA 2024 hal. 14-16',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '12 days'
  ),
  (
    'tanda-tanda-persalinan',
    'Tanda-Tanda Persalinan dan Persiapan Melahirkan',
    'persalinan',
    NULL,
    NULL,
    'Mengenali tanda awal persalinan, persiapan tas bersalin, dan keputusan kapan harus ke fasilitas kesehatan.',
    $$Persalinan biasanya dimulai antara minggu ke-37 hingga ke-42 kehamilan. Kenali tanda awal agar persiapan menuju fasilitas kesehatan tidak terlambat.

**Tanda persalinan:**

- **Kontraksi teratur** yang semakin kuat dan rapat (mula-mula 10-15 menit sekali, lalu setiap 5 menit).
- **Keluar lendir bercampur darah** dari jalan lahir.
- **Pecahnya ketuban** ditandai keluarnya air-air bening atau keruh.

**Yang dipersiapkan dalam tas bersalin:**

- Buku KIA, kartu identitas, kartu BPJS.
- 3-4 stel pakaian ibu (longgar, berkancing depan untuk memudahkan menyusui).
- Pakaian bayi: baju, popok, bedong, sarung tangan, kaus kaki, topi.
- Pembalut nifas dan pakaian dalam ibu.
- Air minum, makanan ringan untuk pendamping.

Pilih fasilitas persalinan yang ditolong oleh tenaga kesehatan terlatih (bidan/dokter) di tempat dengan peralatan memadai.$$,
    'Buku KIA 2024 hal. 19-22',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '11 days'
  ),
  (
    'perawatan-ibu-nifas',
    'Perawatan Ibu pada Masa Nifas',
    'nifas',
    NULL,
    NULL,
    'Pemeriksaan nifas, tanda bahaya, dan dukungan psikologis untuk ibu pada 42 hari pertama setelah melahirkan.',
    $$Masa nifas (0-42 hari) menentukan pemulihan fisik dan emosional ibu. Lakukan pemeriksaan nifas minimal 4 kali: 6 jam-3 hari, 4-28 hari, 29-42 hari, dan 1 kali kunjungan dini bersama bayi.

**Yang perlu dilakukan ibu nifas:**

- Istirahat cukup, tidur saat bayi tidur.
- Minum 3-4 liter air putih per hari untuk mendukung produksi ASI.
- Konsumsi tablet tambah darah selama 42 hari pasca-melahirkan.
- Jaga kebersihan area kemaluan; ganti pembalut setiap 4-6 jam.
- Mulai kontrasepsi pasca-persalinan setelah berkonsultasi dengan bidan/dokter.

**Tanda bahaya nifas — segera ke fasilitas kesehatan:**

- Perdarahan banyak atau berbau busuk.
- Demam lebih dari 38°C.
- Sakit kepala hebat, pandangan kabur, kejang.
- Payudara bengkak, merah, dan nyeri hebat.
- Perasaan sangat sedih, putus asa, atau ingin menyakiti diri/bayi (gejala depresi pasca-melahirkan).

Dukungan suami dan keluarga sangat menentukan kesehatan mental ibu di masa ini.$$,
    'Buku KIA 2024 hal. 24-27',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '10 days'
  ),
  (
    'inisiasi-menyusu-dini',
    'Inisiasi Menyusu Dini (IMD) dan ASI Eksklusif',
    'bayi',
    0,
    6,
    'Mengapa IMD selama 1 jam pertama dan ASI eksklusif 6 bulan menjadi pondasi utama pencegahan stunting.',
    $$Segera setelah lahir, letakkan bayi telungkup di dada ibu untuk menyusu sendiri (Inisiasi Menyusu Dini/IMD) selama minimal 1 jam. Kontak kulit-ke-kulit ini meningkatkan keberhasilan menyusui, menstabilkan suhu bayi, dan memperkuat ikatan emosional.

**ASI eksklusif (0-6 bulan):**

- Berikan hanya ASI tanpa tambahan makanan, minuman, atau air putih sekalipun.
- Susui bayi sesuai keinginan (on demand), minimal 8-12 kali sehari.
- ASI mengandung kolostrum (cairan kuning di hari-hari pertama) yang kaya antibodi.
- Posisi menyusui yang benar: kepala dan badan bayi lurus, dagu menempel pada payudara, mulut terbuka lebar, dan bibir bawah terlipat keluar.

**Manfaat ASI eksklusif:**

- Menurunkan risiko stunting, diare, dan infeksi saluran napas.
- Meningkatkan kecerdasan dan perkembangan otak.
- Mengurangi risiko obesitas dan diabetes saat dewasa.
- Hemat biaya dan selalu siap pada suhu yang tepat.

Jika ibu kembali bekerja, perah dan simpan ASI sesuai aturan rantai dingin (ASIP).$$,
    'Buku KIA 2024 hal. 32-35',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '9 days'
  ),
  (
    'merawat-bayi-baru-lahir',
    'Merawat Bayi Baru Lahir',
    'bayi',
    0,
    1,
    'Perawatan tali pusat, menjaga suhu tubuh, tanda bahaya bayi baru lahir, dan kunjungan neonatal.',
    $$Empat minggu pertama (periode neonatal) adalah masa paling rentan bagi bayi. Lakukan kunjungan neonatal minimal 3 kali: hari ke-1 sampai 2, hari ke-3 sampai 7, dan hari ke-8 sampai 28.

**Perawatan harian:**

- **Tali pusat**: jaga tetap bersih dan kering, jangan dibubuhi apapun. Tali pusat biasanya puput dalam 5-7 hari.
- **Suhu tubuh**: jaga bayi tetap hangat dengan pakaian, topi, dan kontak kulit-ke-kulit. Hindari memandikan bayi pada 24 jam pertama.
- **Menyusui**: lanjutkan ASI eksklusif sesering bayi menginginkan.
- **Tidur**: bayi baru lahir tidur 16-18 jam sehari; baringkan telentang untuk mencegah Sudden Infant Death Syndrome (SIDS).

**Tanda bahaya — segera bawa ke fasilitas kesehatan:**

- Tidak mau menyusu atau memuntahkan semua yang diminum.
- Kejang.
- Bernapas cepat (>60 kali/menit), tarikan dinding dada, atau membiru.
- Demam (>37,5°C) atau hipotermia (<36,5°C).
- Kuning sampai ke telapak tangan/kaki.
- Tali pusat kemerahan, bernanah, atau berbau.
- Diare atau tinja berdarah.$$,
    'Buku KIA 2024 hal. 38-41',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '8 days'
  ),
  (
    'mpasi-pertama-6-bulan',
    'MPASI Pertama: Mulai di Usia 6 Bulan',
    'gizi',
    6,
    8,
    'Tanda siap MPASI, prinsip pemberian, dan menu pengenalan tekstur untuk bayi 6-8 bulan.',
    $$Saat bayi genap 6 bulan, ASI saja tidak lagi mencukupi kebutuhan energi, protein, zat besi, dan zinc. Mulai berikan Makanan Pendamping ASI (MPASI) sambil terus menyusui hingga usia 2 tahun.

**Tanda bayi siap MPASI:**

- Mampu menegakkan kepala dengan stabil.
- Sudah bisa duduk dengan sedikit bantuan.
- Menunjukkan ketertarikan terhadap makanan orang dewasa.
- Refleks menjulurkan lidah sudah berkurang.

**Prinsip 4 bintang MPASI:**

1. **Tepat waktu** — mulai usia 6 bulan, tidak terlalu dini atau terlambat.
2. **Adekuat** — cukup energi, protein, dan mikronutrien.
3. **Aman dan higienis** — cuci tangan, peralatan steril, masak matang.
4. **Diberikan dengan benar** — sesuai sinyal lapar/kenyang bayi, responsive feeding.

**Menu awal (6-8 bulan):**

- Tekstur: bubur kental, sayur halus, daging cincang lembut.
- Frekuensi: 2-3 kali makan utama + 1-2 kali camilan.
- Porsi: mulai dari 2-3 sendok makan, naikkan bertahap hingga 1/2 mangkok (125 ml).
- Komposisi: karbohidrat + protein hewani (telur, hati ayam, ikan) + lemak (minyak/santan) + sayur/buah.

Hindari gula, garam, madu, dan susu sapi murni hingga usia 1 tahun.$$,
    'Buku KIA 2024 hal. 44-48',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '7 days'
  ),
  (
    'mpasi-lanjutan-9-23-bulan',
    'MPASI Lanjutan: Usia 9-23 Bulan',
    'gizi',
    9,
    23,
    'Panduan tekstur, frekuensi, dan keragaman menu MPASI untuk balita 9-23 bulan agar tumbuh optimal.',
    $$Pada usia 9-11 bulan, kemampuan mengunyah anak meningkat pesat. Variasikan tekstur dan rasa agar anak terbiasa dengan beragam makanan keluarga.

**Usia 9-11 bulan:**

- Tekstur: makanan dicincang halus atau makanan keluarga yang ditumbuk kasar.
- Frekuensi: 3-4 kali makan utama + 1-2 kali camilan.
- Porsi: 1/2 mangkok (125 ml) per kali makan.
- Boleh diperkenalkan finger food (potongan buah lunak, biskuit MPASI) untuk melatih motorik halus.

**Usia 12-23 bulan:**

- Tekstur: makanan keluarga yang dicincang atau dipotong kecil.
- Frekuensi: 3-4 kali makan utama + 1-2 kali camilan.
- Porsi: 3/4 hingga 1 mangkok penuh (175-250 ml).
- Lanjutkan ASI hingga usia 2 tahun atau lebih.

**Tips mencegah picky eating:**

- Sajikan makanan dalam porsi kecil dan beragam.
- Libatkan anak saat menyiapkan makanan sesuai usianya.
- Hindari memaksa anak makan; tawarkan ulang setelah beberapa hari.
- Batasi camilan manis dan minuman selain ASI/air putih.

Pantau berat badan dan tinggi badan anak setiap bulan di Posyandu untuk memastikan tumbuh sesuai standar WHO.$$,
    'Buku KIA 2024 hal. 50-54',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '6 days'
  ),
  (
    'jadwal-imunisasi-dasar-lengkap',
    'Jadwal Imunisasi Dasar Lengkap',
    'imunisasi',
    0,
    18,
    'Rangkaian imunisasi dasar lengkap (IDL) dari lahir hingga 18 bulan sesuai Program Imunisasi Nasional 2024.',
    $$Imunisasi dasar lengkap melindungi anak dari 14 penyakit yang dapat dicegah. Berikan sesuai jadwal di Posyandu, Puskesmas, atau fasilitas kesehatan terdekat — gratis di fasilitas pemerintah.

**Jadwal imunisasi dasar 2024:**

| Usia | Imunisasi |
|------|-----------|
| 0 bulan (segera setelah lahir) | Hepatitis B (HB-0), BCG, Polio Tetes 1 (OPV-0) |
| 1 bulan | BCG (bila belum) |
| 2 bulan | DPT-HB-Hib 1, OPV 1, Rotavirus 1, PCV 1 |
| 3 bulan | DPT-HB-Hib 2, OPV 2, Rotavirus 2 |
| 4 bulan | DPT-HB-Hib 3, OPV 3, IPV 1, Rotavirus 3, PCV 2 |
| 9 bulan | Campak-Rubella 1 (MR-1), IPV 2 |
| 12 bulan | PCV 3, Japanese Encephalitis (di daerah endemis) |
| 18 bulan | DPT-HB-Hib lanjutan, MR lanjutan |

**Setelah imunisasi:**

- Demam ringan, bengkak kemerahan di tempat suntikan, atau rewel adalah reaksi normal yang hilang dalam 1-3 hari.
- Kompres hangat dan beri parasetamol bila demam mengganggu.
- Segera ke fasilitas kesehatan bila reaksi berat: demam tinggi >39°C, kejang, sesak napas.

Selalu bawa Buku KIA agar petugas dapat mencatat dan mengingatkan jadwal berikutnya.$$,
    'Buku KIA 2024 hal. 60-66',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '5 days'
  ),
  (
    'perkembangan-anak-0-12-bulan',
    'Tonggak Perkembangan Anak 0-12 Bulan',
    'perkembangan',
    0,
    12,
    'Milestone motorik kasar, motorik halus, bicara, dan sosial yang perlu dipantau pada tahun pertama kehidupan.',
    $$Pantau perkembangan anak menggunakan ceklis di Buku KIA dan kuesioner SDIDTK di Posyandu. Setiap anak unik, tetapi keterlambatan signifikan perlu dirujuk.

**Usia 3 bulan:**

- Mengangkat kepala 45° saat ditengkurapkan.
- Tersenyum spontan saat diajak bicara.
- Mengeluarkan suara "oo, aa".

**Usia 6 bulan:**

- Berbalik dari telentang ke tengkurap dan sebaliknya.
- Memegang mainan dengan satu tangan.
- Mengeluarkan suara "ba, ma, da".

**Usia 9 bulan:**

- Duduk sendiri tanpa bantuan.
- Merangkak atau merayap.
- Memungut benda kecil dengan jari telunjuk dan jempol.
- Mulai mengerti "tidak" atau "dadah".

**Usia 12 bulan:**

- Berdiri sambil berpegangan, beberapa anak sudah bisa berjalan 1-2 langkah.
- Mengucapkan 1-2 kata bermakna ("mama", "papa").
- Menunjuk benda yang diinginkan.
- Bertepuk tangan, melambai.

**Kapan harus rujuk?** Segera konsultasi bila pada usia 12 bulan anak: tidak bisa duduk, tidak mengoceh, tidak memegang mainan, atau tidak tertarik berinteraksi.$$,
    'Buku KIA 2024 hal. 70-74',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '4 days'
  ),
  (
    'perkembangan-anak-1-2-tahun',
    'Tonggak Perkembangan Anak 1-2 Tahun',
    'perkembangan',
    12,
    24,
    'Lonjakan kemampuan motorik, bahasa, dan kemandirian pada anak usia 1-2 tahun.',
    $$Tahun kedua adalah masa eksplorasi pesat. Beri kesempatan anak mencoba hal baru dengan pengawasan.

**Usia 15 bulan:**

- Berjalan mundur.
- Menumpuk 2-3 balok.
- Mengucapkan 3-5 kata bermakna.

**Usia 18 bulan:**

- Berjalan naik tangga dengan dipegang.
- Menunjuk anggota tubuh saat ditanya.
- Menggunakan 6-10 kata, mulai menyusun 2 kata.
- Makan sendiri dengan sendok meski berantakan.

**Usia 24 bulan:**

- Berlari dan menendang bola.
- Menyusun kalimat 2-3 kata ("mau susu", "mama pergi").
- Mengikuti instruksi sederhana 2 tahap ("ambil sepatu lalu duduk").
- Menggambar coretan acak dengan pensil/krayon.

**Tips stimulasi:**

- Sediakan buku bergambar dan bacakan setiap hari.
- Ajak menyanyi dan menari mengikuti irama.
- Beri kesempatan bermain di luar ruangan dengan pengawasan.
- Batasi screen time: AAP merekomendasikan tidak ada screen time untuk anak < 18 bulan, kecuali video call dengan keluarga.

Konsultasi bila usia 2 tahun anak belum bisa berjalan, belum menggunakan 2 kata, atau tidak merespons namanya.$$,
    'Buku KIA 2024 hal. 75-78',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '3 days'
  ),
  (
    'pemantauan-pertumbuhan-balita',
    'Pemantauan Pertumbuhan Balita di Posyandu',
    'balita',
    0,
    60,
    'Mengapa penimbangan rutin di Posyandu setiap bulan menjadi kunci deteksi dini stunting dan gizi buruk.',
    $$Bawa balita ke Posyandu setiap bulan untuk ditimbang dan diukur. Data ini diplot di Kartu Menuju Sehat (KMS) Buku KIA agar pola tumbuh anak terlihat dari waktu ke waktu.

**Indikator yang dipantau:**

- **BB/U (Berat Badan menurut Umur)** — mendeteksi anak gizi kurang atau gizi buruk.
- **TB/U (Tinggi Badan menurut Umur)** — mendeteksi stunting (pendek).
- **BB/TB (Berat Badan menurut Tinggi Badan)** — mendeteksi anak wasting (kurus) atau berisiko obesitas.
- **LK/U (Lingkar Kepala menurut Umur)** — mendeteksi mikrosefali/makrosefali.

**Interpretasi:**

- Garis pertumbuhan **naik mengikuti pita warna** = anak tumbuh sesuai potensinya.
- Garis **mendatar atau turun** dua bulan berturut-turut = rujuk ke Puskesmas.
- **Z-score < -2 SD** untuk TB/U = anak stunting; perlu intervensi gizi dan kesehatan komprehensif.

**Yang dapat orang tua lakukan:**

- Pastikan asupan ASI hingga 2 tahun + MPASI bergizi seimbang.
- Lengkapi imunisasi dan vitamin A (Februari & Agustus).
- Praktikkan PHBS: cuci tangan pakai sabun, jamban sehat, air bersih.
- Lakukan stimulasi perkembangan harian (bermain, bercerita, menyanyi).

Stunting yang terjadi pada 1000 Hari Pertama Kehidupan (HPK) sulit dipulihkan setelah usia 2 tahun, jadi pencegahan jauh lebih efektif daripada pengobatan.$$,
    'Buku KIA 2024 hal. 80-84',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '2 days'
  ),
  (
    'phbs-keluarga-balita',
    'PHBS untuk Keluarga dengan Balita',
    'kesehatan_umum',
    0,
    60,
    'Sepuluh perilaku hidup bersih dan sehat (PHBS) yang menurunkan risiko diare, ISPA, dan stunting pada balita.',
    $$PHBS adalah praktik harian yang melindungi anak dari penyakit yang menjadi pemicu utama stunting. Lakukan secara konsisten oleh seluruh anggota keluarga.

**Sepuluh perilaku PHBS rumah tangga:**

1. Persalinan ditolong oleh tenaga kesehatan terlatih.
2. Memberi ASI eksklusif 0-6 bulan.
3. Menimbang balita setiap bulan.
4. Menggunakan air bersih.
5. Mencuci tangan dengan sabun dan air mengalir di 5 waktu kritis.
6. Menggunakan jamban sehat.
7. Memberantas jentik nyamuk di rumah.
8. Makan sayur dan buah setiap hari.
9. Melakukan aktivitas fisik setiap hari.
10. Tidak merokok di dalam rumah.

**5 waktu kritis cuci tangan pakai sabun:**

- Sebelum makan.
- Sebelum menyiapkan makanan.
- Setelah dari toilet.
- Setelah membersihkan kotoran/anak yang BAB.
- Setelah memegang hewan.

Akses air bersih dan sanitasi yang layak terbukti menurunkan kejadian diare hingga 40% dan menurunkan risiko stunting karena anak lebih jarang sakit dan nutrisi lebih banyak diserap untuk pertumbuhan.$$,
    'Buku KIA 2024 hal. 90-92',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '1 day'
  ),
  (
    'pencegahan-stunting-1000-hpk',
    '1000 Hari Pertama Kehidupan: Jendela Cegah Stunting',
    'gizi',
    NULL,
    24,
    'Mengapa periode dari kehamilan hingga ulang tahun ke-2 disebut "window of opportunity" pencegahan stunting.',
    $$1000 Hari Pertama Kehidupan (HPK) dihitung dari 270 hari masa kehamilan + 730 hari (2 tahun) kehidupan anak. Pada periode ini, otak dan organ tumbuh paling pesat; kekurangan gizi yang terjadi akan meninggalkan dampak permanen.

**Intervensi pada 1000 HPK:**

**Selama kehamilan (270 hari):**

- Pemeriksaan kehamilan minimal 6 kali.
- Tablet tambah darah 90 tablet selama hamil.
- Imunisasi Tetanus.
- Gizi seimbang sesuai trimester.
- Hindari paparan asap rokok dan zat berbahaya.

**0-6 bulan (180 hari):**

- Inisiasi Menyusu Dini.
- ASI eksklusif tanpa makanan/minuman lain.
- Imunisasi dasar tepat jadwal.
- Kunjungan neonatal lengkap.

**6-24 bulan (550 hari):**

- MPASI bergizi seimbang dengan protein hewani setiap kali makan.
- Lanjutkan ASI hingga 2 tahun.
- Pemantauan pertumbuhan setiap bulan.
- Vitamin A dan obat cacing sesuai jadwal.
- Stimulasi perkembangan harian.

Setelah anak berusia 2 tahun, fokus bergeser ke menjaga laju pertumbuhan dan mengejar potensi melalui gizi optimal dan stimulasi. Stunting yang sudah terjadi dapat sedikit dipulihkan (catch-up growth), tetapi pencegahan tetap jauh lebih efektif.$$,
    'Buku KIA 2024 hal. 96-100',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '12 hours'
  ),
  (
    'kebutuhan-tidur-balita',
    'Kebutuhan Tidur Bayi dan Balita',
    'kesehatan_umum',
    0,
    60,
    'Durasi tidur yang direkomendasikan per usia dan tips membangun rutinitas tidur yang menyehatkan.',
    $$Tidur berkualitas mendukung sekresi hormon pertumbuhan, konsolidasi memori, dan kekebalan tubuh anak.

**Durasi tidur per hari (termasuk tidur siang):**

- 0-3 bulan: 14-17 jam.
- 4-11 bulan: 12-15 jam.
- 1-2 tahun: 11-14 jam.
- 3-5 tahun: 10-13 jam.

**Tips membangun rutinitas tidur:**

- Mandi hangat, ganti pakaian tidur, lalu cerita atau nyanyi pengantar tidur.
- Redupkan lampu dan matikan layar 1 jam sebelum tidur.
- Tidur dan bangun di jam yang sama setiap hari, termasuk akhir pekan.
- Hindari memberi makan berat atau minuman manis menjelang tidur.

**Posisi tidur aman bayi:**

- Selalu telentang di kasur yang rata, tanpa bantal, guling, atau selimut tebal yang dapat menutup wajah.
- Jangan tidur seranjang dengan bayi (co-sleeping) di kasur dewasa yang empuk untuk menghindari Sudden Infant Death Syndrome (SIDS).
- Suhu ruangan nyaman 22-25°C.

Kurang tidur kronis pada balita berkaitan dengan gangguan perilaku, kesulitan belajar, dan risiko obesitas. Bila anak sulit tidur lebih dari 2 minggu, konsultasikan ke tenaga kesehatan.$$,
    'Buku KIA 2024 hal. 104-106',
    'https://kesmas.kemkes.go.id/konten/133/0/buku-kia',
    now() - interval '6 hours'
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  topic = EXCLUDED.topic,
  min_age_months = EXCLUDED.min_age_months,
  max_age_months = EXCLUDED.max_age_months,
  summary = EXCLUDED.summary,
  body_md = EXCLUDED.body_md,
  source_label = EXCLUDED.source_label,
  source_url = EXCLUDED.source_url,
  published_at = EXCLUDED.published_at;
