import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalShortcuts } from "./global-shortcuts";

const pushMock = vi.fn();
const toggleMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}));

vi.mock("@/components/theme/theme-provider", () => ({
  useTheme: () => ({ toggle: toggleMock }),
}));

function pressKey(key: string, target: Element = document.body): void {
  fireEvent.keyDown(target, { key });
}

describe("GlobalShortcuts", () => {
  beforeEach(() => {
    pushMock.mockClear();
    toggleMock.mockClear();
  });

  it("navigates to /map on the leader sequence g then m", () => {
    render(<GlobalShortcuts />);

    pressKey("g");
    pressKey("m");

    expect(pushMock).toHaveBeenCalledWith("/map");
  });

  it("navigates to /tracker on g then t", () => {
    render(<GlobalShortcuts />);

    pressKey("g");
    pressKey("t");

    expect(pushMock).toHaveBeenCalledWith("/tracker");
  });

  it("toggles the theme on a standalone t", () => {
    render(<GlobalShortcuts />);

    pressKey("t");

    expect(toggleMock).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("opens the help dialog on ?", () => {
    render(<GlobalShortcuts />);
    // The Modal is a native <dialog> that stays in the DOM; its `open` state
    // (driven by showModal/close) is the real visibility signal.
    const dialog = screen
      .getByText(/pintasan keyboard/i)
      .closest("dialog") as HTMLDialogElement;
    expect(dialog.open).toBe(false);

    pressKey("?");

    expect(dialog.open).toBe(true);
  });

  it("ignores shortcuts while typing in a text field", () => {
    render(
      <>
        <input aria-label="field" />
        <GlobalShortcuts />
      </>,
    );
    const input = screen.getByLabelText("field");

    pressKey("t", input);
    pressKey("g", input);
    pressKey("m", input);

    expect(toggleMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("does not navigate when a modifier key is held", () => {
    render(<GlobalShortcuts />);

    fireEvent.keyDown(document.body, { key: "g", metaKey: true });
    fireEvent.keyDown(document.body, { key: "m", metaKey: true });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
