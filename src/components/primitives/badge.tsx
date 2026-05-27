import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        primary: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100",
        success: "bg-accent-soft text-accent-foreground",
        warning: "bg-ordinal-sedang/20 text-ordinal-sedang-foreground",
        danger: "bg-ordinal-tinggi/20 text-ordinal-tinggi",
        rendah: "bg-ordinal-rendah text-ordinal-rendah-foreground",
        sedang: "bg-ordinal-sedang text-ordinal-sedang-foreground",
        tinggi: "bg-ordinal-tinggi text-ordinal-tinggi-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
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
