import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ChildDto } from "@/application/tracking/dtos";
import { SEX_LABEL, trackerChildRoute } from "@/config/tracker";

import { ChildCard } from "./child-card";

const baseChild: ChildDto = {
  id: "11111111-1111-1111-1111-111111111111",
  userId: "22222222-2222-2222-2222-222222222222",
  name: "Aira",
  sex: "P",
  birthDate: "2024-01-15",
  birthWeightKg: 3.2,
  birthLengthCm: 49,
  gestationalAgeWeeks: 38,
  notes: "Lahir spontan",
};

describe("ChildCard", () => {
  it("renders the child name and a link to its detail route", () => {
    render(<ChildCard child={baseChild} />);
    const titleLink = screen.getByRole("link", { name: baseChild.name });
    expect(titleLink).toHaveAttribute("href", trackerChildRoute(baseChild.id));
  });

  it("renders a 'Lihat detail' affordance pointing to the same route", () => {
    render(<ChildCard child={baseChild} />);
    const detailLink = screen.getByRole("link", { name: /lihat detail/i });
    expect(detailLink).toHaveAttribute("href", trackerChildRoute(baseChild.id));
  });

  it("renders the sex label", () => {
    render(<ChildCard child={baseChild} />);
    expect(screen.getByText(SEX_LABEL[baseChild.sex])).toBeInTheDocument();
  });

  it("renders raw birth measurements when present", () => {
    render(<ChildCard child={baseChild} />);
    expect(screen.getByText("3.2 kg")).toBeInTheDocument();
    expect(screen.getByText("49 cm")).toBeInTheDocument();
  });

  it("falls back to '-' when birth measurements are missing", () => {
    render(
      <ChildCard
        child={{ ...baseChild, birthWeightKg: null, birthLengthCm: null }}
      />,
    );
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("omits the description when notes are absent", () => {
    render(<ChildCard child={{ ...baseChild, notes: null }} />);
    expect(screen.queryByText("Lahir spontan")).not.toBeInTheDocument();
  });
});
