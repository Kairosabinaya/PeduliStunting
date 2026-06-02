import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AiRecommendedChips } from "./ai-recommended-chips";

describe("AiRecommendedChips", () => {
  it("renders question chips and calls onPick when one is clicked", async () => {
    const onPick = vi.fn();
    render(
      <AiRecommendedChips
        pageId="map"
        input={{ hasSelection: false }}
        onPick={onPick}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    await userEvent.click(buttons[0] as HTMLElement);
    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it("disables the chips when asked", () => {
    render(
      <AiRecommendedChips
        pageId="data"
        input={{ hasSelection: false }}
        onPick={vi.fn()}
        disabled
      />,
    );
    expect(screen.getAllByRole("button")[0]).toBeDisabled();
  });
});
