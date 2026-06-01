import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PointerTilt } from "./pointer-tilt";

describe("PointerTilt", () => {
  it("renders its children", () => {
    render(
      <PointerTilt>
        <span>Tilt me</span>
      </PointerTilt>,
    );
    expect(screen.getByText("Tilt me")).toBeInTheDocument();
  });

  it("forwards the className to the tilting layer", () => {
    render(
      <PointerTilt className="test-tilt-class">
        <span>Child</span>
      </PointerTilt>,
    );
    expect(document.querySelector(".test-tilt-class")).not.toBeNull();
  });
});
