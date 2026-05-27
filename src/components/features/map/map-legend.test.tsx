import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MapLegend } from "./map-legend";

describe("MapLegend", () => {
  it("renders three category labels", () => {
    render(<MapLegend />);
    expect(screen.getByText("Rendah")).toBeInTheDocument();
    expect(screen.getByText("Sedang")).toBeInTheDocument();
    expect(screen.getByText("Tinggi")).toBeInTheDocument();
  });

  it("hides counts column when counts are absent", () => {
    render(<MapLegend />);
    expect(screen.queryByText(/tidak tersedia/i)).not.toBeInTheDocument();
  });

  it("shows counts and the unavailable row when counts include missing data", () => {
    render(
      <MapLegend
        counts={{
          Rendah: 100,
          Sedang: 200,
          Tinggi: 50,
          "tidak-tersedia": 5,
        }}
      />,
    );
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Data tidak tersedia")).toBeInTheDocument();
  });

  it("omits the unavailable row when there is no missing data", () => {
    render(
      <MapLegend
        counts={{
          Rendah: 1,
          Sedang: 1,
          Tinggi: 1,
          "tidak-tersedia": 0,
        }}
      />,
    );
    expect(screen.queryByText("Data tidak tersedia")).not.toBeInTheDocument();
  });

  it("exposes a labelled landmark for assistive tech", () => {
    render(<MapLegend />);
    const section = screen.getByRole("region", { name: /legenda/i });
    expect(section).toBeInTheDocument();
  });
});
