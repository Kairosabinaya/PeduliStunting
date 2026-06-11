/**
 * One-shot optimizer for the static assets under `public/`.
 *
 * The original brand/illustration exports were committed at print resolution
 * (up to 2000 px, ~13 MB total). Everything rendered through `next/image`
 * is re-encoded at request time, but oversized sources still cost optimizer
 * latency, and the assets referenced OUTSIDE `next/image` (favicons) ship
 * raw bytes on every page. This script emits right-sized WebP variants plus
 * proper favicon/apple-touch sizes and a 1200x630 Open Graph card.
 *
 * Outputs are committed; originals that became unreferenced are deleted in
 * the same change (grep `"/brand/` and `"/edukasi/` before removal).
 *
 * Usage:  pnpm optimize:images
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import sharp from "sharp";

import { runScript } from "./_lib/script-context.ts";

const PUBLIC_DIR = resolve("public");

/** Render size x2 (retina) for every raster asset referenced in src/. */
interface ResizeJob {
  readonly input: string;
  readonly output: string;
  readonly width: number;
  readonly height?: number;
  readonly format: "webp" | "png";
  /** WebP quality; sized for icon/illustration content. */
  readonly quality?: number;
}

const JOBS: readonly ResizeJob[] = [
  // Favicons — previously a single 2 MB PNG linked on every page.
  {
    input: "brand/icon-color.png",
    output: "brand/favicon-32.png",
    width: 32,
    format: "png",
  },
  {
    input: "brand/icon-color.png",
    output: "brand/favicon-192.png",
    width: 192,
    format: "png",
  },
  {
    input: "brand/icon-color.png",
    output: "brand/apple-touch-180.png",
    width: 180,
    format: "png",
  },
  // Header icon marks (rendered 32 px, 2x retina).
  {
    input: "brand/icon-color.png",
    output: "brand/icon-color.webp",
    width: 64,
    format: "webp",
  },
  {
    input: "brand/icon-white.png",
    output: "brand/icon-white.webp",
    width: 64,
    format: "webp",
  },
  // Horizontal wordmarks (rendered up to 480x120 per config/landing.ts).
  {
    input: "brand/logo-horizontal-color.png",
    output: "brand/logo-horizontal-color.webp",
    width: 960,
    format: "webp",
  },
  {
    input: "brand/logo-horizontal-white.png",
    output: "brand/logo-horizontal-white.webp",
    width: 960,
    format: "webp",
  },
  // Stacked logos (largest render 360 px in the auth brand panel).
  {
    input: "brand/logo-stacked-color.png",
    output: "brand/logo-stacked-color.webp",
    width: 720,
    format: "webp",
  },
  {
    input: "brand/logo-stacked-white.png",
    output: "brand/logo-stacked-white.webp",
    width: 720,
    format: "webp",
  },
  // Edukasi illustrations (rendered <= 1000 px, soft gradients suit WebP).
  {
    input: "edukasi/Hero - Ibu pangku anak.png",
    output: "edukasi/hero-ibu-pangku-anak.webp",
    width: 1000,
    quality: 82,
    format: "webp",
  },
  {
    input: "edukasi/1000 hari - 1.png",
    output: "edukasi/1000-hari-1.webp",
    width: 1000,
    quality: 82,
    format: "webp",
  },
  {
    input: "edukasi/1000 hari - 2.png",
    output: "edukasi/1000-hari-2.webp",
    width: 1000,
    quality: 82,
    format: "webp",
  },
  {
    input: "edukasi/1000 hari - 3.png",
    output: "edukasi/1000-hari-3.webp",
    width: 1000,
    quality: 82,
    format: "webp",
  },
  {
    input: "edukasi/1000 hari - 4.png",
    output: "edukasi/1000-hari-4.webp",
    width: 1000,
    quality: 82,
    format: "webp",
  },
  {
    input: "edukasi/1000 hari - 5.png",
    output: "edukasi/1000-hari-5.webp",
    width: 1000,
    quality: 82,
    format: "webp",
  },
  {
    input: "edukasi/1000 hari - 6.png",
    output: "edukasi/1000-hari-6.webp",
    width: 1000,
    quality: 82,
    format: "webp",
  },
];

const OG_CARD = {
  logo: "brand/logo-stacked-color.png",
  output: "brand/og-image.png",
  width: 1200,
  height: 630,
  logoHeight: 420,
  /** Matches the light-theme background (`viewport.themeColor`). */
  background: { r: 250, g: 250, b: 248 },
} as const;

async function runJob(job: ResizeJob): Promise<number> {
  const inputPath = resolve(PUBLIC_DIR, job.input);
  const outputPath = resolve(PUBLIC_DIR, job.output);
  mkdirSync(dirname(outputPath), { recursive: true });
  let pipeline = sharp(inputPath).resize({
    width: job.width,
    ...(job.height !== undefined ? { height: job.height } : {}),
    fit: "inside",
    withoutEnlargement: true,
  });
  pipeline =
    job.format === "webp"
      ? pipeline.webp({ quality: job.quality ?? 90 })
      : pipeline.png({ compressionLevel: 9 });
  const info = await pipeline.toFile(outputPath);
  return info.size;
}

/** Compose the Open Graph card: stacked logo centered on the brand surface. */
async function buildOgCard(): Promise<number> {
  const logo = await sharp(resolve(PUBLIC_DIR, OG_CARD.logo))
    .resize({ height: OG_CARD.logoHeight, fit: "inside" })
    .png()
    .toBuffer();
  const info = await sharp({
    create: {
      width: OG_CARD.width,
      height: OG_CARD.height,
      channels: 4,
      background: { ...OG_CARD.background, alpha: 1 },
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(resolve(PUBLIC_DIR, OG_CARD.output));
  return info.size;
}

await runScript("optimize-images", async ({ logger }) => {
  for (const job of JOBS) {
    const bytes = await runJob(job);
    logger.info("image.written", {
      output: job.output,
      kb: Math.round(bytes / 1024),
    });
  }
  const ogBytes = await buildOgCard();
  logger.info("image.written", {
    output: OG_CARD.output,
    kb: Math.round(ogBytes / 1024),
  });
});
