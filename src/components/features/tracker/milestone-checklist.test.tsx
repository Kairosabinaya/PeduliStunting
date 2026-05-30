import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ChildMilestoneDto,
  MilestoneDto,
} from "@/application/health-plan/dtos";
import {
  MILESTONE_COPY,
  MILESTONE_DOMAIN_LABEL,
  MILESTONE_RANGE_FILTER_COPY,
} from "@/config/tracker";

import type { UpsertMilestoneFormState } from "@/app/(app)/tracker/anak/[childId]/perkembangan/_lib/upsert-milestone-state";

const upsertMock =
  vi.fn<
    (
      childId: string,
      milestoneId: string,
      previous: UpsertMilestoneFormState | null,
      formData: FormData,
    ) => Promise<UpsertMilestoneFormState>
  >();

vi.mock("@/app/(app)/tracker/anak/[childId]/perkembangan/actions", () => ({
  upsertChildMilestone: (
    childId: string,
    milestoneId: string,
    previous: UpsertMilestoneFormState | null,
    formData: FormData,
  ) => upsertMock(childId, milestoneId, previous, formData),
}));

const { MilestoneChecklist } = await import("./milestone-checklist");

const childId = "11111111-1111-1111-1111-111111111111";

const catalog: readonly MilestoneDto[] = [
  {
    id: "ms-1",
    code: "GM-001",
    domain: "gross_motor",
    minAgeMonths: 0,
    maxAgeMonths: 3,
    description: "Mengangkat kepala saat tengkurap",
    sourceLabel: "SDIDTK",
    displayOrder: 1,
  },
  {
    id: "ms-2",
    code: "LG-001",
    domain: "language",
    minAgeMonths: 0,
    maxAgeMonths: 3,
    description: "Bereaksi terhadap suara",
    sourceLabel: null,
    displayOrder: 1,
  },
  {
    id: "ms-3",
    code: "GM-002",
    domain: "gross_motor",
    minAgeMonths: 12,
    maxAgeMonths: 18,
    description: "Berdiri sendiri tanpa berpegangan",
    sourceLabel: "Buku KIA",
    displayOrder: 1,
  },
];

const records: readonly ChildMilestoneDto[] = [
  {
    id: "rec-1",
    userId: "user-1",
    childId,
    milestoneId: "ms-1",
    status: "achieved",
    checkedAt: "2024-04-01",
    note: "Sudah konsisten",
  },
];

describe("MilestoneChecklist", () => {
  beforeEach(() => {
    upsertMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the empty state when the catalog is empty", () => {
    render(
      <MilestoneChecklist
        childId={childId}
        childAgeMonths={2}
        catalog={[]}
        records={[]}
      />,
    );
    expect(screen.getByText(MILESTONE_COPY.emptyTitle)).toBeInTheDocument();
  });

  it("filters by current age range by default", () => {
    render(
      <MilestoneChecklist
        childId={childId}
        childAgeMonths={2}
        catalog={catalog}
        records={records}
      />,
    );
    expect(
      screen.getByText("Mengangkat kepala saat tengkurap"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Berdiri sendiri tanpa berpegangan"),
    ).not.toBeInTheDocument();
  });

  it("groups milestones by their development domain", () => {
    render(
      <MilestoneChecklist
        childId={childId}
        childAgeMonths={2}
        catalog={catalog}
        records={records}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: new RegExp(MILESTONE_DOMAIN_LABEL.gross_motor),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: new RegExp(MILESTONE_DOMAIN_LABEL.language),
      }),
    ).toBeInTheDocument();
  });

  it("shows all ranges when the user toggles to 'Semua rentang'", async () => {
    const user = userEvent.setup();
    render(
      <MilestoneChecklist
        childId={childId}
        childAgeMonths={2}
        catalog={catalog}
        records={records}
      />,
    );
    await user.click(
      screen.getByRole("radio", {
        name: MILESTONE_RANGE_FILTER_COPY.optionAll,
      }),
    );
    expect(
      screen.getByText("Berdiri sendiri tanpa berpegangan"),
    ).toBeInTheDocument();
  });
});
