import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompareRegionsCard } from "./compare-regions-card";

describe("CompareRegionsCard", () => {
  it("renders region names and prevalence values", () => {
    render(
      <CompareRegionsCard
        card={{
          type: "compare-regions",
          tahun: 2024,
          rows: [
            {
              kodeBps: "3578",
              kabupatenKota: "Kota Surabaya",
              provinsi: "Jawa Timur",
              prevalence: 12.5,
              category: "Rendah",
            },
          ],
        }}
      />,
    );
    expect(screen.getByText("Kota Surabaya")).toBeInTheDocument();
    expect(screen.getByText("12.5%")).toBeInTheDocument();
  });

  it("renders a dash when prevalence is null", () => {
    render(
      <CompareRegionsCard
        card={{
          type: "compare-regions",
          tahun: 2024,
          rows: [
            {
              kodeBps: "3578",
              kabupatenKota: "Kota Surabaya",
              provinsi: "Jawa Timur",
              prevalence: null,
              category: "Rendah",
            },
          ],
        }}
      />,
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
