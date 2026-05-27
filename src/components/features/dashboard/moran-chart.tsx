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
import { DASHBOARD_MORAN_SECTION } from "@/config/dashboard";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import { parseMoranPerYear, type MoranYearPoint } from "@/schemas/model";

export interface MoranChartProps {
  readonly result: Result<ModelMetadataDto | null, AppError>;
}

const SIGNIFICANCE_THRESHOLD = 0.05;

export function MoranChart({ result }: MoranChartProps) {
  if (!result.ok) {
    return (
      <ErrorState
        title={DASHBOARD_MORAN_SECTION.errorTitle}
        description={result.error.message}
      />
    );
  }
  if (!result.value) {
    return (
      <EmptyState
        title={DASHBOARD_MORAN_SECTION.emptyTitle}
        description={DASHBOARD_MORAN_SECTION.emptyDescription}
      />
    );
  }

  const points = parseMoranPerYear(result.value.moranPerYear);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{DASHBOARD_MORAN_SECTION.title}</CardTitle>
        <CardDescription>{DASHBOARD_MORAN_SECTION.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <EmptyState
            title={DASHBOARD_MORAN_SECTION.emptyTitle}
            description={DASHBOARD_MORAN_SECTION.emptyDescription}
          />
        ) : (
          <MoranBars points={points} />
        )}
      </CardContent>
    </Card>
  );
}

interface MoranBarsProps {
  readonly points: readonly MoranYearPoint[];
}

function MoranBars({ points }: MoranBarsProps) {
  const max = Math.max(
    1e-3,
    ...points.map((p) => Math.abs(p.moranI)),
  );

  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {points.map((point) => {
        const widthPercent = Math.min(100, (Math.abs(point.moranI) / max) * 100);
        const isPositive = point.moranI >= 0;
        const significant =
          point.pValue !== null && point.pValue <= SIGNIFICANCE_THRESHOLD;
        return (
          <li
            key={point.year}
            className="rounded-lg border border-border bg-surface-muted/40 p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {point.year}
              </p>
              <p
                className="font-mono text-base tabular-nums text-foreground"
                aria-label={`${DASHBOARD_MORAN_SECTION.valueLabel} ${point.moranI.toFixed(3)}`}
              >
                {point.moranI.toFixed(3)}
              </p>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className={
                  isPositive
                    ? "h-full rounded-full bg-primary"
                    : "h-full rounded-full bg-accent"
                }
                style={{ width: `${widthPercent}%` }}
                aria-hidden
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {DASHBOARD_MORAN_SECTION.pValueLabel}:{" "}
                <span className="font-mono tabular-nums text-foreground">
                  {point.pValue === null ? "—" : point.pValue.toFixed(3)}
                </span>
              </span>
              {point.pValue === null ? null : significant ? (
                <Badge tone="warning">
                  {DASHBOARD_MORAN_SECTION.significantBadge}
                </Badge>
              ) : (
                <Badge tone="neutral">
                  {DASHBOARD_MORAN_SECTION.notSignificantBadge}
                </Badge>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
