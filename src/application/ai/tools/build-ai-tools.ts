/**
 * Assemble the page-scoped tool set. Tracker tools are exposed ONLY when an
 * authenticated tracker context is provided, so public pages can never reach
 * child data through a tool.
 */

import { AI_TOOL_NAMES, type AiPageId } from "@/config/ai";

import type { AiToolSet } from "./ai-tool";
import { createCompareRegionsTool } from "./compare-regions-tool";
import { createFindRegionTool } from "./find-region-tool";
import { createRankRegionsTool } from "./rank-regions-tool";
import { createRegionPredictionTool } from "./region-prediction-tool";
import { createRegionTrendTool } from "./region-trend-tool";
import { createTrackerChildConditionTool } from "./tracker-child-condition-tool";
import type { AiToolContext, TrackerToolContext } from "./tool-context";

export interface BuildAiToolsInput {
  readonly pageId: AiPageId;
  readonly regionContext: AiToolContext;
  /** Present only for an authenticated tracker request. */
  readonly trackerContext?: TrackerToolContext;
}

export function buildAiTools(input: BuildAiToolsInput): AiToolSet {
  const { pageId, regionContext, trackerContext } = input;

  if (pageId === "tracker") {
    if (!trackerContext) return {};
    return {
      [AI_TOOL_NAMES.trackerChildCondition]:
        createTrackerChildConditionTool(trackerContext),
    };
  }

  const tools: AiToolSet = {
    [AI_TOOL_NAMES.findRegion]: createFindRegionTool(regionContext),
    [AI_TOOL_NAMES.compareRegions]: createCompareRegionsTool(regionContext),
    [AI_TOOL_NAMES.rankRegions]: createRankRegionsTool(regionContext),
    [AI_TOOL_NAMES.regionTrend]: createRegionTrendTool(regionContext),
  };
  if (pageId === "map" || pageId === "prediksi") {
    tools[AI_TOOL_NAMES.regionPrediction] =
      createRegionPredictionTool(regionContext);
  }
  return tools;
}
