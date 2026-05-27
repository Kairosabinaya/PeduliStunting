import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SourceToggle } from "./source-toggle";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/map",
  useSearchParams: () => new URLSearchParams("tahun=2024"),
}));

describe("SourceToggle", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("renders both options as radios", () => {
    render(<SourceToggle value="actual" />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
  });

  it("marks the active option via aria-checked", () => {
    render(<SourceToggle value="predicted" />);
    const predicted = screen.getByRole("radio", { name: /prediksi model/i });
    expect(predicted).toHaveAttribute("aria-checked", "true");
    const actual = screen.getByRole("radio", { name: /data observasi/i });
    expect(actual).toHaveAttribute("aria-checked", "false");
  });

  it("pushes a URL with the new source", () => {
    render(<SourceToggle value="actual" />);
    fireEvent.click(screen.getByRole("radio", { name: /prediksi model/i }));
    expect(replaceMock).toHaveBeenCalledTimes(1);
    const [call] = replaceMock.mock.calls;
    if (!call) throw new Error("expected router.replace to be called");
    expect(call[0]).toBe("/map?tahun=2024&sumber=predicted");
  });

  it("does not push when the active option is clicked", () => {
    render(<SourceToggle value="actual" />);
    fireEvent.click(screen.getByRole("radio", { name: /data observasi/i }));
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("disables predicted when predictedAvailable is false", () => {
    render(<SourceToggle value="actual" predictedAvailable={false} />);
    const predicted = screen.getByRole("radio", { name: /prediksi model/i });
    expect(predicted).toBeDisabled();
  });
});
