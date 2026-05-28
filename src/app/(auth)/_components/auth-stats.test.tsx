import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AUTH_STATS } from "@/config/auth";

import { AuthStats } from "./auth-stats";

describe("AuthStats", () => {
  it("renders one list item per configured stat", () => {
    render(<AuthStats />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(AUTH_STATS.length);
  });

  it("renders each stat value and label", () => {
    render(<AuthStats />);
    for (const stat of AUTH_STATS) {
      expect(screen.getByText(stat.value)).toBeInTheDocument();
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    }
  });
});
