import type { ModelMetadataDto } from "@/application/model/dtos";
import { Badge } from "@/components/primitives/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import {
  DASHBOARD_METRICS_SECTION,
  DASHBOARD_METRIC_TILES,
  type MetricTileDefinition,
} from "@/config/dashboard";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import {
  modelMetricsPayloadSchema,
  type ModelMetricsPayload,
} from "@/schemas/model";

export interface MetricsSnapshotProps {
  readonly result: Result<ModelMetadataDto | null, AppError>;
}

export function MetricsSnapshot({ result }: MetricsSnapshotProps) {
  if (!result.ok) {
    return (
      <ErrorState
        title={DASHBOARD_METRICS_SECTION.errorTitle}
        description={result.error.message}
      />
    );
  }
  const metadata = result.value;
  if (!metadata) {
    return (
      <EmptyState
        title={DASHBOARD_METRICS_SECTION.emptyTitle}
        description={DASHBOARD_METRICS_SECTION.emptyDescription}
      />
    );
  }

  const parsed = modelMetricsPayloadSchema.safeParse(metadata.metrics);
  const payload: ModelMetricsPayload = parsed.success ? parsed.data : {};
  const tilesWithValues = DASHBOARD_METRIC_TILES.map((tile) => ({
    tile,
    value: pickNumber(payload, tile.key),
  }));
  const hasAnyValue = tilesWithValues.some((entry) => entry.value !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {DASHBOARD_METRICS_SECTION.title}
          <Badge tone="primary">v{metadata.version}</Badge>
          <Badge tone="success">Default</Badge>
        </CardTitle>
        <CardDescription>
          {metadata.notes ?? DASHBOARD_METRICS_SECTION.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasAnyValue ? (
          <ul
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label={DASHBOARD_METRICS_SECTION.title}
          >
            {tilesWithValues.map(({ tile, value }) => (
              <MetricTile key={tile.key} definition={tile} value={value} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title={DASHBOARD_METRICS_SECTION.noMetricsTitle}
            description={DASHBOARD_METRICS_SECTION.noMetricsDescription}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface MetricTileProps {
  readonly definition: MetricTileDefinition;
  readonly value: number | null;
}

function MetricTile({ definition, value }: MetricTileProps) {
  return (
    <li className="rounded-lg border border-border bg-surface-muted/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {definition.label}
      </p>
      <p className="mt-2 font-mono text-2xl tabular-nums text-foreground">
        {value === null ? "—" : value.toFixed(definition.precision)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {definition.description}
      </p>
    </li>
  );
}

function pickNumber(
  payload: ModelMetricsPayload,
  key: string,
): number | null {
  const value = (payload as Readonly<Record<string, unknown>>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
