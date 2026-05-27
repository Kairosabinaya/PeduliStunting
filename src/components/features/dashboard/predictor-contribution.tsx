import type { IndicatorDefinitionDto } from "@/application/region/dtos";
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
import { DASHBOARD_CONTRIBUTION_SECTION } from "@/config/dashboard";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";

export interface PredictorContributionProps {
  readonly result: Result<readonly IndicatorDefinitionDto[], AppError>;
}

type ContributionGroupKey = "protective" | "risk" | "neutral";

interface ContributionGroupConfig {
  readonly key: ContributionGroupKey;
  readonly title: string;
  readonly description: string;
  readonly tone: "success" | "warning" | "neutral";
}

const GROUP_CONFIG: readonly ContributionGroupConfig[] = [
  {
    key: "protective",
    title: DASHBOARD_CONTRIBUTION_SECTION.protectiveTitle,
    description: DASHBOARD_CONTRIBUTION_SECTION.protectiveDescription,
    tone: "success",
  },
  {
    key: "risk",
    title: DASHBOARD_CONTRIBUTION_SECTION.riskTitle,
    description: DASHBOARD_CONTRIBUTION_SECTION.riskDescription,
    tone: "warning",
  },
  {
    key: "neutral",
    title: DASHBOARD_CONTRIBUTION_SECTION.neutralTitle,
    description: DASHBOARD_CONTRIBUTION_SECTION.neutralDescription,
    tone: "neutral",
  },
];

export function PredictorContribution({ result }: PredictorContributionProps) {
  if (!result.ok) {
    return (
      <ErrorState
        title={DASHBOARD_CONTRIBUTION_SECTION.title}
        description={result.error.message}
      />
    );
  }

  const grouped = groupByDirection(result.value);
  const hasAnyDirected =
    (grouped.get("protective")?.length ?? 0) +
      (grouped.get("risk")?.length ?? 0) >
    0;

  if (!hasAnyDirected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{DASHBOARD_CONTRIBUTION_SECTION.title}</CardTitle>
          <CardDescription>
            {DASHBOARD_CONTRIBUTION_SECTION.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title={DASHBOARD_CONTRIBUTION_SECTION.emptyTitle}
            description={DASHBOARD_CONTRIBUTION_SECTION.emptyDescription}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{DASHBOARD_CONTRIBUTION_SECTION.title}</CardTitle>
        <CardDescription>
          {DASHBOARD_CONTRIBUTION_SECTION.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GROUP_CONFIG.map((group) => {
            const items = grouped.get(group.key) ?? [];
            if (items.length === 0) return null;
            return (
              <section
                key={group.key}
                aria-labelledby={`contrib-${group.key}`}
                className="rounded-lg border border-border bg-surface-muted/40 p-4"
              >
                <header className="mb-3 flex flex-wrap items-baseline gap-2">
                  <h3
                    id={`contrib-${group.key}`}
                    className="text-base font-semibold text-foreground"
                  >
                    {group.title}
                  </h3>
                  <Badge tone={group.tone}>{items.length}</Badge>
                </header>
                <p className="mb-3 text-xs text-muted-foreground">
                  {group.description}
                </p>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.code}
                      className="rounded-md border border-border bg-surface px-3 py-2"
                    >
                      <p className="flex items-baseline gap-2">
                        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                          {item.code}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {item.name}
                        </span>
                      </p>
                      {item.description ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function groupByDirection(
  items: readonly IndicatorDefinitionDto[],
): Map<ContributionGroupKey, IndicatorDefinitionDto[]> {
  const map = new Map<ContributionGroupKey, IndicatorDefinitionDto[]>();
  for (const item of items) {
    if (item.dimension === "outcome") continue;
    const key = normaliseDirection(item.effectDirection);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  for (const bucket of map.values()) {
    bucket.sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true }),
    );
  }
  return map;
}

function normaliseDirection(
  direction: string | null | undefined,
): ContributionGroupKey {
  if (direction === "protective" || direction === "risk") return direction;
  return "neutral";
}
