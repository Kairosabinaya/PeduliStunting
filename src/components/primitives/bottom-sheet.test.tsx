import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BottomSheet } from "./bottom-sheet";

const SNAPS = [0.4, 0.62, 0.94] as const;

describe("BottomSheet", () => {
  it("renders nothing when closed", () => {
    render(
      <BottomSheet
        open={false}
        onOpenChange={() => {}}
        snapPoints={SNAPS}
        title="Sheet"
        dragHandleAria="Drag"
      >
        <p>Hidden content</p>
      </BottomSheet>,
    );
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("renders content and a draggable handle when open", () => {
    render(
      <BottomSheet
        open
        onOpenChange={() => {}}
        snapPoints={SNAPS}
        title="Sheet"
        dragHandleAria="Drag"
      >
        <p>Visible content</p>
      </BottomSheet>,
    );
    expect(screen.getByText("Visible content")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toHaveAttribute("aria-label", "Drag");
  });

  it("cycles snap index with ArrowUp/ArrowDown on the handle", () => {
    render(
      <BottomSheet
        open
        onOpenChange={() => {}}
        snapPoints={SNAPS}
        title="Sheet"
        dragHandleAria="Drag"
      >
        <p>Body</p>
      </BottomSheet>,
    );
    const handle = screen.getByRole("separator");
    handle.focus();
    // Default snap is index 0 (peek). ArrowUp twice → full (index 2).
    fireEvent.keyDown(handle, { key: "ArrowUp" });
    fireEvent.keyDown(handle, { key: "ArrowUp" });
    // No assertion on transform string (would couple to implementation
    // detail). The aria-modal flag flips to "true" only at full state.
    const sheet = screen.getByRole("dialog");
    expect(sheet).toHaveAttribute("aria-modal", "true");
  });

  it("dismisses on Escape", () => {
    let openState = true;
    const onOpenChange = (next: boolean): void => {
      openState = next;
    };
    render(
      <BottomSheet
        open
        onOpenChange={onOpenChange}
        snapPoints={SNAPS}
        title="Sheet"
        dragHandleAria="Drag"
      >
        <p>Body</p>
      </BottomSheet>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(openState).toBe(false);
  });
});
