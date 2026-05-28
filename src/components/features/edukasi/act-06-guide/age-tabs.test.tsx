import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { GUIDE_TABS } from "@/data/edukasi/guide-content";

import { AgeTabs } from "./age-tabs";

describe("AgeTabs", () => {
  it("renders every tab as a tab button", () => {
    render(<AgeTabs />);
    GUIDE_TABS.forEach((tab) => {
      expect(
        screen.getByRole("tab", { name: new RegExp(tab.label, "i") }),
      ).toBeInTheDocument();
    });
  });

  it("activates the first tab by default", () => {
    render(<AgeTabs />);
    const firstTab = GUIDE_TABS[0];
    if (!firstTab) throw new Error("expected at least one tab");
    expect(
      screen.getByRole("tab", { name: new RegExp(firstTab.label, "i") }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("switches the active tab when clicked", async () => {
    const user = userEvent.setup();
    render(<AgeTabs />);
    const second = GUIDE_TABS[1];
    if (!second) throw new Error("expected at least two tabs");
    await user.click(
      screen.getByRole("tab", { name: new RegExp(second.label, "i") }),
    );
    expect(
      screen.getByRole("tab", { name: new RegExp(second.label, "i") }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("supports keyboard nav with ArrowRight", async () => {
    const user = userEvent.setup();
    render(<AgeTabs />);
    const first = GUIDE_TABS[0];
    const second = GUIDE_TABS[1];
    if (!first || !second) throw new Error("expected at least two tabs");
    const firstButton = screen.getByRole("tab", {
      name: new RegExp(first.label, "i"),
    });
    firstButton.focus();
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("tab", { name: new RegExp(second.label, "i") }),
    ).toHaveAttribute("aria-selected", "true");
  });
});
