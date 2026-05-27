import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        primary:
          "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100",
        success: "bg-accent-soft text-accent-foreground",
        warning: "bg-ordinal-sedang/20 text-ordinal-sedang-foreground",
        danger: "bg-ordinal-tinggi/20 text-ordinal-tinggi",
        // Light mode: white bold text + dark shadow stays legible on the
        // saturated fills. Dark mode: the surrounding surface is already
        // dark, so flipping to dark text on the same saturated fill gives
        // stronger contrast than white-on-yellow ever can. Drop the shadow
        // in dark mode — it was compensating for a problem that no longer
        // exists once the text itself is dark.
        rendah:
          "label-shadow bg-ordinal-rendah font-bold text-white dark:text-slate-900 dark:[text-shadow:none]",
        sedang:
          "label-shadow bg-ordinal-sedang font-bold text-white dark:text-slate-900 dark:[text-shadow:none]",
        tinggi:
          "label-shadow bg-ordinal-tinggi font-bold text-white dark:text-slate-900 dark:[text-shadow:none]",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Compact label. Reserve the `rendah`/`sedang`/`tinggi` tones for the
 * stunting prevalence categories so the colour-meaning mapping stays
 * consistent across map, dashboard, and tracker surfaces.
 *
 * @example
 * ```tsx
 * <Badge tone="tinggi">Tinggi</Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, tone, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ tone }), className)}
      {...rest}
    />
  );
});

export { badgeVariants };
