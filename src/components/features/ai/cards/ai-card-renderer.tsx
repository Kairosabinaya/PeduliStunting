import { isAiCard } from "@/application/ai/cards/ai-card";
import { AI_CARD_TYPES } from "@/config/ai";

import { ChildConditionCard } from "./child-condition-card";
import { CompareRegionsCard } from "./compare-regions-card";
import { RankRegionsCard } from "./rank-regions-card";
import { RegionPredictionCard } from "./region-prediction-card";
import { RegionTrendCard } from "./region-trend-card";

/** Render a tool result as its matching card, or nothing for non-card outputs. */
export function AiCardRenderer({ output }: { readonly output: unknown }) {
  if (!isAiCard(output)) return null;
  switch (output.type) {
    case AI_CARD_TYPES.compareRegions:
      return <CompareRegionsCard card={output} />;
    case AI_CARD_TYPES.rankRegions:
      return <RankRegionsCard card={output} />;
    case AI_CARD_TYPES.regionTrend:
      return <RegionTrendCard card={output} />;
    case AI_CARD_TYPES.regionPrediction:
      return <RegionPredictionCard card={output} />;
    case AI_CARD_TYPES.childCondition:
      return <ChildConditionCard card={output} />;
  }
}
