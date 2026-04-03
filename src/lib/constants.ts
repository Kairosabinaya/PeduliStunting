/** Application-wide constants. All magic numbers and config values live here. */

export const APP_NAME = "PeduliStunting.id";
export const APP_DESCRIPTION =
  "Platform edukasi stunting dan simulasi kebijakan berbasis model GTWENOLR untuk Indonesia.";

/** Free tier: max simulasi per hari */
export const MAX_FREE_SIMULATIONS_PER_DAY = 3;

/** Premium tier: max report PDF per bulan */
export const MAX_PREMIUM_REPORTS_PER_MONTH = 10;

/** Max upload file size (MB) */
export const MAX_UPLOAD_FILE_SIZE_MB = 10;

/** Warna kategori stunting (sinkron dengan Tailwind theme) */
export const STUNTING_COLORS = {
  Rendah: "#22C55E",
  Sedang: "#EAB308",
  Tinggi: "#EF4444",
} as const;

/** Tahun data yang tersedia */
export const DATA_YEARS = [2019, 2020, 2021, 2022, 2023, 2024] as const;
