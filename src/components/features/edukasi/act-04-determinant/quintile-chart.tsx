"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DETERMINANT_COPY } from "@/config/edukasi";
import {
  INCOME_QUINTILES,
  INCOME_QUINTILE_NATIONAL,
  type IncomeQuintilePoint,
} from "@/data/edukasi/determinants";

interface ChartDatum {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly note: string;
}

const TONE_COLOR: readonly string[] = [
  "rgb(var(--edu-hl-danger))",
  "rgb(var(--color-warning))",
  "rgb(var(--color-primary))",
  "rgb(var(--color-primary-soft))",
  "rgb(var(--color-accent))",
];

function renderTooltip(rawProps: unknown): React.ReactNode {
  if (typeof rawProps !== "object" || rawProps === null) return null;
  const props = rawProps as {
    readonly active?: boolean;
    readonly payload?: readonly { readonly payload?: ChartDatum }[];
  };
  if (!props.active || !props.payload || props.payload.length === 0)
    return null;
  const datum = props.payload[0]?.payload;
  if (!datum) return null;
  return (
    <div className="glass-panel rounded-lg px-3 py-2 text-xs leading-relaxed">
      <p className="font-semibold text-primary">{datum.label}</p>
      <p className="mt-1 tabular-nums text-foreground">
        {datum.value.toLocaleString("id-ID", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
        %
      </p>
      <p className="mt-1 text-muted-foreground">{datum.note}</p>
    </div>
  );
}

export function QuintileChart() {
  const data: ChartDatum[] = INCOME_QUINTILES.map(
    (q: IncomeQuintilePoint): ChartDatum => ({
      id: q.id,
      label: q.label,
      value: q.prevalencePct,
      note: q.note,
    }),
  );

  return (
    <figure
      className="not-prose rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6"
      aria-label={DETERMINANT_COPY.quintileTitle}
    >
      <header className="mb-3">
        <h3 className="text-lg font-semibold text-foreground">
          {DETERMINANT_COPY.quintileTitle}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {DETERMINANT_COPY.quintileDescription}
        </p>
      </header>
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%" minHeight={288}>
          <BarChart
            data={data}
            margin={{ top: 16, right: 16, bottom: 8, left: 0 }}
          >
            <CartesianGrid
              stroke="rgb(var(--color-border))"
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{
                fill: "rgb(var(--color-muted-foreground))",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={{ stroke: "rgb(var(--color-border))" }}
              interval={0}
            />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{
                fill: "rgb(var(--color-muted-foreground))",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
              width={42}
              domain={[0, 35]}
            />
            <Tooltip
              cursor={{ fill: "rgb(var(--color-primary) / 0.06)" }}
              content={renderTooltip}
            />
            <ReferenceLine
              y={INCOME_QUINTILE_NATIONAL}
              stroke="rgb(var(--color-foreground) / 0.5)"
              strokeDasharray="4 4"
              label={{
                value: DETERMINANT_COPY.quintileNationalLabel,
                position: "insideTopRight",
                fontSize: 11,
                fill: "rgb(var(--color-foreground) / 0.7)",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => {
                const fill: string =
                  TONE_COLOR[index] ??
                  TONE_COLOR[2] ??
                  "rgb(var(--color-primary))";
                return <Cell key={entry.id} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
