import { COPYRIGHT_NOTICE } from "@/config/app";
import { DASHBOARD_FOOTER } from "@/config/dashboard";
import { cn } from "@/lib/cn";

/**
 * Data-source attribution required for the public dashboard (SSGI/SKI Kemenkes
 * for prevalence, BPS for the socio-economic predictors), plus the site-wide
 * copyright line. This is the lone `contentinfo` landmark on `/data` and
 * `/prediksi`, so those routes fold the copyright in here rather than also
 * rendering {@link SiteFooter}.
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
      <p>{COPYRIGHT_NOTICE}</p>
    </footer>
  );
}
