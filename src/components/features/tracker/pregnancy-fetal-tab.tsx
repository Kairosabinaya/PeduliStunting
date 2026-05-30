import { FETAL_MILESTONES } from "@/config/pregnancy";
import { PREGNANCY_FETAL_COPY } from "@/config/tracker";
import { pickFetalMilestone } from "@/domain/pregnancy/services/pregnancy-status";

export interface PregnancyFetalTabProps {
  readonly weeks: number;
}

export function PregnancyFetalTab({ weeks }: PregnancyFetalTabProps) {
  const current = pickFetalMilestone(weeks);

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {PREGNANCY_FETAL_COPY.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {PREGNANCY_FETAL_COPY.description}
        </p>
      </section>

      {current ? (
        <article className="space-y-2 rounded-lg border border-accent/40 bg-accent/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {PREGNANCY_FETAL_COPY.weekRangeFormat(
              current.fromWeek,
              current.toWeek,
            )}
          </p>
          <h4 className="text-base font-semibold text-foreground">
            {current.title}
          </h4>
          <p className="text-sm text-foreground">
            {current.size} — {current.comparison}.
          </p>
          <p className="text-sm text-muted-foreground">{current.note}</p>
        </article>
      ) : (
        <p className="rounded-md border border-border bg-surface-muted/50 p-3 text-sm text-muted-foreground">
          {PREGNANCY_FETAL_COPY.noMilestone}
        </p>
      )}

      <ol className="space-y-2">
        {FETAL_MILESTONES.map((milestone) => {
          const active =
            weeks >= milestone.fromWeek && weeks <= milestone.toWeek;
          return (
            <li
              key={milestone.title}
              className="rounded-md border border-border bg-surface p-3 text-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-foreground">
                  {milestone.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {PREGNANCY_FETAL_COPY.weekRangeFormat(
                    milestone.fromWeek,
                    milestone.toWeek,
                  )}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {milestone.size} — {milestone.comparison}.
              </p>
              {active ? (
                <p className="mt-1 text-xs font-medium text-primary">
                  Saat ini
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
