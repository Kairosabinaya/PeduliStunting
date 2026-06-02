import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InfoHint } from "./info-hint";

describe("InfoHint", () => {
  it("labels the trigger and keeps the hint mounted for assistive tech", () => {
    render(
      <InfoHint label="Cara membaca persamaan">
        Peluang tiap kelas adalah selisih peluang kumulatif.
      </InfoHint>,
    );

    const trigger = screen.getByRole("button", {
      name: "Cara membaca persamaan",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Peluang tiap kelas adalah selisih peluang kumulatif.",
    );
    expect(trigger.getAttribute("aria-describedby")).toBe(
      screen.getByRole("tooltip").getAttribute("id"),
    );
  });

  it("toggles open on tap so the hint is reachable without hover", () => {
    render(<InfoHint label="Detail">Isi penjelasan.</InfoHint>);
    const trigger = screen.getByRole("button", { name: "Detail" });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("reveals on keyboard focus and hides on blur", () => {
    render(<InfoHint label="Detail">Isi penjelasan.</InfoHint>);
    const trigger = screen.getByRole("button", { name: "Detail" });

    fireEvent.focus(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.blur(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
