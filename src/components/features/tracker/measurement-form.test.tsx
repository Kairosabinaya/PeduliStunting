import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DATA_SAVED_MESSAGE, MEASUREMENTS_COPY } from "@/config/tracker";

import type { AddMeasurementFormState } from "@/app/(app)/tracker/anak/[childId]/pengukuran/_lib/add-measurement-state";

const addMeasurementMock =
  vi.fn<
    (
      childId: string,
      previous: AddMeasurementFormState | null,
      formData: FormData,
    ) => Promise<AddMeasurementFormState>
  >();

vi.mock("@/app/(app)/tracker/anak/[childId]/pengukuran/actions", () => ({
  addMeasurement: (
    childId: string,
    previous: AddMeasurementFormState | null,
    formData: FormData,
  ) => addMeasurementMock(childId, previous, formData),
}));

// Success is now confirmed by a branded top-right toast instead of an inline
// banner, so the notifier is stubbed.
const notifySuccessMock = vi.fn();
vi.mock("@/lib/notify", () => ({
  notify: {
    success: notifySuccessMock,
    error: vi.fn(),
    info: vi.fn(),
    action: vi.fn(),
  },
}));

const { MeasurementForm } = await import("./measurement-form");

const childId = "11111111-1111-1111-1111-111111111111";
const childBirthDate = "2024-01-01";

describe("MeasurementForm", () => {
  beforeEach(() => {
    addMeasurementMock.mockReset();
    notifySuccessMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders labelled inputs for every measurement field", () => {
    render(
      <MeasurementForm childId={childId} childBirthDate={childBirthDate} />,
    );
    expect(
      screen.getByLabelText(
        new RegExp(MEASUREMENTS_COPY.fields.measuredAtLabel),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.weightLabel),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.heightLabel),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.headCircumferenceLabel),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.muacLabel),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.noteLabel),
    ).toBeInTheDocument();
  });

  it("invokes the action bound with childId on submit", async () => {
    addMeasurementMock.mockResolvedValueOnce({ ok: true });

    render(
      <MeasurementForm childId={childId} childBirthDate={childBirthDate} />,
    );
    fireEvent.change(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.weightLabel),
      { target: { value: "8.5" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: MEASUREMENTS_COPY.submit }),
    );

    await waitFor(() => {
      expect(addMeasurementMock).toHaveBeenCalledTimes(1);
    });
    const [calledChildId, , formData] = addMeasurementMock.mock.calls[0] ?? [];
    expect(calledChildId).toBe(childId);
    expect(formData?.get("weightKg")).toBe("8.5");
  });

  it("fires the success toast when the action resolves ok", async () => {
    addMeasurementMock.mockResolvedValueOnce({ ok: true });

    render(
      <MeasurementForm childId={childId} childBirthDate={childBirthDate} />,
    );
    fireEvent.change(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.weightLabel),
      { target: { value: "8.5" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: MEASUREMENTS_COPY.submit }),
    );

    await waitFor(() => {
      expect(notifySuccessMock).toHaveBeenCalledWith(DATA_SAVED_MESSAGE);
    });
  });

  it("calls onSaved after a successful save so a modal can auto-close", async () => {
    addMeasurementMock.mockResolvedValueOnce({ ok: true });
    const onSaved = vi.fn();

    render(
      <MeasurementForm
        childId={childId}
        childBirthDate={childBirthDate}
        onSaved={onSaved}
      />,
    );
    fireEvent.change(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.weightLabel),
      { target: { value: "8.5" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: MEASUREMENTS_COPY.submit }),
    );

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call onSaved when the action returns an error", async () => {
    addMeasurementMock.mockResolvedValueOnce({
      ok: false,
      message: "Periksa kembali isian Anda.",
    });
    const onSaved = vi.fn();

    render(
      <MeasurementForm
        childId={childId}
        childBirthDate={childBirthDate}
        onSaved={onSaved}
      />,
    );
    fireEvent.change(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.weightLabel),
      { target: { value: "8.5" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: MEASUREMENTS_COPY.submit }),
    );

    await waitFor(() => {
      expect(addMeasurementMock).toHaveBeenCalledTimes(1);
    });
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("renders field-level errors when the action returns them", async () => {
    addMeasurementMock.mockResolvedValueOnce({
      ok: false,
      message: "Periksa kembali isian Anda.",
      fieldErrors: { weightKg: ["Berat badan tidak valid."] },
    });

    render(
      <MeasurementForm childId={childId} childBirthDate={childBirthDate} />,
    );
    fireEvent.change(
      screen.getByLabelText(MEASUREMENTS_COPY.fields.weightLabel),
      { target: { value: "8.5" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: MEASUREMENTS_COPY.submit }),
    );

    await waitFor(() => {
      expect(screen.getByText("Berat badan tidak valid.")).toBeInTheDocument();
    });
  });
});
