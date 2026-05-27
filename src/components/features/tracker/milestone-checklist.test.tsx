import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ChildMilestoneDto,
  MilestoneDto,
} from "@/application/health-plan/dtos";
import {
  MILESTONE_COPY,
  MILESTONE_DOMAIN_LABEL,
  MILESTONE_STATUS_LABEL,
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
    render(<MilestoneChecklist childId={childId} catalog={[]} records={[]} />);
    expect(screen.getByText(MILESTONE_COPY.emptyTitle)).toBeInTheDocument();
  });

  it("groups milestones by their development domain", () => {
    render(
      <MilestoneChecklist
        childId={childId}
        catalog={catalog}
        records={records}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: MILESTONE_DOMAIN_LABEL.gross_motor,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: MILESTONE_DOMAIN_LABEL.language,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: MILESTONE_DOMAIN_LABEL.fine_motor,
      }),
    ).not.toBeInTheDocument();
  });

  it("pre-fills row inputs from an existing record", () => {
    render(
      <MilestoneChecklist
        childId={childId}
        catalog={catalog}
        records={records}
      />,
    );
    const statusSelects = screen.getAllByLabelText(
      MILESTONE_COPY.statusLabel,
    ) as HTMLSelectElement[];
    expect(statusSelects[0]?.value).toBe("achieved");
    expect(statusSelects[1]?.value).toBe("not_checked");

    const dates = screen.getAllByLabelText(
      MILESTONE_COPY.checkedAtLabel,
    ) as HTMLInputElement[];
    expect(dates[0]?.value).toBe("2024-04-01");
  });

  it("submits the per-row action bound with milestoneId", async () => {
    upsertMock.mockResolvedValueOnce({
      ok: true,
      record: {
        id: "rec-2",
        userId: "user-1",
        childId,
        milestoneId: "ms-2",
        status: "achieved",
        checkedAt: "2024-04-10",
        note: null,
      },
    });

    render(
      <MilestoneChecklist
        childId={childId}
        catalog={catalog}
        records={records}
      />,
    );

    const statusSelects = screen.getAllByLabelText(MILESTONE_COPY.statusLabel);
    const secondStatus = statusSelects[1];
    if (!secondStatus) throw new Error("expected second row status select");
    fireEvent.change(secondStatus, { target: { value: "achieved" } });

    const saveButtons = screen.getAllByRole("button", { name: /simpan/i });
    const secondSave = saveButtons[1];
    if (!secondSave) throw new Error("expected second row save button");
    fireEvent.click(secondSave);

    await waitFor(() => {
      expect(upsertMock).toHaveBeenCalledTimes(1);
    });
    const call = upsertMock.mock.calls[0];
    expect(call?.[0]).toBe(childId);
    expect(call?.[1]).toBe("ms-2");
    expect(call?.[3].get("status")).toBe("achieved");
  });

  it("renders all three status options per row", () => {
    render(
      <MilestoneChecklist childId={childId} catalog={catalog} records={[]} />,
    );
    const firstSelect = screen.getAllByLabelText(
      MILESTONE_COPY.statusLabel,
    )[0] as HTMLSelectElement;
    const values = Array.from(firstSelect.options).map((o) => o.value);
    expect(values).toEqual(["not_checked", "achieved", "delayed"]);
    expect(
      screen.getAllByText(MILESTONE_STATUS_LABEL.delayed).length,
    ).toBeGreaterThan(0);
  });
});
