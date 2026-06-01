/**
 * Branded Recharts tooltip — a glass card with a coloured dot per series, used
 * via `<Tooltip content={<DashboardTooltip unit="%" />} />` instead of the
 * default white box so charts feel on-brand and legible in both themes.
 *
 * The props are typed locally (not from Recharts' shifting type exports);
 * Recharts injects `active` / `payload` / `label` at render time.
 */

interface TooltipEntry {
  readonly name?: string | number;
  readonly value?: number | string;
  readonly color?: string;
  readonly dataKey?: string | number;
}

export interface DashboardTooltipProps {
  readonly active?: boolean;
  readonly payload?: readonly TooltipEntry[];
  readonly label?: string | number;
  /** Suffix appended to each value (e.g. "%"). */
  readonly unit?: string;
  /** Decimal places for numeric values (default 1; use 0 for counts). */
  readonly decimals?: number;
}

export function DashboardTooltip({
  active,
  payload,
  label,
  unit = "",
  decimals = 1,
}: DashboardTooltipProps) {
  if (active !== true || payload === undefined || payload.length === 0) {
    return null;
  }
  return (
    <div className="glass-panel-strong rounded-xl px-3 py-2 text-xs shadow-lg">
      {label !== undefined ? (
        <p className="mb-1 font-semibold text-foreground">{String(label)}</p>
      ) : null}
      <ul className="space-y-0.5">
        {payload.map((entry, index) => (
          <li
            key={`${String(entry.dataKey ?? index)}`}
            className="flex items-center gap-2"
          >
            <span
              aria-hidden
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground">{entry.name}</span>
            <span className="ml-auto pl-4 font-mono font-semibold tabular-nums text-foreground">
              {typeof entry.value === "number"
                ? entry.value.toFixed(decimals)
                : "-"}
              {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
