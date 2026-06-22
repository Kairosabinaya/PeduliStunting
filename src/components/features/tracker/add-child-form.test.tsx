import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ADD_CHILD_COPY, DATA_SAVED_MESSAGE } from "@/config/tracker";

import type { AddChildFormState } from "@/app/(app)/tracker/_lib/add-child-state";

const createChildMock =
  vi.fn<
    (
      previous: AddChildFormState | null,
      formData: FormData,
    ) => Promise<AddChildFormState>
  >();

vi.mock("@/app/(app)/tracker/actions", () => ({
  createChild: (previous: AddChildFormState | null, formData: FormData) =>
    createChildMock(previous, formData),
}));

// The form now navigates + fires a branded toast on success (no server
// redirect), so the router and notifier are stubbed.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));
const notifySuccessMock = vi.fn();
vi.mock("@/lib/notify", () => ({
  notify: {
    success: notifySuccessMock,
    error: vi.fn(),
    info: vi.fn(),
    action: vi.fn(),
  },
}));

const { AddChildForm } = await import("./add-child-form");

function fillIdentity() {
  fireEvent.change(
    screen.getByLabelText(new RegExp(ADD_CHILD_COPY.fields.nameLabel)),
    { target: { value: "Aira" } },
  );
  fireEvent.change(
    screen.getByLabelText(new RegExp(ADD_CHILD_COPY.fields.sexLabel)),
    { target: { value: "P" } },
  );
  fireEvent.change(
    screen.getByLabelText(new RegExp(ADD_CHILD_COPY.fields.birthDateLabel)),
    { target: { value: "2024-01-15" } },
  );
}

describe("AddChildForm", () => {
  beforeEach(() => {
    createChildMock.mockReset();
    pushMock.mockReset();
    notifySuccessMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders all labelled inputs", () => {
    render(<AddChildForm />);
    expect(
      screen.getByLabelText(new RegExp(ADD_CHILD_COPY.fields.nameLabel)),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(new RegExp(ADD_CHILD_COPY.fields.sexLabel)),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(new RegExp(ADD_CHILD_COPY.fields.birthDateLabel)),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ADD_CHILD_COPY.fields.birthWeightLabel),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ADD_CHILD_COPY.fields.birthLengthLabel),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ADD_CHILD_COPY.fields.gestationalAgeLabel),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ADD_CHILD_COPY.fields.notesLabel),
    ).toBeInTheDocument();
  });

  it("hides the gestational-age field until the preterm toggle is selected", () => {
    render(<AddChildForm />);

    expect(
      screen.getByLabelText(ADD_CHILD_COPY.fields.gestationalAgeLabel),
    ).not.toBeVisible();

    fireEvent.click(
      screen.getByRole("tab", { name: ADD_CHILD_COPY.birthStatus.preterm }),
    );

    expect(
      screen.getByLabelText(ADD_CHILD_COPY.fields.gestationalAgeLabel),
    ).toBeVisible();
  });

  it("invokes the Server Action with submitted values, defaulting to term", async () => {
    createChildMock.mockResolvedValueOnce({ ok: true });

    render(<AddChildForm />);
    fillIdentity();

    fireEvent.click(
      screen.getByRole("button", { name: ADD_CHILD_COPY.submit }),
    );

    await waitFor(() => {
      expect(createChildMock).toHaveBeenCalledTimes(1);
    });
    const formData = createChildMock.mock.calls[0]?.[1];
    expect(formData?.get("name")).toBe("Aira");
    expect(formData?.get("sex")).toBe("P");
    expect(formData?.get("birthDate")).toBe("2024-01-15");
    expect(formData?.get("birthStatus")).toBe("term");
  });

  it("submits the preterm status and gestational age when preterm is selected", async () => {
    createChildMock.mockResolvedValueOnce({ ok: true });

    render(<AddChildForm />);
    fillIdentity();

    fireEvent.click(
      screen.getByRole("tab", { name: ADD_CHILD_COPY.birthStatus.preterm }),
    );
    fireEvent.change(
      screen.getByLabelText(ADD_CHILD_COPY.fields.gestationalAgeLabel),
      { target: { value: "34" } },
    );

    fireEvent.click(
      screen.getByRole("button", { name: ADD_CHILD_COPY.submit }),
    );

    await waitFor(() => {
      expect(createChildMock).toHaveBeenCalledTimes(1);
    });
    const formData = createChildMock.mock.calls[0]?.[1];
    expect(formData?.get("birthStatus")).toBe("preterm");
    expect(formData?.get("gestationalAgeWeeks")).toBe("34");
  });

  it("fires the success toast and navigates to the new child on success", async () => {
    createChildMock.mockResolvedValueOnce({
      ok: true,
      child: {
        id: "00000000-0000-0000-0000-000000000009",
        userId: "00000000-0000-0000-0000-000000000001",
        name: "Aira",
        sex: "P",
        birthDate: "2024-01-15",
        birthWeightKg: null,
        birthLengthCm: null,
        gestationalAgeWeeks: null,
        notes: null,
      },
    });

    render(<AddChildForm />);
    fillIdentity();
    fireEvent.click(
      screen.getByRole("button", { name: ADD_CHILD_COPY.submit }),
    );

    await waitFor(() => {
      expect(notifySuccessMock).toHaveBeenCalledWith(DATA_SAVED_MESSAGE);
    });
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("anak=00000000-0000-0000-0000-000000000009"),
    );
  });

  it("renders field-level errors when the action returns them", async () => {
    createChildMock.mockResolvedValueOnce({
      ok: false,
      message: "Periksa kembali isian Anda.",
      fieldErrors: { name: ["Nama tidak boleh kosong."] },
    });

    render(<AddChildForm />);
    fillIdentity();
    fireEvent.click(
      screen.getByRole("button", { name: ADD_CHILD_COPY.submit }),
    );

    await waitFor(() => {
      expect(screen.getByText("Nama tidak boleh kosong.")).toBeInTheDocument();
    });
  });

  it("renders a general banner when the action returns a message without field errors", async () => {
    createChildMock.mockResolvedValueOnce({
      ok: false,
      message: ADD_CHILD_COPY.genericError,
    });

    render(<AddChildForm />);
    fillIdentity();
    fireEvent.click(
      screen.getByRole("button", { name: ADD_CHILD_COPY.submit }),
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        ADD_CHILD_COPY.genericError,
      );
    });
  });
});
