import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  EDUCATION_AGE_PRESETS,
  EDUCATION_COPY,
  EDUCATION_TOPIC_CATALOG,
} from "@/config/education";

import type { ParsedEdukasiFilters } from "../_lib/filters";
import { EdukasiFilters } from "./edukasi-filters";

const emptyFilters: ParsedEdukasiFilters = {
  topic: undefined,
  agePresetKey: undefined,
  search: undefined,
  page: 1,
};

describe("EdukasiFilters", () => {
  it("renders a chip for every topic and every age preset plus a 'Semua' chip", () => {
    render(<EdukasiFilters filters={emptyFilters} />);
    for (const topic of EDUCATION_TOPIC_CATALOG) {
      expect(
        screen.getByRole("link", {
          name: `${topic.label}: ${topic.description}`,
        }),
      ).toBeInTheDocument();
    }
    for (const preset of EDUCATION_AGE_PRESETS) {
      expect(
        screen.getByRole("link", {
          name: `${preset.label}: ${preset.description}`,
        }),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByRole("link", { name: EDUCATION_COPY.topicFilterAllLabel }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: EDUCATION_COPY.ageFilterAllLabel }),
    ).toBeInTheDocument();
  });

  it("marks the 'Semua' chip as the current selection when nothing is filtered", () => {
    render(<EdukasiFilters filters={emptyFilters} />);
    const allTopics = screen.getByRole("link", {
      name: EDUCATION_COPY.topicFilterAllLabel,
    });
    expect(allTopics).toHaveAttribute("aria-current", "true");
  });

  it("marks the active topic and age chips via aria-current", () => {
    render(
      <EdukasiFilters
        filters={{ ...emptyFilters, topic: "gizi", agePresetKey: "0-6" }}
      />,
    );
    const gizi = screen.getByRole("link", { name: /^Gizi:/i });
    expect(gizi).toHaveAttribute("aria-current", "true");

    const baby0to6 = screen.getByRole("link", { name: /^Bayi 0-6 bln:/i });
    expect(baby0to6).toHaveAttribute("aria-current", "true");
  });

  it("hides the reset link when no filter is active", () => {
    render(<EdukasiFilters filters={emptyFilters} />);
    expect(
      screen.queryByRole("link", { name: EDUCATION_COPY.resetFiltersLabel }),
    ).not.toBeInTheDocument();
  });

  it("shows a reset link to the bare /edukasi path when filters are active", () => {
    render(
      <EdukasiFilters
        filters={{
          topic: "gizi",
          agePresetKey: "0-6",
          search: "asi",
          page: 2,
        }}
      />,
    );
    const reset = screen.getByRole("link", {
      name: EDUCATION_COPY.resetFiltersLabel,
    });
    expect(reset).toHaveAttribute("href", "/edukasi");
  });

  it("each chip points at /edukasi with the selected filter override", () => {
    render(<EdukasiFilters filters={emptyFilters} />);
    const gizi = screen.getByRole("link", { name: /^Gizi:/i });
    expect(gizi.getAttribute("href")).toContain("topik=gizi");

    const baby0to6 = screen.getByRole("link", { name: /^Bayi 0-6 bln:/i });
    expect(baby0to6.getAttribute("href")).toContain("usia=0-6");
  });
});
