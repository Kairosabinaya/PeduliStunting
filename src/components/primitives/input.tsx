import { forwardRef, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const inputVariants = cva(
  "block w-full rounded-md border bg-surface px-3 text-sm text-foreground transition-colors transition-shadow placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      size: {
        sm: "h-9",
        md: "h-11",
        lg: "h-12",
      },
      tone: {
        default: "border-border",
        error: "border-danger focus-visible:ring-danger",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "default",
    },
  },
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Optional description rendered below the field. */
  readonly hint?: string | undefined;
  /** Validation error message (sets `aria-invalid` and tone="error"). */
  readonly errorMessage?: string | undefined;
  /**
   * Decorative icon rendered inside the input, anchored to the left edge.
   * Pass an inline SVG sized 16-18 px; the wrapper absolutely positions
   * it and the field gets `pl-10` to compensate. The icon is marked
   * `aria-hidden` so the associated `<Label>` remains the only label.
   */
  readonly leftIcon?: ReactNode;
}

/**
 * Text input. Pair with `<Label>` and pass `errorMessage` when validation
 * fails — the input automatically switches to error styling and surfaces the
 * message to assistive tech via `aria-describedby`.
 *
 * @example
 * ```tsx
 * <div className="space-y-1.5">
 *   <Label htmlFor="email" required>Email</Label>
 *   <Input id="email" type="email" autoComplete="email" />
 * </div>
 * ```
 *
 * @example With error
 * ```tsx
 * <Input errorMessage="Email tidak valid" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size, tone, hint, errorMessage, leftIcon, id, ...rest },
  ref,
) {
  const describedById = errorMessage
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;
  const resolvedTone = errorMessage ? "error" : tone;
  return (
    <div className="w-full">
      <div className="relative">
        {leftIcon ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
          >
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            inputVariants({ size, tone: resolvedTone }),
            leftIcon ? "pl-10" : null,
            className,
          )}
          {...rest}
        />
      </div>
      {errorMessage ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {errorMessage}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export { inputVariants };
