/** Stunting color gradient — interpolates between green/yellow/red based on prevalence rate. */

/**
 * Gradient stops: 0% → green, 20% → green-yellow, 30% → yellow-red, 45%+ → red.
 * Prevalence di bawah 10% = hijau penuh, di atas 40% = merah penuh.
 */
const GRADIENT_STOPS: [number, [number, number, number]][] = [
  [0, [34, 197, 94]],    // #22C55E — hijau
  [20, [132, 204, 22]],  // #84CC16 — hijau-kuning
  [25, [234, 179, 8]],   // #EAB308 — kuning
  [30, [245, 158, 11]],  // #F59E0B — kuning-oranye
  [35, [239, 68, 68]],   // #EF4444 — merah
  [45, [185, 28, 28]],   // #B91C1C — merah tua
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Mengembalikan warna hex berdasarkan nilai prevalensi stunting.
 * Rendah (hijau) → Sedang (kuning) → Tinggi (merah) secara gradual.
 */
export function getStuntingGradientColor(prevalenceRate: number | undefined): string {
  if (prevalenceRate === undefined) return "#D1D5DB";

  const rate = Math.max(0, Math.min(prevalenceRate, 50));

  // Cari 2 stop yang mengapit nilai rate
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const [minRate, minColor] = GRADIENT_STOPS[i];
    const [maxRate, maxColor] = GRADIENT_STOPS[i + 1];

    if (rate <= maxRate) {
      const t = (rate - minRate) / (maxRate - minRate);
      return rgbToHex(
        lerp(minColor[0], maxColor[0], t),
        lerp(minColor[1], maxColor[1], t),
        lerp(minColor[2], maxColor[2], t)
      );
    }
  }

  // Di atas stop terakhir
  const [, lastColor] = GRADIENT_STOPS[GRADIENT_STOPS.length - 1];
  return rgbToHex(lastColor[0], lastColor[1], lastColor[2]);
}
