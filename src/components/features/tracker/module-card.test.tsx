import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/primitives/badge";

import { ModuleCard } from "./module-card";

describe("ModuleCard", () => {
  it("renders title, description, and status line", () => {
    render(
      <ModuleCard
        title="Pertumbuhan"
        description="Status terkini menurut standar WHO."
        statusLine="TB/U terakhir: Normal"
      />,
    );
    expect(screen.getByText("Pertumbuhan")).toBeInTheDocument();
    expect(
      screen.getByText("Status terkini menurut standar WHO."),
    ).toBeInTheDocument();
    expect(screen.getByText("TB/U terakhir: Normal")).toBeInTheDocument();
  });

  it("renders an em-dash placeholder when status line is omitted", () => {
    render(<ModuleCard title="Gizi" description="Placeholder." />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the status badge when provided", () => {
    render(
      <ModuleCard
        title="Pertumbuhan"
        description="—"
        statusBadge={<Badge tone="success">Normal</Badge>}
      />,
    );
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });

  it("renders an enabled CTA pointing to the supplied href", () => {
    render(
      <ModuleCard
        title="Imunisasi"
        description="—"
        cta={{ label: "Buka jadwal", href: "/tracker/anak/abc/imunisasi" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Buka jadwal" });
    expect(link).toHaveAttribute("href", "/tracker/anak/abc/imunisasi");
  });

  it("marks the CTA as aria-disabled when the card is disabled", () => {
    render(
      <ModuleCard
        title="Gizi"
        description="—"
        disabled
        cta={{ label: "Segera hadir", href: "/tracker/anak/abc/gizi" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Segera hadir" });
    expect(link).toHaveAttribute("aria-disabled", "true");
  });
});
