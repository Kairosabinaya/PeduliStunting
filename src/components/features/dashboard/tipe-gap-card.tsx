import { Card } from "@/components/primitives/card";
import { DASHBOARD_TIPE_GAP } from "@/config/dashboard";

import { SectionHeading } from "./section-heading";

export interface TipeShareData {
  readonly label: string;
  readonly rendah: number;
  readonly sedang: number;
  readonly tinggi: number;
  readonly regionCount: number;
}

export interface TipeGapCardProps {
  readonly kota?: TipeShareData;
  readonly kabupaten?: TipeShareData;
  readonly year?: number;
}

// ─── Gauge geometry ──────────────────────────────────────────────────────────
const CX = 100;
const CY = 96;
const R = 68;
const STROKE = 14;

function pt(p: number) {
  const a = p * Math.PI;
  return { x: CX - R * Math.cos(a), y: CY - R * Math.sin(a) };
}

// largeArc is always 0: segments span ≤ 180° of the full circle.
function arc(p1: number, p2: number): string {
  if (p2 <= p1 + 0.001) return "";
  const s = pt(p1);
  const e = pt(Math.min(p2, 0.9999));
  return `M ${s.x.toFixed(2)},${s.y.toFixed(2)} A ${R},${R} 0 0 1 ${e.x.toFixed(2)},${e.y.toFixed(2)}`;
}

const TRACK_PATH = `M ${CX - R},${CY} A ${R},${R} 0 0 1 ${CX + R},${CY}`;
const TRACK_COLOR = "rgb(var(--color-surface-muted))";

const STROKES = [
  "rgb(var(--color-ordinal-rendah))",
  "rgb(var(--color-ordinal-sedang))",
  "rgb(var(--color-ordinal-tinggi))",
] as const;

function GaugeSemi({ share }: { readonly share: TipeShareData }) {
  const total = share.regionCount;
  const rEnd = total > 0 ? share.rendah / total : 0;
  const sEnd = rEnd + (total > 0 ? share.sedang / total : 0);

  const paths: { from: number; to: number; stroke: string }[] = [
    { from: 0, to: rEnd, stroke: STROKES[0] },
    { from: rEnd, to: sEnd, stroke: STROKES[1] },
    { from: sEnd, to: 1, stroke: STROKES[2] },
  ];

  return (
    <div>
      <svg
        viewBox="0 0 200 110"
        className="w-full"
        role="img"
        aria-label={`${share.label}: Rendah ${share.rendah}, Sedang ${share.sedang}, Tinggi ${share.tinggi}`}
      >
        {/* track */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke={TRACK_COLOR}
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {/* coloured segments */}
        {paths.map((seg, i) => {
          const d = arc(seg.from, seg.to);
          return d ? (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={seg.stroke}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
          ) : null;
        })}
        {/* label inside the arc opening */}
        <text
          x={CX}
          y={88}
          textAnchor="middle"
          dy="0.35em"
          fontSize="13"
          fontWeight="600"
          fill="rgb(var(--color-foreground))"
        >
          {share.label}
        </text>
      </svg>

      {/* Rendah · Sedang · Tinggi on ONE line */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="inline-block size-2 shrink-0 rounded-full bg-ordinal-rendah" />
          Rendah {share.rendah}
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="inline-block size-2 shrink-0 rounded-full bg-ordinal-sedang" />
          Sedang {share.sedang}
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="inline-block size-2 shrink-0 rounded-full bg-ordinal-tinggi" />
          Tinggi {share.tinggi}
        </span>
      </div>
    </div>
  );
}

export function TipeGapCard({ kota, kabupaten, year }: TipeGapCardProps) {
  if (!kota && !kabupaten) return null;

  const description =
    year === undefined
      ? DASHBOARD_TIPE_GAP.description
      : `${DASHBOARD_TIPE_GAP.description}, ${year}`;

  return (
    <Card padding="md" className="flex h-full flex-col gap-3">
      <SectionHeading
        title={DASHBOARD_TIPE_GAP.title}
        description={description}
      />
      <div className="flex flex-1 flex-col justify-between gap-2">
        {kota ? <GaugeSemi share={kota} /> : null}
        {kabupaten ? <GaugeSemi share={kabupaten} /> : null}
      </div>
    </Card>
  );
}
