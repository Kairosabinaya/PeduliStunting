import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  SegmentedControl,
  SegmentedNav,
  segmentedPanelProps,
} from "./segmented-control";

describe("SegmentedNav", () => {
  const items = [
    { href: "/a", label: "Ringkasan", active: true },
    { href: "/b", label: "Pengukuran", active: false },
  ];

  it("renders a labelled navigation with one link per item", () => {
    render(<SegmentedNav ariaLabel="Navigasi" items={items} />);
    expect(
      screen.getByRole("navigation", { name: "Navigasi" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("marks the active item with aria-current=page", () => {
    render(<SegmentedNav ariaLabel="Navigasi" items={items} />);
    expect(screen.getByRole("link", { name: "Ringkasan" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Pengukuran" }),
    ).not.toHaveAttribute("aria-current");
  });
});

describe("SegmentedControl", () => {
  const items = [
    { id: "asi", label: "ASI" },
    { id: "mpasi", label: "MPASI" },
  ] as const;

  it("renders a tablist with the active tab selected", () => {
    render(
      <SegmentedControl
        ariaLabel="Sub-modul"
        value="asi"
        onValueChange={vi.fn()}
        items={items}
      />,
    );
    expect(
      screen.getByRole("tablist", { name: "Sub-modul" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "ASI" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "MPASI" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("calls onValueChange with the clicked tab id", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl
        ariaLabel="Sub-modul"
        value="asi"
        onValueChange={onValueChange}
        items={items}
      />,
    );
    await user.click(screen.getByRole("tab", { name: "MPASI" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("mpasi");
  });

  it("renders trailing content, including the active-aware function form", () => {
    render(
      <SegmentedControl
        ariaLabel="Sub-modul"
        value="asi"
        onValueChange={vi.fn()}
        items={[
          {
            id: "asi",
            label: "ASI",
            trailing: (active) => <span>{active ? "on" : "off"}</span>,
          },
        ]}
      />,
    );
    expect(screen.getByText("on")).toBeInTheDocument();
  });
});

describe("segmentedPanelProps", () => {
  it("wires the panel to its tab and hides inactive panels", () => {
    expect(segmentedPanelProps("base", "asi", true)).toEqual({
      id: "base-asi-panel",
      role: "tabpanel",
      "aria-labelledby": "base-asi-tab",
      hidden: false,
    });
    expect(segmentedPanelProps("base", "mpasi", false).hidden).toBe(true);
  });
});
