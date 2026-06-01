import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DashboardFilterProvider,
  useDashboardFilter,
} from "./dashboard-filter-context";

function Probe() {
  const { year, selectedKodeBps, setYear, setSelectedKodeBps, clearSelection } =
    useDashboardFilter();
  return (
    <div>
      <span data-testid="year">{year}</span>
      <span data-testid="region">{selectedKodeBps ?? "none"}</span>
      <button type="button" onClick={() => setYear(2022)}>
        set-year
      </button>
      <button type="button" onClick={() => setSelectedKodeBps("1101")}>
        set-region
      </button>
      <button type="button" onClick={() => clearSelection()}>
        clear
      </button>
    </div>
  );
}

describe("DashboardFilterProvider", () => {
  it("should expose the initial year and region", () => {
    render(
      <DashboardFilterProvider initialYear={2024} initialKodeBps={null}>
        <Probe />
      </DashboardFilterProvider>,
    );
    expect(screen.getByTestId("year")).toHaveTextContent("2024");
    expect(screen.getByTestId("region")).toHaveTextContent("none");
  });

  it("should update year and region and mirror state to the URL", () => {
    const replaceSpy = vi.spyOn(window.history, "replaceState");
    render(
      <DashboardFilterProvider initialYear={2024} initialKodeBps={null}>
        <Probe />
      </DashboardFilterProvider>,
    );

    fireEvent.click(screen.getByText("set-year"));
    expect(screen.getByTestId("year")).toHaveTextContent("2022");

    fireEvent.click(screen.getByText("set-region"));
    expect(screen.getByTestId("region")).toHaveTextContent("1101");

    expect(replaceSpy).toHaveBeenCalled();
    replaceSpy.mockRestore();
  });

  it("should clear the selected region", () => {
    render(
      <DashboardFilterProvider initialYear={2024} initialKodeBps="1101">
        <Probe />
      </DashboardFilterProvider>,
    );
    expect(screen.getByTestId("region")).toHaveTextContent("1101");
    fireEvent.click(screen.getByText("clear"));
    expect(screen.getByTestId("region")).toHaveTextContent("none");
  });

  it("should throw when used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/DashboardFilterProvider/);
    spy.mockRestore();
  });
});
