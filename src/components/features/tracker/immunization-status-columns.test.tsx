import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TrackerImmunizationItemStatus } from "@/application/tracking/tracker-dashboard-view-model";
import {
  IMMUNIZATION_CELL_COPY,
  TRACKER_DASHBOARD_COPY,
} from "@/config/tracker";

import { ImmunizationStatusColumns } from "./immunization-status-columns";

function item(
  code: string,
  status: TrackerImmunizationItemStatus["status"],
): TrackerImmunizationItemStatus {
  return { code, name: `Vaksin ${code}`, recommendedAgeMonths: 2, status };
}

function manyUpcoming(count: number): readonly TrackerImmunizationItemStatus[] {
  return Array.from({ length: count }, (_unused, index) =>
    item(`U${index}`, "upcoming"),
  );
}

describe("ImmunizationStatusColumns", () => {
  it("lists each bucket under the same label the timeline uses for that status", () => {
    render(
      <ImmunizationStatusColumns
        upcoming={[item("DPT-1", "upcoming")]}
        future={[item("MR", "future")]}
        missed={[item("HB0", "missed")]}
      />,
    );

    // The "upcoming" bucket must sit under the canonical "Akan datang" label,
    // not be mislabelled as "Belum waktunya" (the future label) or vice versa.
    const upcomingRegion = screen.getByRole("region", {
      name: IMMUNIZATION_CELL_COPY.upcoming.label,
    });
    expect(
      within(upcomingRegion).getByText("Vaksin DPT-1"),
    ).toBeInTheDocument();

    const futureRegion = screen.getByRole("region", {
      name: IMMUNIZATION_CELL_COPY.future.label,
    });
    expect(within(futureRegion).getByText("Vaksin MR")).toBeInTheDocument();

    // The future vaccine must never appear under the "Akan datang" heading.
    expect(
      within(upcomingRegion).queryByText("Vaksin MR"),
    ).not.toBeInTheDocument();
  });

  it("shows the true total in the bucket header", () => {
    const total = 7;
    render(
      <ImmunizationStatusColumns
        upcoming={manyUpcoming(total)}
        future={[]}
        missed={[]}
      />,
    );
    const region = screen.getByRole("region", {
      name: IMMUNIZATION_CELL_COPY.upcoming.label,
    });
    expect(
      within(region).getByText(
        TRACKER_DASHBOARD_COPY.immunization.countLabel(total),
      ),
    ).toBeInTheDocument();
  });

  it("renders every item so overflow scrolls instead of being truncated", () => {
    const total = 7;
    render(
      <ImmunizationStatusColumns
        upcoming={manyUpcoming(total)}
        future={[]}
        missed={[]}
      />,
    );
    const region = screen.getByRole("region", {
      name: IMMUNIZATION_CELL_COPY.upcoming.label,
    });
    // The last item must be present — nothing is dropped; the column scrolls.
    expect(
      within(region).getByText(`Vaksin U${total - 1}`),
    ).toBeInTheDocument();
    // No "lihat timeline" fallback hint anymore (all items are reachable).
    expect(
      within(region).queryByText(/lihat timeline/i),
    ).not.toBeInTheDocument();
  });
});
