/**
 * trackerChildCondition tool (authenticated): summarise one child's growth,
 * immunization, milestone, or overall status. Returns only DERIVED status — never
 * the child's name or birth date (PII stays out of the model payload, ADR-0021).
 *
 * Ownership is enforced three ways: the tool is only assembled with a session,
 * the loader reads via getChildById(userId, childId), and RLS rejects cross-owner
 * reads at the database.
 */

import { z } from "zod";

import {
  toolFailure,
  type ChildConditionCard,
} from "@/application/ai/cards/ai-card";
import {
  TrackerDashboardViewModelBuilder,
  type TrackerDashboardViewModel,
} from "@/application/tracking/tracker-dashboard-view-model";
import {
  AI_CARD_TYPES,
  AI_CHILD_ASPECTS,
  type AiChildAspect,
} from "@/config/ai";
import { asChildId } from "@/domain/shared/ids";

import { defineTool, type AiToolDefinition } from "./ai-tool";
import type { TrackerToolContext } from "./tool-context";

export function createTrackerChildConditionTool(
  ctx: TrackerToolContext,
): AiToolDefinition {
  return defineTool({
    description:
      "Ringkas kondisi seorang anak milik pengguna: status pertumbuhan (z-score WHO), imunisasi, milestone, atau keseluruhan. Hanya status turunan, tanpa identitas anak.",
    inputSchema: z.object({
      childId: z.string().uuid(),
      aspect: z.enum(AI_CHILD_ASPECTS),
    }),
    execute: async ({ childId, aspect }) => {
      const result = await ctx.loadChildOverview(
        ctx.session.userId,
        asChildId(childId),
      );
      if (!result.ok) {
        const reason =
          result.error.kind === "not_found"
            ? "not_found"
            : result.error.kind === "forbidden"
              ? "forbidden"
              : "no_data";
        return toolFailure(
          reason,
          "Data anak tidak tersedia atau bukan milik Anda.",
        );
      }
      const overview = result.value;
      const viewModel = new TrackerDashboardViewModelBuilder().build({
        child: overview.child,
        childAgeMonths: overview.childAgeMonths,
        measurements: overview.measurements,
        immunizationSchedule: overview.immunizationSchedule,
        childImmunizations: overview.childImmunizations,
        milestoneCatalog: overview.milestoneCatalog,
        childMilestones: overview.childMilestones,
      });
      return buildChildConditionCard(aspect, viewModel);
    },
  });
}

function buildChildConditionCard(
  aspect: AiChildAspect,
  vm: TrackerDashboardViewModel,
): ChildConditionCard {
  const growth = {
    overallRiskLevel: vm.overallRiskLevel,
    growthStatuses: vm.growthStatuses.map((status) => ({
      indicator: status.indicator,
      zScore: status.zScore,
      sdClass: status.sdClass,
      riskLevel: status.riskLevel,
    })),
  };
  const immunization = {
    immunizationProgress: vm.immunizationProgress,
    immunizationsUpcoming: vm.immunizationsUpcoming.map(pickImmunization),
    immunizationsMissed: vm.immunizationsMissed.map(pickImmunization),
  };
  const milestone = { milestoneAlert: vm.milestoneAlert };
  const base = {
    type: AI_CARD_TYPES.childCondition,
    aspect,
    childAgeMonths: vm.childAgeMonths,
  } as const;

  switch (aspect) {
    case "growth":
      return { ...base, ...growth };
    case "immunization":
      return { ...base, ...immunization };
    case "milestone":
      return { ...base, ...milestone };
    case "overall":
      return { ...base, ...growth, ...immunization, ...milestone };
  }
}

function pickImmunization(item: {
  readonly code: string;
  readonly name: string;
  readonly recommendedAgeMonths: number | null;
}): {
  readonly code: string;
  readonly name: string;
  readonly recommendedAgeMonths: number | null;
} {
  return {
    code: item.code,
    name: item.name,
    recommendedAgeMonths: item.recommendedAgeMonths,
  };
}
