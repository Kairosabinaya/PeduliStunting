import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { YearSlider } from "./year-slider";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/map",
  useSearchParams: () => new URLSearchParams("sumber=actual"),
}));

describe("YearSlider", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("renders the current year on the slider input", () => {
    render(<YearSlider value={2024} />);
    expect(screen.getByRole("slider")).toHaveValue("2024");
  });

  it("pushes a new URL when a tick button is clicked", () => {
    render(<YearSlider value={2024} />);
    fireEvent.click(screen.getByRole("button", { name: "2022" }));
    expect(replaceMock).toHaveBeenCalledTimes(1);
    const [call] = replaceMock.mock.calls;
    if (!call) throw new Error("expected router.replace to be called");
    expect(call[0]).toBe("/map?sumber=actual&tahun=2022");
  });

  it("does not push when the clicked year equals the current value", () => {
    render(<YearSlider value={2023} />);
    fireEvent.click(screen.getByRole("button", { name: "2023" }));
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("marks the active button via aria-pressed", () => {
    render(<YearSlider value={2022} />);
    const active = screen.getByRole("button", { name: "2022" });
    expect(active).toHaveAttribute("aria-pressed", "true");
    const inactive = screen.getByRole("button", { name: "2024" });
    expect(inactive).toHaveAttribute("aria-pressed", "false");
  });

  it("updates URL when the range input changes", () => {
    render(<YearSlider value={2024} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "2021" } });
    expect(replaceMock).toHaveBeenCalledTimes(1);
    const [call] = replaceMock.mock.calls;
    if (!call) throw new Error("expected router.replace to be called");
    expect(call[0]).toBe("/map?sumber=actual&tahun=2021");
  });
});
