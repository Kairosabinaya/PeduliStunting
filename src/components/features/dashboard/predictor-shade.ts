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

const RISK_TOKEN = "var(--color-risk)";
const RISK_WEAK_TOKEN = "var(--color-risk-weak)";
const PROTECTIVE_TOKEN = "var(--color-accent)";
const PROTECTIVE_WEAK_TOKEN = "var(--color-protective-weak)";
const NEUTRAL_TOKEN = "var(--color-muted-foreground)";

export function shadeFillForCorrelation(value: number, maxAbs: number): string {
  if (maxAbs <= 0 || Math.abs(value) === 0) {
    return `rgb(${NEUTRAL_TOKEN} / 0.5)`;
  }

  const absVal = Math.abs(value);
  const ratio = Math.min(1, absVal / maxAbs);
  const percent = Math.round(ratio * 100);

  if (value >= 0) {
    return `color-mix(in srgb, rgb(${RISK_TOKEN}) ${percent}%, rgb(${RISK_WEAK_TOKEN}))`;
  } else {
    return `color-mix(in srgb, rgb(${PROTECTIVE_TOKEN}) ${percent}%, rgb(${PROTECTIVE_WEAK_TOKEN}))`;
  }
}
