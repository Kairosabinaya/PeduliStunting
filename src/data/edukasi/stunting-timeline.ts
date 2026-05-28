/**
 * Stunting prevalence time series for ACT 3. Combines historical
 * measurements (Riskesdas / SSGI / SKI) with the two government target
 * milestones (RPJMN 2025–2029, Visi Indonesia Emas 2045).
 *
 * Numbers are persen (0–100), matching how `region_indicators.y1_prevalence`
 * is stored in Supabase — keeping the unit consistent across surfaces.
 */

export interface StuntingTimelinePoint {
  readonly year: number;
  readonly prevalencePct: number;
  /** Human-readable source label rendered in the tooltip. */
  readonly source: string;
  /** Optional short annotation surfaced next to the data point. */
  readonly note?: string;
  /** Whether this point should receive the "glow" highlight (the headline 2024 value). */
  readonly highlight?: boolean;
  /** Whether the point is observed data or a forward-looking target. */
  readonly kind: "actual" | "target";
}

export const STUNTING_TIMELINE: readonly StuntingTimelinePoint[] = [
  {
    year: 2013,
    prevalencePct: 37.2,
    source: "Riskesdas 2013",
    note: "Awal pemantauan nasional",
    kind: "actual",
  },
  {
    year: 2018,
    prevalencePct: 30.8,
    source: "Riskesdas 2018",
    kind: "actual",
  },
  {
    year: 2019,
    prevalencePct: 27.7,
    source: "SSGI 2019",
    kind: "actual",
  },
  {
    year: 2021,
    prevalencePct: 24.4,
    source: "SSGI 2021",
    kind: "actual",
  },
  {
    year: 2022,
    prevalencePct: 21.6,
    source: "SSGI 2022",
    kind: "actual",
  },
  {
    year: 2023,
    prevalencePct: 21.5,
    source: "SKI 2023",
    note: "Plateau singkat",
    kind: "actual",
  },
  {
    year: 2024,
    prevalencePct: 19.8,
    source: "SSGI 2024",
    note: "Capaian terbaru — di bawah target 20,1%",
    highlight: true,
    kind: "actual",
  },
  {
    year: 2029,
    prevalencePct: 14.2,
    source: "Target RPJMN 2025–2029",
    note: "Target pemerintah",
    kind: "target",
  },
  {
    year: 2045,
    prevalencePct: 5.0,
    source: "Visi Indonesia Emas",
    note: "Target jangka panjang",
    kind: "target",
  },
] as const;

export const STUNTING_TIMELINE_DOMAIN = {
  /** Y-axis lower bound for the chart (percent). */
  yMin: 0,
  /** Y-axis upper bound for the chart (percent). */
  yMax: 40,
} as const;
