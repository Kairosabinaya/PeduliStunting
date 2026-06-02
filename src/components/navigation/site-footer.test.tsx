import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { COPYRIGHT_NOTICE } from "@/config/app";

import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders the site-wide copyright notice", () => {
    render(<SiteFooter />);

    expect(screen.getByText(COPYRIGHT_NOTICE)).toBeInTheDocument();
  });

  it("exposes a single contentinfo landmark", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent(COPYRIGHT_NOTICE);
  });

  it("merges layout-specific spacing classes", () => {
    render(<SiteFooter className="mt-12" />);

    expect(screen.getByRole("contentinfo")).toHaveClass("mt-12");
  });
});
