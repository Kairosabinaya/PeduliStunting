import { DASHBOARD_FOOTER } from "@/config/dashboard";

/**
 * Data-source attribution required for the public dashboard (SSGI/SKI Kemenkes
 * for prevalence, BPS for the socio-economic predictors), plus a one-line model
 * provenance note.
 */
export function DashboardFooter() {
  return (
    <footer className="space-y-1 border-t border-border pt-6 text-sm text-muted-foreground">
      <p>
        <span className="font-medium text-foreground">
          {DASHBOARD_FOOTER.sourcesLabel}:
        </span>{" "}
        {DASHBOARD_FOOTER.sources}
      </p>
    </footer>
  );
}
