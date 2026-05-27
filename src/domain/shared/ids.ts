import type { Brand } from "./brand";

/**
 * Branded identifiers used across bounded contexts.
 *
 * Branding prevents accidental cross-assignment between `UserId` and
 * `ChildId` even though both are strings at runtime. Construct them via the
 * `is*` predicates or by parsing through a Zod schema at the boundary.
 */

export type UserId = Brand<string, "UserId">;
export type ChildId = Brand<string, "ChildId">;
export type MeasurementId = Brand<string, "MeasurementId">;
export type ArticleId = Brand<string, "ArticleId">;
export type MilestoneId = Brand<string, "MilestoneId">;
export type ChildImmunizationId = Brand<string, "ChildImmunizationId">;
export type ChildMilestoneId = Brand<string, "ChildMilestoneId">;
export type ModelVersion = Brand<string, "ModelVersion">;
export type ImmunizationCode = Brand<string, "ImmunizationCode">;
export type IndicatorCode = Brand<string, "IndicatorCode">;
export type Slug = Brand<string, "Slug">;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function asUserId(value: string): UserId {
  return value as UserId;
}
export function asChildId(value: string): ChildId {
  return value as ChildId;
}
export function asMeasurementId(value: string): MeasurementId {
  return value as MeasurementId;
}
export function asArticleId(value: string): ArticleId {
  return value as ArticleId;
}
export function asMilestoneId(value: string): MilestoneId {
  return value as MilestoneId;
}
export function asChildImmunizationId(value: string): ChildImmunizationId {
  return value as ChildImmunizationId;
}
export function asChildMilestoneId(value: string): ChildMilestoneId {
  return value as ChildMilestoneId;
}
export function asModelVersion(value: string): ModelVersion {
  return value as ModelVersion;
}
export function asImmunizationCode(value: string): ImmunizationCode {
  return value as ImmunizationCode;
}
export function asIndicatorCode(value: string): IndicatorCode {
  return value as IndicatorCode;
}
export function asSlug(value: string): Slug {
  return value as Slug;
}
