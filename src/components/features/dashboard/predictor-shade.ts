/**
 * Diverging colour ramp for the predictor-correlation bars. Maps a signed
 * correlation to a brand-token fill (no Google ordinal red/green outside the
 * map): positive (raises stunting risk) → primary blue shades; near-zero →
 * neutral muted; negative (protective) → accent green shades. Magnitude
 * (`|value| / maxAbs`) picks the opacity step so the column reads as a gradient
 * rather than two binary colours. Returned as `rgb(var(--token) / alpha)` — the
 * CSS-variable convention the other dashboard charts use, so it remaps
 * automatically in dark mode.
 */

const RISK_TOKEN = "var(--color-primary)";
const PROTECTIVE_TOKEN = "var(--color-accent)";
const NEUTRAL_TOKEN = "var(--color-muted-foreground)";

/** Opacity steps from faint (weak) to solid (strong). */
const ALPHA_STEPS = [0.45, 0.65, 0.85, 1] as const;

/** Below this absolute correlation a predictor reads as effectively unrelated. */
const NEAR_ZERO = 0.05;

export function shadeFillForCorrelation(value: number, maxAbs: number): string {
  if (maxAbs <= 0 || Math.abs(value) < NEAR_ZERO) {
    return `rgb(${NEUTRAL_TOKEN} / 0.5)`;
  }
  const ratio = Math.min(1, Math.abs(value) / maxAbs);
  const index = Math.min(3, Math.max(0, Math.ceil(ratio * 4) - 1));
  const alpha = ALPHA_STEPS[index] ?? 1;
  const token = value >= 0 ? RISK_TOKEN : PROTECTIVE_TOKEN;
  return `rgb(${token} / ${alpha})`;
}
