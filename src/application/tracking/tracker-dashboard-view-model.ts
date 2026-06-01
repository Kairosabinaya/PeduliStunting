import type {
  ChildImmunizationDto,
  ChildMilestoneDto,
  ImmunizationDto,
  MilestoneDto,
} from "@/application/health-plan/dtos";
import type {
  ChildDto,
  GrowthMeasurementDto,
} from "@/application/tracking/dtos";
import {
  computeImmunizationCellStatus,
  computeImmunizationProgress,
  type ImmunizationCellStatus,
  type ImmunizationProgressTotals,
} from "@/domain/health-plan/services/immunization-status";
import {
  computeMilestoneAlert,
  type MilestoneAlertResult,
} from "@/domain/health-plan/services/milestone-status";
import {
  GROWTH_INDICATORS,
  type GrowthIndicator,
} from "@/domain/tracking/value-objects/growth-indicator";
import {
  SD_CLASSES,
  type SdClass,
} from "@/domain/tracking/value-objects/sd-classification";

export type TrackerRiskLevel = "empty" | "normal" | "watch" | "urgent";

export interface TrackerGrowthIndicatorStatus {
  readonly indicator: GrowthIndicator;
  readonly measuredAt: string;
  readonly zScore: number;
  readonly sdClass: SdClass;
  readonly riskLevel: TrackerRiskLevel;
  readonly weightKg: number | null;
  readonly heightCm: number | null;
  readonly headCircumferenceCm: number | null;
  readonly muacCm: number | null;
}

export interface TrackerImmunizationItemStatus {
  readonly code: string;
  readonly name: string;
  readonly recommendedAgeMonths: number | null;
  readonly status: ImmunizationCellStatus;
}

export interface TrackerDashboardViewModel {
  readonly child: ChildDto;
  readonly childAgeMonths: number;
  readonly latestMeasurement: GrowthMeasurementDto | null;
  readonly growthStatuses: readonly TrackerGrowthIndicatorStatus[];
  readonly overallRiskLevel: TrackerRiskLevel;
  readonly immunizationProgress: ImmunizationProgressTotals;
  readonly immunizationsDue: readonly TrackerImmunizationItemStatus[];
  readonly immunizationsUpcoming: readonly TrackerImmunizationItemStatus[];
  readonly immunizationsMissed: readonly TrackerImmunizationItemStatus[];
  readonly milestoneAlert: MilestoneAlertResult;
}

export interface TrackerDashboardViewModelInput {
  readonly child: ChildDto;
  readonly childAgeMonths: number;
  readonly measurements: readonly GrowthMeasurementDto[];
  readonly immunizationSchedule: readonly ImmunizationDto[];
  readonly childImmunizations: readonly ChildImmunizationDto[];
  readonly milestoneCatalog: readonly MilestoneDto[];
  readonly childMilestones: readonly ChildMilestoneDto[];
}

/**
 * Builds the dashboard-specific DTO for `/tracker`. The class keeps ranking
 * and prioritisation out of React components while leaving display copy in
 * `src/config/tracker.ts`.
 *
 * @example
 * ```ts
 * const model = new TrackerDashboardViewModelBuilder().build({
 *   child,
 *   childAgeMonths,
 *   measurements,
 *   immunizationSchedule,
 *   childImmunizations,
 *   milestoneCatalog,
 *   childMilestones,
 * });
 * ```
 */
export class TrackerDashboardViewModelBuilder {
  build(input: TrackerDashboardViewModelInput): TrackerDashboardViewModel {
    const sortedMeasurements = sortMeasurements(input.measurements);
    const latestMeasurement = sortedMeasurements[0] ?? null;
    const growthStatuses = buildGrowthStatuses(sortedMeasurements);
    const overallRiskLevel = resolveOverallRiskLevel(growthStatuses);
    const recordByCode = new Map(
      input.childImmunizations.map((record) => [
        record.immunizationCode,
        record,
      ]),
    );
    const immunizationStatuses = input.immunizationSchedule
      .map((item): TrackerImmunizationItemStatus => {
        const record = recordByCode.get(item.code);
        return {
          code: item.code,
          name: item.name,
          recommendedAgeMonths: item.recommendedAgeMonths,
          status: computeImmunizationCellStatus({
            recommendedAgeMonths: item.recommendedAgeMonths,
            childAgeMonths: input.childAgeMonths,
            recordStatus: record?.status ?? null,
          }),
        };
      })
      .sort(compareImmunizationStatus);

    const progress = computeImmunizationProgress(
      input.immunizationSchedule.map((item) => ({
        recommendedAgeMonths: item.recommendedAgeMonths,
        recordStatus: recordByCode.get(item.code)?.status ?? null,
      })),
      input.childAgeMonths,
    );

    const milestoneAlert = computeMilestoneAlert(
      input.milestoneCatalog.map((item) => ({
        id: item.id,
        domain: item.domain,
        minAgeMonths: item.minAgeMonths,
        maxAgeMonths: item.maxAgeMonths,
      })),
      input.childMilestones.map((record) => ({
        milestoneId: record.milestoneId,
        status: record.status,
      })),
      input.childAgeMonths,
    );

    return {
      child: input.child,
      childAgeMonths: input.childAgeMonths,
      latestMeasurement,
      growthStatuses,
      overallRiskLevel,
      immunizationProgress: progress,
      immunizationsDue: immunizationStatuses.filter(isDue),
      immunizationsUpcoming: immunizationStatuses.filter(
        (item) => item.status === "future",
      ),
      immunizationsMissed: immunizationStatuses.filter(
        (item) => item.status === "missed",
      ),
      milestoneAlert,
    };
  }
}

function sortMeasurements(
  measurements: readonly GrowthMeasurementDto[],
): readonly GrowthMeasurementDto[] {
  return [...measurements].sort((a, b) =>
    a.measuredAt < b.measuredAt ? 1 : a.measuredAt > b.measuredAt ? -1 : 0,
  );
}

function buildGrowthStatuses(
  sortedMeasurements: readonly GrowthMeasurementDto[],
): readonly TrackerGrowthIndicatorStatus[] {
  const statuses: TrackerGrowthIndicatorStatus[] = [];
  for (const indicator of GROWTH_INDICATORS) {
    const found = sortedMeasurements.find((measurement) => {
      const zScore = measurement.zScores[indicator];
      const sdClass = readSdClass(measurement.sdClass[indicator]);
      return typeof zScore === "number" && sdClass !== null;
    });
    if (!found) continue;
    const zScore = found.zScores[indicator];
    const sdClass = readSdClass(found.sdClass[indicator]);
    if (typeof zScore !== "number" || sdClass === null) continue;
    statuses.push({
      indicator,
      measuredAt: found.measuredAt,
      zScore,
      sdClass,
      riskLevel: riskLevelForSdClass(sdClass),
      weightKg: found.weightKg,
      heightCm: found.heightCm,
      headCircumferenceCm: found.headCircumferenceCm,
      muacCm: found.muacCm,
    });
  }
  return statuses;
}

function readSdClass(value: string | undefined): SdClass | null {
  if (value === undefined) return null;
  if ((SD_CLASSES as readonly string[]).includes(value)) {
    return value as SdClass;
  }
  return null;
}

function riskLevelForSdClass(sdClass: SdClass): TrackerRiskLevel {
  switch (sdClass) {
    case "buruk":
    case "obesitas":
    case "sangat_pendek":
    case "sangat_kurus":
    case "mikrosefali":
      return "urgent";
    case "kurang":
    case "lebih":
    case "pendek":
    case "kurus":
    case "gemuk":
    case "makrosefali":
      return "watch";
    case "normal":
    case "tinggi":
      return "normal";
  }
}

function resolveOverallRiskLevel(
  statuses: readonly TrackerGrowthIndicatorStatus[],
): TrackerRiskLevel {
  if (statuses.length === 0) return "empty";
  if (statuses.some((item) => item.riskLevel === "urgent")) return "urgent";
  if (statuses.some((item) => item.riskLevel === "watch")) return "watch";
  return "normal";
}

function compareImmunizationStatus(
  a: TrackerImmunizationItemStatus,
  b: TrackerImmunizationItemStatus,
): number {
  const aAge = a.recommendedAgeMonths ?? Number.MAX_SAFE_INTEGER;
  const bAge = b.recommendedAgeMonths ?? Number.MAX_SAFE_INTEGER;
  if (aAge !== bAge) return aAge - bAge;
  return a.code.localeCompare(b.code);
}

function isDue(item: TrackerImmunizationItemStatus): boolean {
  return item.status === "upcoming";
}
