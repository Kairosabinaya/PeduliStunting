import {
  TrackerDashboardViewModelBuilder,
  type TrackerDashboardViewModel,
  type TrackerGrowthIndicatorStatus,
  type TrackerImmunizationItemStatus,
  type TrackerRiskLevel,
} from "@/application/tracking/tracker-dashboard-view-model";
import type { ChildOverviewData } from "@/lib/child-overview";
import { Badge } from "@/components/primitives/badge";
import { buttonVariants } from "@/components/primitives/button";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import {
  GROWTH_INDICATOR_PARENT_LABEL,
  SD_CLASS_DISPLAY,
  TRACKER_DASHBOARD_COPY,
  TRACKER_FIELD_LIMITS,
} from "@/config/tracker";

import { GrowthChartCard } from "./growth-chart-card";
import { ImmunizationProgress } from "./immunization-progress";
import { ImmunizationTimeline } from "./immunization-timeline";
import { MeasurementForm } from "./measurement-form";
import { MeasurementHistory } from "./measurement-history";
import { MilestoneAlertBanner } from "./milestone-alert-banner";
import { MilestoneChecklist } from "./milestone-checklist";

export interface TrackerDashboardProps {
  readonly data: ChildOverviewData;
}

const STATUS_BADGE_TONE: Readonly<
  Record<TrackerRiskLevel, "neutral" | "success" | "warning" | "danger">
> = {
  empty: "neutral",
  normal: "success",
  watch: "warning",
  urgent: "danger",
};

/**
 * Main `/tracker` dashboard. It keeps the parent-facing experience focused on
 * growth screening, immunization, and age-relevant development checks.
 *
 * @example
 * ```tsx
 * <TrackerDashboard data={overview.value} />
 * ```
 */
export function TrackerDashboard({ data }: TrackerDashboardProps) {
  const model = new TrackerDashboardViewModelBuilder().build({
    child: data.child,
    childAgeMonths: data.childAgeMonths,
    measurements: data.measurements,
    immunizationSchedule: data.immunizationSchedule,
    childImmunizations: data.childImmunizations,
    milestoneCatalog: data.milestoneCatalog,
    childMilestones: data.childMilestones,
  });

  return (
    <div className="space-y-8">
      <TrackerStatusOverview model={model} />

      <section
        id={TRACKER_DASHBOARD_COPY.statusSectionId}
        className="scroll-mt-24 space-y-4"
      >
        <SectionHeader
          title={TRACKER_DASHBOARD_COPY.growth.title}
          description={TRACKER_DASHBOARD_COPY.growth.description}
        />
        <div className="grid gap-4 xl:grid-cols-3">
          <Card
            id={TRACKER_DASHBOARD_COPY.growth.addMeasurementAnchorId}
            elevation="sm"
            padding="md"
            className="space-y-4"
          >
            <header className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                {TRACKER_DASHBOARD_COPY.growth.addCardTitle}
              </h3>
              <p className="text-sm text-muted-foreground">
                {TRACKER_DASHBOARD_COPY.growth.addCardDescription}
              </p>
            </header>
            <MeasurementForm
              childId={data.child.id}
              childBirthDate={data.child.birthDate}
            />
          </Card>
          <div className="xl:col-span-2">
            <GrowthChartCard
              child={data.child}
              measurements={data.measurements}
            />
          </div>
        </div>
        <Card elevation="sm" padding="md" className="space-y-4">
          <header className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              {TRACKER_DASHBOARD_COPY.growth.historyTitle}
            </h3>
          </header>
          <MeasurementHistory measurements={data.measurements} />
        </Card>
      </section>

      <section
        id={TRACKER_DASHBOARD_COPY.immunizationSectionId}
        className="scroll-mt-24 space-y-4"
      >
        <SectionHeader
          title={TRACKER_DASHBOARD_COPY.immunization.title}
          description={TRACKER_DASHBOARD_COPY.immunization.description}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <ImmunizationProgress
            done={model.immunizationProgress.done}
            due={model.immunizationProgress.due}
          />
          <div className="lg:col-span-2">
            <ImmunizationStatusColumns model={model} />
          </div>
        </div>
        <Card elevation="sm" padding="md" className="space-y-4">
          <ImmunizationTimeline
            childId={data.child.id}
            childAgeMonths={data.childAgeMonths}
            schedule={data.immunizationSchedule}
            records={data.childImmunizations}
            childBirthDate={data.child.birthDate}
          />
        </Card>
      </section>

      <section
        id={TRACKER_DASHBOARD_COPY.developmentSectionId}
        className="scroll-mt-24 space-y-4"
      >
        <SectionHeader
          title={TRACKER_DASHBOARD_COPY.development.title}
          description={TRACKER_DASHBOARD_COPY.development.description}
        />
        {model.milestoneAlert.shouldAlert ? (
          <MilestoneAlertBanner
            delayedCount={model.milestoneAlert.delayedCount}
          />
        ) : null}
        <MilestoneChecklist
          childId={data.child.id}
          childAgeMonths={data.childAgeMonths}
          catalog={data.milestoneCatalog}
          records={data.childMilestones}
          childBirthDate={data.child.birthDate}
        />
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <header className="max-w-3xl space-y-1">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

function TrackerStatusOverview({
  model,
}: {
  readonly model: TrackerDashboardViewModel;
}) {
  const title = statusTitle(model.overallRiskLevel);
  const latestDate = model.latestMeasurement
    ? formatDate(model.latestMeasurement.measuredAt)
    : null;

  return (
    <Card elevation="md" padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge tone={STATUS_BADGE_TONE[model.overallRiskLevel]}>
            {TRACKER_DASHBOARD_COPY.risk[model.overallRiskLevel]}
          </Badge>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {TRACKER_DASHBOARD_COPY.status.description}
            </p>
          </div>
        </div>
        <a
          href={`#${TRACKER_DASHBOARD_COPY.growth.addMeasurementAnchorId}`}
          className={buttonVariants({ variant: "primary" })}
        >
          {TRACKER_DASHBOARD_COPY.status.addMeasurement}
        </a>
      </div>

      <dl className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface-muted p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {TRACKER_DASHBOARD_COPY.fields.age}
          </dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">
            {TRACKER_DASHBOARD_COPY.status.ageFormat(model.childAgeMonths)}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface-muted p-3 md:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {TRACKER_DASHBOARD_COPY.fields.measurement}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {latestDate
              ? TRACKER_DASHBOARD_COPY.status.lastMeasuredAt(latestDate)
              : TRACKER_DASHBOARD_COPY.status.emptyTitle}
          </dd>
        </div>
      </dl>

      {model.growthStatuses.length === 0 ? (
        <EmptyState
          title={TRACKER_DASHBOARD_COPY.status.emptyTitle}
          description={TRACKER_DASHBOARD_COPY.status.emptyDescription}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {model.growthStatuses.map((status) => (
            <GrowthStatusTile key={status.indicator} status={status} />
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        {TRACKER_DASHBOARD_COPY.status.source}
      </p>
    </Card>
  );
}

function GrowthStatusTile({
  status,
}: {
  readonly status: TrackerGrowthIndicatorStatus;
}) {
  const display = SD_CLASS_DISPLAY[status.sdClass];
  return (
    <li className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {GROWTH_INDICATOR_PARENT_LABEL[status.indicator]}
        </p>
        <Badge tone={display.tone}>{display.label}</Badge>
      </div>
      <p className="mt-3 text-lg font-semibold text-foreground">
        {formatIndicatorValue(status)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {TRACKER_DASHBOARD_COPY.fields.zScore} {formatSigned(status.zScore)}
      </p>
    </li>
  );
}

function ImmunizationStatusColumns({
  model,
}: {
  readonly model: TrackerDashboardViewModel;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <ImmunizationStatusList
        title={TRACKER_DASHBOARD_COPY.immunization.dueTitle}
        empty={TRACKER_DASHBOARD_COPY.immunization.emptyDue}
        items={model.immunizationsDue}
      />
      <ImmunizationStatusList
        title={TRACKER_DASHBOARD_COPY.immunization.upcomingTitle}
        empty={TRACKER_DASHBOARD_COPY.immunization.emptyUpcoming}
        items={model.immunizationsUpcoming}
      />
      <ImmunizationStatusList
        title={TRACKER_DASHBOARD_COPY.immunization.missedTitle}
        empty={TRACKER_DASHBOARD_COPY.immunization.emptyMissed}
        items={model.immunizationsMissed}
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
  const visibleItems = items.slice(
    0,
    TRACKER_FIELD_LIMITS.dashboardImmunizationPreviewCount,
  );
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {visibleItems.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {visibleItems.map((item) => (
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

function statusTitle(level: TrackerRiskLevel): string {
  switch (level) {
    case "empty":
      return TRACKER_DASHBOARD_COPY.status.emptyTitle;
    case "normal":
      return TRACKER_DASHBOARD_COPY.status.titleNormal;
    case "watch":
      return TRACKER_DASHBOARD_COPY.status.titleWatch;
    case "urgent":
      return TRACKER_DASHBOARD_COPY.status.titleUrgent;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}

function formatMeasurement(
  value: number | null,
  unit: "kilogram" | "centimeter",
): string {
  return value === null
    ? TRACKER_DASHBOARD_COPY.status.noValue
    : `${value} ${TRACKER_DASHBOARD_COPY.units[unit]}`;
}

function formatIndicatorValue(status: TrackerGrowthIndicatorStatus): string {
  switch (status.indicator) {
    case "BB_U":
      return formatMeasurement(status.weightKg, "kilogram");
    case "TB_U":
      return formatMeasurement(status.heightCm, "centimeter");
    case "BB_TB":
      return `${formatMeasurement(status.weightKg, "kilogram")} / ${formatMeasurement(status.heightCm, "centimeter")}`;
    case "LK_U":
      return formatMeasurement(status.headCircumferenceCm, "centimeter");
  }
}
