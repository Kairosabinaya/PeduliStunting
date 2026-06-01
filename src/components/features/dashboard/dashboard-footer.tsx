import { DASHBOARD_FOOTER } from "@/config/dashboard";
import { cn } from "@/lib/cn";

/**
 * Data-source attribution required for the public dashboard (SSGI/SKI Kemenkes
 * for prevalence, BPS for the socio-economic predictors), plus a one-line model
 * provenance note.
 */
export function DashboardFooter({
  className,
  labelClassName,
}: {
  readonly className?: string;
  readonly labelClassName?: string;
} = {}) {
  return (
    <footer
      className={cn(
        "space-y-1 border-t border-border pt-6 text-sm text-muted-foreground",
        className,
      )}
    >
      <p>
        <span className={cn("font-medium text-foreground", labelClassName)}>
          {DASHBOARD_FOOTER.sourcesLabel}:
        </span>{" "}
        {DASHBOARD_FOOTER.sources}
      </p>
    </footer>
  );
}
