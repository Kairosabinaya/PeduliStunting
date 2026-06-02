import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RegionTrendCard as RegionTrendCardModel } from "@/application/ai/cards/ai-card";

/**
 * Renders a region's prevalence trend as a compact line chart.
 *
 * @example
 * ```tsx
 * <RegionTrendCard card={{ type: "region-trend", kodeBps: "3578", kabupatenKota: "Kota Surabaya", provinsi: "Jawa Timur", series: [] }} />
 * ```
 */
export function RegionTrendCard({
  card,
}: {
  readonly card: RegionTrendCardModel;
}) {
  const data = card.series.map((point) => ({
    tahun: point.tahun,
    prevalensi: point.prevalence,
  }));
  return (
    <div className="rounded-lg border border-border bg-surface/70 p-3">
      <p className="mb-1 text-xs font-medium text-muted-foreground">
        Tren {card.kabupatenKota}
      </p>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <XAxis
              dataKey="tahun"
              tick={{
                fontSize: 11,
                fill: "rgb(var(--color-muted-foreground))",
              }}
              stroke="rgb(var(--color-border))"
            />
            <YAxis
              tick={{
                fontSize: 11,
                fill: "rgb(var(--color-muted-foreground))",
              }}
              stroke="rgb(var(--color-border))"
              width={36}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid rgb(var(--color-border))",
                background: "rgb(var(--color-surface))",
              }}
              formatter={(value) => [`${value ?? "-"}%`, "Prevalensi"]}
            />
            <Line
              type="monotone"
              dataKey="prevalensi"
              stroke="rgb(var(--color-primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
