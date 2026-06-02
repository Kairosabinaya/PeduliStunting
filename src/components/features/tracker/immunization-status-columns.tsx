import type { TrackerImmunizationItemStatus } from "@/application/tracking/tracker-dashboard-view-model";
import { TRACKER_DASHBOARD_COPY } from "@/config/tracker";

export interface ImmunizationStatusColumnsProps {
  /** Vaccines within the +/-1 month window (canonical status `upcoming`). */
  readonly upcoming: readonly TrackerImmunizationItemStatus[];
  /** Vaccines more than a month away (canonical status `future`). */
  readonly future: readonly TrackerImmunizationItemStatus[];
  /** Vaccines more than a month overdue (canonical status `missed`). */
  readonly missed: readonly TrackerImmunizationItemStatus[];
}

/**
 * The three-column immunization triage on the `/tracker` dashboard. Each column
 * carries the same label the timeline cell uses for that status, so a vaccine
 * never reads "Akan datang" here and "Belum waktunya" on the cell below it.
 *
 * @example
 * ```tsx
 * <ImmunizationStatusColumns
 *   upcoming={model.immunizationsUpcoming}
 *   future={model.immunizationsFuture}
 *   missed={model.immunizationsMissed}
 * />
 * ```
 */
export function ImmunizationStatusColumns({
  upcoming,
  future,
  missed,
}: ImmunizationStatusColumnsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <ImmunizationStatusList
        title={TRACKER_DASHBOARD_COPY.immunization.upcomingTitle}
        empty={TRACKER_DASHBOARD_COPY.immunization.emptyUpcoming}
        items={upcoming}
      />
      <ImmunizationStatusList
        title={TRACKER_DASHBOARD_COPY.immunization.futureTitle}
        empty={TRACKER_DASHBOARD_COPY.immunization.emptyFuture}
        items={future}
      />
      <ImmunizationStatusList
        title={TRACKER_DASHBOARD_COPY.immunization.missedTitle}
        empty={TRACKER_DASHBOARD_COPY.immunization.emptyMissed}
        items={missed}
      />
    </div>
  );
}

function ImmunizationStatusList({
  title,
  empty,
  items,
}: {
  readonly title: string;
  readonly empty: string;
  readonly items: readonly TrackerImmunizationItemStatus[];
}) {
  return (
    <section
      aria-label={title}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {items.length > 0 ? (
          <span className="text-xs font-medium text-muted-foreground">
            {TRACKER_DASHBOARD_COPY.immunization.countLabel(items.length)}
          </span>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{empty}</p>
      ) : (
        // The full list scrolls (scrollbar hidden) so nothing is dropped while
        // the column stays compact; the timeline below is the long-form view.
        <ul className="scrollbar-hide mt-3 max-h-72 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <li
              key={item.code}
              className="rounded-md border border-border bg-surface-muted px-3 py-2 text-xs"
            >
              <p className="font-semibold text-foreground">{item.name}</p>
              <p className="text-muted-foreground">
                {item.recommendedAgeMonths !== null
                  ? TRACKER_DASHBOARD_COPY.immunization.ageFormat(
                      item.recommendedAgeMonths,
                    )
                  : TRACKER_DASHBOARD_COPY.status.noValue}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
