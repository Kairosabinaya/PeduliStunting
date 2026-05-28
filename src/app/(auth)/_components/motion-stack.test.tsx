import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

// happy-dom doesn't ship matchMedia; motion's useReducedMotion calls it
// directly. We default to "no reduced motion" so children render through
// the motion wrapper path during tests.
beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  }
});

import { MotionStack } from "./motion-stack";

describe("MotionStack", () => {
  it("renders every child it receives", () => {
    render(
      <MotionStack>
        <p data-testid="row-1">satu</p>
        <p data-testid="row-2">dua</p>
        <p data-testid="row-3">tiga</p>
      </MotionStack>,
    );
    expect(screen.getByTestId("row-1")).toBeInTheDocument();
    expect(screen.getByTestId("row-2")).toBeInTheDocument();
    expect(screen.getByTestId("row-3")).toBeInTheDocument();
  });

  it("applies the optional className to the wrapper", () => {
    const { container } = render(
      <MotionStack className="space-y-4">
        <span>x</span>
      </MotionStack>,
    );
    expect(container.firstElementChild?.className).toMatch(/space-y-4/u);
  });
});
