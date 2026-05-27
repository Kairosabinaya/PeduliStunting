import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { DASHBOARD_DICTIONARY_SECTION } from "@/config/dashboard";
import {
  PREDICTOR_DIMENSION_ORDER,
  getPredictorDimensionLabel,
} from "@/config/predictor-dimensions";
import type { AppError } from "@/domain/errors/app-error";
import type { IndicatorDimension } from "@/domain/region/entities/indicator-definition";
import type { Result } from "@/domain/shared/result";

export interface PredictorDictionaryProps {
  readonly result: Result<readonly IndicatorDefinitionDto[], AppError>;
}

export function PredictorDictionary({ result }: PredictorDictionaryProps) {
  if (!result.ok) {
    return (
      <ErrorState
        title={DASHBOARD_DICTIONARY_SECTION.errorTitle}
        description={result.error.message}
      />
    );
  }
  if (result.value.length === 0) {
    return (
      <EmptyState
        title={DASHBOARD_DICTIONARY_SECTION.emptyTitle}
        description={DASHBOARD_DICTIONARY_SECTION.emptyDescription}
      />
    );
  }

  const grouped = groupByDimension(result.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{DASHBOARD_DICTIONARY_SECTION.title}</CardTitle>
        <CardDescription>
          {DASHBOARD_DICTIONARY_SECTION.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {PREDICTOR_DIMENSION_ORDER.flatMap((dimension) => {
          const items = grouped.get(dimension);
          if (!items || items.length === 0) return [];
          const label = getPredictorDimensionLabel(dimension);
          return [
            <section key={dimension} aria-labelledby={`dim-${dimension}`}>
              <header className="mb-3">
                <h3
                  id={`dim-${dimension}`}
                  className="text-base font-semibold text-foreground"
                >
                  {label.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {label.description}
                </p>
              </header>
              <ul className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <PredictorItem key={item.code} item={item} />
                ))}
              </ul>
            </section>,
          ];
        })}
      </CardContent>
    </Card>
  );
}

interface PredictorItemProps {
  readonly item: IndicatorDefinitionDto;
}

function PredictorItem({ item }: PredictorItemProps) {
  return (
    <li className="rounded-lg border border-border bg-surface-muted/40 p-3">
      <p className="flex items-baseline gap-2">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {item.code}
        </span>
        <span className="text-sm font-medium text-foreground">{item.name}</span>
      </p>
      {item.description ? (
        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
      ) : null}
      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {item.unit ? (
          <div className="flex items-baseline gap-1">
            <dt>{DASHBOARD_DICTIONARY_SECTION.unitLabel}:</dt>
            <dd className="font-mono tabular-nums text-foreground">
              {item.unit}
            </dd>
          </div>
        ) : null}
        {item.sourceLabel ? (
          <div className="flex items-baseline gap-1">
            <dt>{DASHBOARD_DICTIONARY_SECTION.sourceLabel}:</dt>
            <dd className="text-foreground">{item.sourceLabel}</dd>
          </div>
        ) : null}
      </dl>
    </li>
  );
}

function groupByDimension(
  items: readonly IndicatorDefinitionDto[],
): Map<IndicatorDimension, IndicatorDefinitionDto[]> {
  const map = new Map<IndicatorDimension, IndicatorDefinitionDto[]>();
  for (const item of items) {
    const key = item.dimension as IndicatorDimension;
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  for (const bucket of map.values()) {
    bucket.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }
  return map;
}
