import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NUTRITION_PAGE_COPY } from "@/config/tracker";

vi.mock("@/app/(app)/tracker/anak/[childId]/gizi/actions", () => ({
  recordNutritionEvent: vi.fn(async () => ({ ok: true })),
  deleteNutritionEvent: vi.fn(async () => ({ ok: true })),
}));

const { NutritionTabs } = await import("./nutrition-tabs");

const childId = "11111111-1111-1111-1111-111111111111";

describe("NutritionTabs", () => {
  it("renders four tab buttons", () => {
    render(<NutritionTabs childId={childId} childAgeMonths={4} events={[]} />);
    expect(
      screen.getByRole("tab", { name: NUTRITION_PAGE_COPY.tabs.asi }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: NUTRITION_PAGE_COPY.tabs.mpasi }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: NUTRITION_PAGE_COPY.tabs.vitA }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: NUTRITION_PAGE_COPY.tabs.cacing }),
    ).toBeInTheDocument();
  });

  it("ASI tab is active by default", () => {
    render(<NutritionTabs childId={childId} childAgeMonths={4} events={[]} />);
    const asiTab = screen.getByRole("tab", {
      name: NUTRITION_PAGE_COPY.tabs.asi,
    });
    expect(asiTab.getAttribute("aria-selected")).toBe("true");
  });

  it("switches to MPASI when its tab is clicked", async () => {
    const user = userEvent.setup();
    render(<NutritionTabs childId={childId} childAgeMonths={8} events={[]} />);
    await user.click(
      screen.getByRole("tab", { name: NUTRITION_PAGE_COPY.tabs.mpasi }),
    );
    const mpasiTab = screen.getByRole("tab", {
      name: NUTRITION_PAGE_COPY.tabs.mpasi,
    });
    expect(mpasiTab.getAttribute("aria-selected")).toBe("true");
  });
});
