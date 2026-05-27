import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ADD_CHILD_COPY } from "@/config/tracker";

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

const { AddChildForm } = await import("./add-child-form");

describe("AddChildForm", () => {
  beforeEach(() => {
    createChildMock.mockReset();
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

  it("invokes the Server Action with submitted values", async () => {
    createChildMock.mockResolvedValueOnce({ ok: true });

    render(<AddChildForm />);
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
  });

  it("renders field-level errors when the action returns them", async () => {
    createChildMock.mockResolvedValueOnce({
      ok: false,
      message: "Periksa kembali isian Anda.",
      fieldErrors: { name: ["Nama tidak boleh kosong."] },
    });

    render(<AddChildForm />);
    fireEvent.change(
      screen.getByLabelText(new RegExp(ADD_CHILD_COPY.fields.sexLabel)),
      { target: { value: "L" } },
    );
    fireEvent.change(
      screen.getByLabelText(new RegExp(ADD_CHILD_COPY.fields.birthDateLabel)),
      { target: { value: "2024-01-15" } },
    );
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
