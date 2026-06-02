import { describe, expect, it } from "vitest";

import { AI_TOOL_NAMES } from "@/config/ai";
import { ok } from "@/domain/shared/result";

import {
  fakeAiToolUseCases,
  fakeChildOverviewLoader,
  fakeLogger,
  fakeSession,
  makeChildOverview,
} from "../../../../tests/factories/ai";
import { buildAiTools } from "./build-ai-tools";
import type { AiToolContext, TrackerToolContext } from "./tool-context";

const regionContext: AiToolContext = {
  useCases: fakeAiToolUseCases(),
  logger: fakeLogger(),
};
const trackerContext: TrackerToolContext = {
  session: fakeSession(),
  loadChildOverview: fakeChildOverviewLoader(ok(makeChildOverview())),
  logger: fakeLogger(),
};

describe("buildAiTools", () => {
  it("exposes region tools including prediction on map", () => {
    const tools = buildAiTools({ pageId: "map", regionContext });
    expect(Object.keys(tools)).toContain(AI_TOOL_NAMES.findRegion);
    expect(Object.keys(tools)).toContain(AI_TOOL_NAMES.regionPrediction);
  });

  it("omits prediction on the data page", () => {
    const tools = buildAiTools({ pageId: "data", regionContext });
    expect(Object.keys(tools)).not.toContain(AI_TOOL_NAMES.regionPrediction);
  });

  it("exposes only the tracker tool when authenticated", () => {
    const tools = buildAiTools({
      pageId: "tracker",
      regionContext,
      trackerContext,
    });
    expect(Object.keys(tools)).toEqual([AI_TOOL_NAMES.trackerChildCondition]);
  });

  it("exposes no tools on tracker without a session", () => {
    const tools = buildAiTools({ pageId: "tracker", regionContext });
    expect(Object.keys(tools)).toHaveLength(0);
  });
});
