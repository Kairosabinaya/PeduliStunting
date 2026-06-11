import type { ChildImmunization } from "@/domain/health-plan/entities/child-immunization";
import type { ChildMilestone } from "@/domain/health-plan/entities/child-milestone";
import type { Immunization } from "@/domain/health-plan/entities/immunization";
import type { Milestone } from "@/domain/health-plan/entities/milestone";

export interface ImmunizationDto {
  readonly code: string;
  readonly name: string;
  readonly doseNumber: number | null;
  readonly recommendedAgeMonths: number | null;
  readonly notes: string | null;
  readonly prevents: string | null;
  readonly displayOrder: number;
}

export interface ChildImmunizationDto {
  readonly id: string;
  readonly userId: string;
  readonly childId: string;
  readonly immunizationCode: string;
  readonly status: "pending" | "done" | "skipped";
  readonly givenAt: string | null;
  readonly note: string | null;
}

export interface MilestoneDto {
  readonly id: string;
  readonly code: string;
  readonly domain: "gross_motor" | "fine_motor" | "language" | "social";
  readonly minAgeMonths: number;
  readonly maxAgeMonths: number;
  readonly description: string;
  readonly sourceLabel: string | null;
  readonly displayOrder: number;
}

export interface ChildMilestoneDto {
  readonly id: string;
  readonly userId: string;
  readonly childId: string;
  readonly milestoneId: string;
  readonly status: "not_checked" | "achieved" | "delayed";
  readonly checkedAt: string | null;
  readonly note: string | null;
}

export function toImmunizationDto(item: Immunization): ImmunizationDto {
  return {
    code: item.code,
    name: item.name,
    doseNumber: item.doseNumber,
    recommendedAgeMonths: item.recommendedAgeMonths,
    notes: item.notes,
    prevents: item.prevents,
    displayOrder: item.displayOrder,
  };
}

export function toChildImmunizationDto(
  item: ChildImmunization,
): ChildImmunizationDto {
  return {
    id: item.id,
    userId: item.userId,
    childId: item.childId,
    immunizationCode: item.immunizationCode,
    status: item.status,
    givenAt: item.givenAt,
    note: item.note,
  };
}

export function toMilestoneDto(item: Milestone): MilestoneDto {
  return {
    id: item.id,
    code: item.code,
    domain: item.domain,
    minAgeMonths: item.minAgeMonths,
    maxAgeMonths: item.maxAgeMonths,
    description: item.description,
    sourceLabel: item.sourceLabel,
    displayOrder: item.displayOrder,
  };
}

export function toChildMilestoneDto(item: ChildMilestone): ChildMilestoneDto {
  return {
    id: item.id,
    userId: item.userId,
    childId: item.childId,
    milestoneId: item.milestoneId,
    status: item.status,
    checkedAt: item.checkedAt,
    note: item.note,
  };
}
