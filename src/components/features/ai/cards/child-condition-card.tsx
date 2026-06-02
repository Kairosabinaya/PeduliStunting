import type { ChildConditionCard as ChildConditionCardModel } from "@/application/ai/cards/ai-card";
import type { TrackerRiskLevel } from "@/application/tracking/tracker-dashboard-view-model";
import { cn } from "@/lib/cn";

function riskTone(level: TrackerRiskLevel): string {
  switch (level) {
    case "urgent":
      return "text-danger";
    case "watch":
      return "text-warning";
    case "normal":
      return "text-success";
    case "empty":
      return "text-muted-foreground";
  }
}

/**
 * Renders a child's derived condition (growth / immunization / milestone /
 * overall). Carries only derived status — never the child's name or birth date.
 *
 * @example
 * ```tsx
 * <ChildConditionCard card={{ type: "child-condition", aspect: "overall", childAgeMonths: 12 }} />
 * ```
 */
export function ChildConditionCard({
  card,
}: {
  readonly card: ChildConditionCardModel;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface/70 p-3 text-sm">
      <p className="text-xs font-medium text-muted-foreground">
        Kondisi anak (usia {card.childAgeMonths} bulan)
      </p>

      {card.overallRiskLevel ? (
        <p className="text-foreground">
          Risiko keseluruhan:{" "}
          <span
            className={cn("font-semibold", riskTone(card.overallRiskLevel))}
          >
            {card.overallRiskLevel}
          </span>
        </p>
      ) : null}

      {card.growthStatuses && card.growthStatuses.length > 0 ? (
        <ul className="space-y-0.5">
          {card.growthStatuses.map((status) => (
            <li
              key={status.indicator}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-muted-foreground">{status.indicator}</span>
              <span className={cn("font-medium", riskTone(status.riskLevel))}>
                z {status.zScore.toFixed(2)} ({status.sdClass})
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {card.immunizationProgress ? (
        <p className="text-xs text-muted-foreground">
          Imunisasi: {card.immunizationProgress.done}/
          {card.immunizationProgress.due} selesai
          {card.immunizationsMissed && card.immunizationsMissed.length > 0
            ? `, ${card.immunizationsMissed.length} terlewat`
            : ""}
          .
        </p>
      ) : null}

      {card.milestoneAlert ? (
        <p className="text-xs text-muted-foreground">
          Milestone terlambat: {card.milestoneAlert.delayedCount} dari{" "}
          {card.milestoneAlert.totalInRange} pada rentang usia ini.
        </p>
      ) : null}
    </div>
  );
}
