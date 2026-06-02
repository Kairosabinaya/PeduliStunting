import { COPYRIGHT_NOTICE } from "@/config/app";
import { cn } from "@/lib/cn";

interface SiteFooterProps {
  /** Layout-specific spacing override (e.g. top margin or page padding). */
  readonly className?: string;
}

/**
 * Site-wide copyright footer. Rendered at the bottom of every standard page
 * layout so each surface carries the same attribution from a single source
 * ({@link COPYRIGHT_NOTICE}). It is the page's lone `contentinfo` landmark, so
 * a layout must not nest it inside another `<footer>` (see `/data` and
 * `/prediksi`, which fold the copyright into `DashboardFooter` instead).
 *
 * Server Component: no interactivity, so it ships zero client JS.
 *
 * @example
 * ```tsx
 * // At the bottom of an authenticated layout's content container.
 * <SiteFooter className="mt-12" />
 * ```
 */
export function SiteFooter({ className }: SiteFooterProps = {}) {
  return (
    <footer
      className={cn(
        "pt-6 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      <p>{COPYRIGHT_NOTICE}</p>
    </footer>
  );
}
