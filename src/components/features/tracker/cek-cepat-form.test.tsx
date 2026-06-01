import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CEK_CEPAT_COPY } from "@/config/cek-cepat";

import { CekCepatForm } from "./cek-cepat-form";

const defaultValues = {
  sex: null,
  mode: "age-months" as const,
  birthDate: null,
  ageMonths: null,
  weightKg: null,
  heightCm: null,
};

describe("CekCepatForm", () => {
  it("requires sex and age before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CekCepatForm
        defaultValues={defaultValues}
        submitting={false}
        onValuesChange={vi.fn()}
        onSubmit={onSubmit}
        onReset={vi.fn()}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: CEK_CEPAT_COPY.buttons.submit }),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid payload when sex, age, and at least one measurement are set", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CekCepatForm
        defaultValues={defaultValues}
        submitting={false}
        onValuesChange={vi.fn()}
        onSubmit={onSubmit}
        onReset={vi.fn()}
      />,
    );
    await user.click(
      screen.getByRole("radio", { name: CEK_CEPAT_COPY.fieldLabels.sexMale }),
    );
    await user.type(
      screen.getByLabelText(CEK_CEPAT_COPY.fieldLabels.ageMonths),
      "12",
    );
    await user.type(
      screen.getByLabelText(CEK_CEPAT_COPY.fieldLabels.weightKg),
      "9.5",
    );
    await user.click(
      screen.getByRole("button", { name: CEK_CEPAT_COPY.buttons.submit }),
    );
    expect(onSubmit).toHaveBeenCalledWith({
      sex: "L",
      ageMonths: 12,
      weightKg: 9.5,
      heightCm: null,
    });
  });

  it("clears all fields when reset is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onValuesChange = vi.fn();
    render(
      <CekCepatForm
        defaultValues={defaultValues}
        submitting={false}
        onValuesChange={onValuesChange}
        onSubmit={vi.fn()}
        onReset={onReset}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: CEK_CEPAT_COPY.buttons.reset }),
    );
    expect(onReset).toHaveBeenCalled();
  });

  it("rejects ages outside the 0-60 month range", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CekCepatForm
        defaultValues={defaultValues}
        submitting={false}
        onValuesChange={vi.fn()}
        onSubmit={onSubmit}
        onReset={vi.fn()}
      />,
    );
    await user.click(
      screen.getByRole("radio", { name: CEK_CEPAT_COPY.fieldLabels.sexMale }),
    );
    await user.type(
      screen.getByLabelText(CEK_CEPAT_COPY.fieldLabels.ageMonths),
      "72",
    );
    await user.type(
      screen.getByLabelText(CEK_CEPAT_COPY.fieldLabels.weightKg),
      "10",
    );
    await user.click(
      screen.getByRole("button", { name: CEK_CEPAT_COPY.buttons.submit }),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects decimal age input without truncating it", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CekCepatForm
        defaultValues={defaultValues}
        submitting={false}
        onValuesChange={vi.fn()}
        onSubmit={onSubmit}
        onReset={vi.fn()}
      />,
    );
    await user.click(
      screen.getByRole("radio", { name: CEK_CEPAT_COPY.fieldLabels.sexMale }),
    );
    await user.type(
      screen.getByLabelText(CEK_CEPAT_COPY.fieldLabels.ageMonths),
      "12.5",
    );
    await user.type(
      screen.getByLabelText(CEK_CEPAT_COPY.fieldLabels.weightKg),
      "10",
    );
    await user.click(
      screen.getByRole("button", { name: CEK_CEPAT_COPY.buttons.submit }),
    );
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(CEK_CEPAT_COPY.validation.ageInvalid),
    ).toBeInTheDocument();
  });
});
