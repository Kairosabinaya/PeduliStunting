import { ProgressRing } from "@/components/primitives/progress-ring";
import { PREGNANCY_PAGE_COPY, PREGNANCY_PROFILE_COPY } from "@/config/tracker";
import type { PregnancyOverview } from "@/domain/pregnancy/services/pregnancy-status";

export interface PregnancyOverviewHeaderProps {
  readonly overview: PregnancyOverview;
}

/**
 * Card ringkasan di atas tab content: progress ring usia kehamilan
 * (proporsi minggu / 40) + trimester + perkiraan tanggal lahir.
 */
export function PregnancyOverviewHeader({
  overview,
}: PregnancyOverviewHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <ProgressRing
        value={overview.gestational.weeks}
        total={40}
        size={88}
        strokeWidth={9}
        arcColorClass="text-primary"
        ariaLabel={`${overview.gestational.weeks} minggu dari 40`}
      >
        <span className="text-2xl font-bold leading-none text-foreground">
          {overview.gestational.weeks}
        </span>
        <span className="text-xs text-muted-foreground">/ 40 minggu</span>
      </ProgressRing>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {PREGNANCY_PAGE_COPY.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {PREGNANCY_PROFILE_COPY.gestationalLabel}:{" "}
          {PREGNANCY_PROFILE_COPY.gestationalFormat(
            overview.gestational.weeks,
            overview.gestational.days,
          )}{" "}
          · {PREGNANCY_PROFILE_COPY.trimesterFormat(overview.trimester)}
        </p>
        {overview.daysToDueDate !== null ? (
          <p className="text-xs text-muted-foreground">
            {PREGNANCY_PROFILE_COPY.daysToDueFormat(overview.daysToDueDate)}
          </p>
        ) : null}
      </div>
    </header>
  );
}
