import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ChildDto } from "@/application/tracking/dtos";
import { CHILD_DETAIL_COPY } from "@/config/tracker";

import { ChildDetailHeaderClient } from "./child-detail-header-client";

// DeleteChildButton (rendered as a sibling) navigates + toasts on success, so
// the app-router and toast surfaces are stubbed for the render.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/notify", () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn(), action: vi.fn() },
}));

const CHILD_ID = "00000000-0000-0000-0000-000000000002";
const CHILD_NAME = "Aira";

const child: ChildDto = {
  id: CHILD_ID,
  userId: "00000000-0000-0000-0000-000000000001",
  name: CHILD_NAME,
  sex: "P",
  birthDate: "2024-01-15",
  birthWeightKg: 3.2,
  birthLengthCm: 49,
  gestationalAgeWeeks: 38,
  notes: null,
};

describe("ChildDetailHeaderClient", () => {
  it("links Edit to the child's edit route carrying both anak and modal params", () => {
    render(<ChildDetailHeaderClient child={child} />);

    const edit = screen.getByRole("link", {
      name: CHILD_DETAIL_COPY.editAriaLabel(CHILD_NAME),
    });
    const href = edit.getAttribute("href") ?? "";

    // Regression guard for the single-child dashboard bug: the edit modal
    // refuses to open without `?anak=`, so the trigger MUST include it.
    expect(href).toContain(`anak=${CHILD_ID}`);
    expect(href).toContain("modal=edit");
  });

  it("shows the child name and the editable label", () => {
    render(<ChildDetailHeaderClient child={child} />);

    expect(screen.getByText(CHILD_NAME)).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: CHILD_DETAIL_COPY.editAriaLabel(CHILD_NAME),
      }),
    ).toHaveTextContent(CHILD_DETAIL_COPY.editLabel);
  });
});
