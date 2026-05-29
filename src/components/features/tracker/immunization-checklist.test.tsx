import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ChildImmunizationDto,
  ImmunizationDto,
} from "@/application/health-plan/dtos";
import { IMMUNIZATION_COPY, IMMUNIZATION_STATUS_LABEL } from "@/config/tracker";

import type { UpsertImmunizationFormState } from "@/app/(app)/tracker/anak/[childId]/imunisasi/_lib/upsert-immunization-state";

const upsertMock =
  vi.fn<
    (
      childId: string,
      immunizationCode: string,
      previous: UpsertImmunizationFormState | null,
      formData: FormData,
    ) => Promise<UpsertImmunizationFormState>
  >();

vi.mock("@/app/(app)/tracker/anak/[childId]/imunisasi/actions", () => ({
  upsertChildImmunization: (
    childId: string,
    immunizationCode: string,
    previous: UpsertImmunizationFormState | null,
    formData: FormData,
  ) => upsertMock(childId, immunizationCode, previous, formData),
}));

const { ImmunizationChecklist } = await import("./immunization-checklist");

const childId = "11111111-1111-1111-1111-111111111111";

const schedule: readonly ImmunizationDto[] = [
  {
    code: "HEP_B_0",
    name: "Hepatitis B 0",
    doseNumber: 1,
    recommendedAgeMonths: 0,
    notes: "Diberikan saat lahir.",
    prevents: null,
    displayOrder: 1,
  },
  {
    code: "BCG",
    name: "BCG",
    doseNumber: null,
    recommendedAgeMonths: 1,
    notes: null,
    prevents: null,
    displayOrder: 2,
  },
];

const records: readonly ChildImmunizationDto[] = [
  {
    id: "rec-1",
    userId: "user-1",
    childId,
    immunizationCode: "HEP_B_0",
    status: "done",
    givenAt: "2024-02-01",
    note: null,
  },
];

describe("ImmunizationChecklist", () => {
  beforeEach(() => {
    upsertMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the empty state when the schedule is empty", () => {
    render(
      <ImmunizationChecklist childId={childId} schedule={[]} records={[]} />,
    );
    expect(screen.getByText(IMMUNIZATION_COPY.emptyTitle)).toBeInTheDocument();
  });

  it("hydrates each row with the matching record's status and date", () => {
    render(
      <ImmunizationChecklist
        childId={childId}
        schedule={schedule}
        records={records}
      />,
    );
    const statusSelects = screen.getAllByLabelText(
      IMMUNIZATION_COPY.statusLabel,
    ) as HTMLSelectElement[];
    expect(statusSelects[0]?.value).toBe("done");
    expect(statusSelects[1]?.value).toBe("pending");

    const dateInputs = screen.getAllByLabelText(
      IMMUNIZATION_COPY.givenAtLabel,
    ) as HTMLInputElement[];
    expect(dateInputs[0]?.value).toBe("2024-02-01");
    expect(dateInputs[1]?.value).toBe("");
  });

  it("calls the action bound with the row's immunization code on submit", async () => {
    upsertMock.mockResolvedValueOnce({
      ok: true,
      record: {
        id: "rec-2",
        userId: "user-1",
        childId,
        immunizationCode: "BCG",
        status: "done",
        givenAt: "2024-03-15",
        note: null,
      },
    });

    render(
      <ImmunizationChecklist
        childId={childId}
        schedule={schedule}
        records={records}
      />,
    );

    const statusSelects = screen.getAllByLabelText(
      IMMUNIZATION_COPY.statusLabel,
    );
    const bcgStatus = statusSelects[1];
    if (!bcgStatus) throw new Error("expected second row select");
    fireEvent.change(bcgStatus, { target: { value: "done" } });

    const dateInputs = screen.getAllByLabelText(IMMUNIZATION_COPY.givenAtLabel);
    const bcgDate = dateInputs[1];
    if (!bcgDate) throw new Error("expected second row date input");
    fireEvent.change(bcgDate, { target: { value: "2024-03-15" } });

    const saveButtons = screen.getAllByRole("button", { name: /simpan/i });
    const bcgSave = saveButtons[1];
    if (!bcgSave) throw new Error("expected second row save button");
    fireEvent.click(bcgSave);

    await waitFor(() => {
      expect(upsertMock).toHaveBeenCalledTimes(1);
    });
    const call = upsertMock.mock.calls[0];
    expect(call?.[0]).toBe(childId);
    expect(call?.[1]).toBe("BCG");
    expect(call?.[3].get("status")).toBe("done");
    expect(call?.[3].get("givenAt")).toBe("2024-03-15");
  });

  it("uses all three status options from the catalog", () => {
    render(
      <ImmunizationChecklist
        childId={childId}
        schedule={schedule}
        records={[]}
      />,
    );
    const firstSelect = screen.getAllByLabelText(
      IMMUNIZATION_COPY.statusLabel,
    )[0] as HTMLSelectElement;
    const options = Array.from(firstSelect.options).map((o) => o.value);
    expect(options).toContain("pending");
    expect(options).toContain("done");
    expect(options).toContain("skipped");
    expect(
      screen.getAllByText(IMMUNIZATION_STATUS_LABEL.pending).length,
    ).toBeGreaterThan(0);
  });
});
