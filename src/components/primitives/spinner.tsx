import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-current border-t-transparent",
  {
    variants: {
      size: {
        xs: "size-3 border",
        sm: "size-4 border-2",
        md: "size-5 border-2",
        lg: "size-8 border-[3px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SpinnerProps
  extends VariantProps<typeof spinnerVariants>,
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Accessible label announced by screen readers. */
  readonly label?: string;
}

/**
 * Indeterminate progress indicator. Reserve for use *inside* other primitives
 * (Button loading state, Skeleton overlays) — never as the only loading
 * affordance for page content; use Skeleton instead.
 *
 * @example
 * ```tsx
 * <Spinner size="sm" label="Memuat" />
 * ```
 */
export function Spinner({
  size,
  label = "Memuat",
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(spinnerVariants({ size }), className)}
      {...rest}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
