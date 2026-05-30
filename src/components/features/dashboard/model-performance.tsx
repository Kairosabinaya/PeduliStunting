import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { DASHBOARD_METRIC_TILES, DASHBOARD_MODEL } from "@/config/dashboard";
import { modelMetricsPayloadSchema } from "@/schemas/model";

export interface ModelPerformanceProps {
  readonly metrics: Readonly<Record<string, unknown>>;
}

/**
 * Out-of-sample performance tiles (accuracy, QWK, MAE) for the default model,
 * read from the validated `metrics` payload.
 */
export function ModelPerformance({ metrics }: ModelPerformanceProps) {
  const parsed = modelMetricsPayloadSchema.safeParse(metrics);
  const data = parsed.success ? parsed.data : {};
  const values: Record<string, number | null> = {
    accuracy: data.accuracy ?? null,
    qwk: data.qwk ?? null,
    mae: data.mae ?? null,
    log_score: data.log_score ?? null,
  };

  const tiles = DASHBOARD_METRIC_TILES.map((tile) => ({
    tile,
    value: values[tile.key] ?? null,
  })).filter(
    (entry): entry is { tile: typeof entry.tile; value: number } =>
      entry.value !== null,
  );

  if (tiles.length === 0) {
    return (
      <EmptyState
        title={DASHBOARD_MODEL.performanceEmptyTitle}
        description={DASHBOARD_MODEL.performanceEmptyDescription}
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {tiles.map(({ tile, value }) => (
        <li key={tile.key}>
          <Card padding="md" elevation="sm" className="h-full space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {tile.label}
            </p>
            <p className="font-mono text-3xl tabular-nums text-foreground">
              {value.toFixed(tile.precision)}
            </p>
            <p className="text-xs text-muted-foreground">{tile.description}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
