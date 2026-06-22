/**
 * Structured card payloads returned by AI tools and rendered by the client.
 *
 * This discriminated union is the single contract shared between tool `execute`
 * outputs (server) and the card renderers (client). Field types reuse existing
 * DTO/value-object types so there is no schema drift.
 */

import { AI_CARD_TYPES, type AiChildAspect } from "@/config/ai";
import type { RegionIndicatorsDto } from "@/application/region/dtos";
import type { TrackerRiskLevel } from "@/application/tracking/tracker-dashboard-view-model";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

/** Ordinal stunting category label, reused from the region DTO. */
export type StuntingCategoryLabel = RegionIndicatorsDto["yCategory"];

/** Why a tool produced no card. Tools never throw; they return this instead. */
export type ToolFailureReason =
  | "not_found"
  | "no_data"
  | "forbidden"
  | "invalid";

export interface ToolFailure {
  readonly ok: false;
  readonly reason: ToolFailureReason;
  readonly message: string;
}

/** Lightweight region reference used inside cards and findRegion results. */
export interface RegionRef {
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
}

/** Result of the name-resolution tool (not rendered as a card on its own). */
export interface FindRegionResult {
  readonly ok: true;
  readonly matches: readonly RegionRef[];
}

export interface CompareRegionsCard {
  readonly type: typeof AI_CARD_TYPES.compareRegions;
  readonly tahun: number;
  readonly rows: readonly {
    readonly kodeBps: string;
    readonly kabupatenKota: string;
    readonly provinsi: string;
    readonly prevalence: number | null;
    readonly category: StuntingCategoryLabel;
  }[];
}

export interface RankRegionsCard {
  readonly type: typeof AI_CARD_TYPES.rankRegions;
  readonly tahun: number;
  readonly order: "asc" | "desc";
  readonly rows: readonly {
    readonly rank: number;
    readonly kodeBps: string;
    readonly kabupatenKota: string;
    readonly provinsi: string;
    readonly prevalence: number | null;
    readonly category: StuntingCategoryLabel;
  }[];
}

export interface RegionTrendCard {
  readonly type: typeof AI_CARD_TYPES.regionTrend;
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly series: readonly {
    readonly tahun: number;
    readonly prevalence: number | null;
    readonly category: StuntingCategoryLabel;
  }[];
}

export interface RegionPredictionCard {
  readonly type: typeof AI_CARD_TYPES.regionPrediction;
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly tahun: number;
  readonly modelVersion: string;
  readonly predictedCategory: StuntingCategoryLabel;
  readonly probabilities: {
    readonly rendah: number | null;
    readonly sedang: number | null;
    readonly tinggi: number | null;
  };
}

/** Derived child status only. Never carries the child's name or birth date. */
export interface ChildConditionCard {
  readonly type: typeof AI_CARD_TYPES.childCondition;
  readonly aspect: AiChildAspect;
  readonly childAgeMonths: number;
  readonly overallRiskLevel?: TrackerRiskLevel;
  readonly growthStatuses?: readonly {
    readonly indicator: GrowthIndicator;
    readonly zScore: number;
    readonly sdClass: SdClass;
    readonly riskLevel: TrackerRiskLevel;
  }[];
  readonly immunizationProgress?: {
    readonly due: number;
    readonly done: number;
  };
  readonly immunizationsUpcoming?: readonly {
    readonly code: string;
    readonly name: string;
    readonly recommendedAgeMonths: number | null;
  }[];
  readonly immunizationsMissed?: readonly {
    readonly code: string;
    readonly name: string;
    readonly recommendedAgeMonths: number | null;
  }[];
  readonly milestoneAlert?: {
    readonly delayedCount: number;
    readonly notCheckedCount: number;
    readonly totalInRange: number;
    readonly shouldAlert: boolean;
  };
}

/** Every card a tool can emit. */
export type AiCard =
  | CompareRegionsCard
  | RankRegionsCard
  | RegionTrendCard
  | RegionPredictionCard
  | ChildConditionCard;

/** A tool result is either a card, the findRegion result, or a failure. */
export type AiToolOutput = AiCard | FindRegionResult | ToolFailure;

const CARD_TYPE_VALUES: readonly string[] = Object.values(AI_CARD_TYPES);

/**
 * Runtime guard narrowing an untrusted tool output to a known {@link AiCard} by
 * its discriminant. Used by the client renderer (boundary validation).
 */
export function isAiCard(output: unknown): output is AiCard {
  if (output === null || typeof output !== "object") return false;
  const type = (output as { type?: unknown }).type;
  return typeof type === "string" && CARD_TYPE_VALUES.includes(type);
}

/** Narrowing guard for the failure branch. */
export function isToolFailure(output: AiToolOutput): output is ToolFailure {
  return "ok" in output && output.ok === false;
}

/** Construct a structured tool failure (tools never throw). */
export function toolFailure(
  reason: ToolFailureReason,
  message: string,
): ToolFailure {
  return { ok: false, reason, message };
}
