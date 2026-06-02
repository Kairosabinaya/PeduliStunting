import { describe, expect, it } from "vitest";

import { isToolFailure } from "@/application/ai/cards/ai-card";
import { AppErrors } from "@/domain/errors/app-error";
import { err, ok } from "@/domain/shared/result";

import {
  fakeChildOverviewLoader,
  fakeLogger,
  fakeSession,
  makeChildOverview,
} from "../../../../tests/factories/ai";
import { createTrackerChildConditionTool } from "./tracker-child-condition-tool";
import type { TrackerToolContext } from "./tool-context";

const CHILD_ID = "22222222-2222-4222-8222-222222222222";

function ctx(
  loaderResult: Awaited<ReturnType<TrackerToolContext["loadChildOverview"]>>,
): TrackerToolContext {
  return {
    session: fakeSession(),
    loadChildOverview: fakeChildOverviewLoader(loaderResult),
    logger: fakeLogger(),
  };
}

describe("createTrackerChildConditionTool", () => {
  it("builds an overall card without exposing the child's name or birth date", async () => {
    const tool = createTrackerChildConditionTool(ctx(ok(makeChildOverview())));
    const result = await tool.execute({ childId: CHILD_ID, aspect: "overall" });
    if (isToolFailure(result)) throw new Error("expected a card");
    expect("type" in result && result.type).toBe("child-condition");
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("Budi");
    expect(serialized).not.toContain("2024-01-15");
  });

  it("maps a not-found child to a not_found failure", async () => {
    const tool = createTrackerChildConditionTool(
      ctx(err(AppErrors.notFound("tidak ada"))),
    );
    const result = await tool.execute({ childId: CHILD_ID, aspect: "growth" });
    expect(isToolFailure(result) && result.reason).toBe("not_found");
  });
});
