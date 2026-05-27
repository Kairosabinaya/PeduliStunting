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
import { DASHBOARD_COMPARISON_SECTION } from "@/config/dashboard";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import {
  modelMetricsPayloadSchema,
  type ModelComparisonEntry,
} from "@/schemas/model";

export interface ModelComparisonTableProps {
  readonly result: Result<ModelMetadataDto | null, AppError>;
}

export function ModelComparisonTable({ result }: ModelComparisonTableProps) {
  if (!result.ok) {
    return (
      <ErrorState
        title={DASHBOARD_COMPARISON_SECTION.errorTitle}
        description={result.error.message}
      />
    );
  }
  if (!result.value) {
    return (
      <EmptyState
        title={DASHBOARD_COMPARISON_SECTION.emptyTitle}
        description={DASHBOARD_COMPARISON_SECTION.emptyDescription}
      />
    );
  }

  const parsed = modelMetricsPayloadSchema.safeParse(result.value.metrics);
  const models: readonly ModelComparisonEntry[] = parsed.success
    ? (parsed.data.models ?? [])
    : [];

  if (models.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{DASHBOARD_COMPARISON_SECTION.title}</CardTitle>
          <CardDescription>
            {DASHBOARD_COMPARISON_SECTION.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title={DASHBOARD_COMPARISON_SECTION.emptyTitle}
            description={DASHBOARD_COMPARISON_SECTION.emptyDescription}
          />
        </CardContent>
      </Card>
    );
  }

  const cols = DASHBOARD_COMPARISON_SECTION.columns;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{DASHBOARD_COMPARISON_SECTION.title}</CardTitle>
        <CardDescription>
          {DASHBOARD_COMPARISON_SECTION.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  {cols.name}
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  {cols.accuracy}
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  {cols.qwk}
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  {cols.mae}
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  {cols.logScore}
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  {cols.selected}
                </th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, index) => (
                <tr
                  key={`${model.name}-${index}`}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <th
                    scope="row"
                    className="py-2 pr-3 font-medium text-foreground"
                  >
                    {model.name}
                  </th>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums text-foreground">
                    {formatNumber(model.accuracy, 3)}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums text-foreground">
                    {formatNumber(model.qwk, 3)}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums text-foreground">
                    {formatNumber(model.mae, 3)}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums text-foreground">
                    {formatNumber(model.log_score, 3)}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {model.is_selected ? (
                      <Badge tone="success">
                        {DASHBOARD_COMPARISON_SECTION.selectedBadge}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">
                        {DASHBOARD_COMPARISON_SECTION.archivedBadge}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function formatNumber(value: number | undefined, digits: number): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "—";
}
