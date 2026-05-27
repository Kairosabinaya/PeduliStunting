import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EDUCATION_COPY } from "@/config/education";

import type { ParsedEdukasiFilters } from "../_lib/filters";
import { EdukasiPagination } from "./edukasi-pagination";

const baseFilters: ParsedEdukasiFilters = {
  topic: undefined,
  agePresetKey: undefined,
  search: undefined,
  page: 1,
};

describe("EdukasiPagination", () => {
  it("renders nothing when there is only one page of results", () => {
    const { container } = render(
      <EdukasiPagination filters={baseFilters} totalPages={1} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("disables the previous link on the first page", () => {
    render(<EdukasiPagination filters={baseFilters} totalPages={3} />);
    const previous = screen.getByText(EDUCATION_COPY.paginationPrevious);
    expect(previous.tagName.toLowerCase()).toBe("span");
    expect(previous).toHaveAttribute("aria-disabled");
  });

  it("disables the next link on the final page", () => {
    render(
      <EdukasiPagination
        filters={{ ...baseFilters, page: 3 }}
        totalPages={3}
      />,
    );
    const next = screen.getByText(EDUCATION_COPY.paginationNext);
    expect(next.tagName.toLowerCase()).toBe("span");
    expect(next).toHaveAttribute("aria-disabled");
  });

  it("renders both anchors when there are middle pages", () => {
    render(
      <EdukasiPagination
        filters={{ ...baseFilters, page: 2 }}
        totalPages={5}
      />,
    );
    const previous = screen.getByRole("link", {
      name: EDUCATION_COPY.paginationPrevious,
    });
    expect(previous).toHaveAttribute("href", "/edukasi");

    const next = screen.getByRole("link", {
      name: EDUCATION_COPY.paginationNext,
    });
    expect(next).toHaveAttribute("href", "/edukasi?halaman=3");
  });

  it("exposes a polite status with the current/total page counts", () => {
    render(
      <EdukasiPagination
        filters={{ ...baseFilters, page: 2 }}
        totalPages={4}
      />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(
      EDUCATION_COPY.paginationStatus(2, 4),
    );
  });

  it("clamps a page index that exceeds totalPages so navigation stays valid", () => {
    render(
      <EdukasiPagination
        filters={{ ...baseFilters, page: 99 }}
        totalPages={3}
      />,
    );
    expect(screen.getByText(EDUCATION_COPY.paginationNext).tagName.toLowerCase())
      .toBe("span");
    const previous = screen.getByRole("link", {
      name: EDUCATION_COPY.paginationPrevious,
    });
    expect(previous).toHaveAttribute("href", "/edukasi?halaman=2");
  });
});
