import { forwardRef } from "react";

import { cn } from "@/lib/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readonly hint?: string | undefined;
  readonly errorMessage?: string | undefined;
}

/**
 * Native `<select>` styled to match {@link Input}. Native control is preferred
 * because it works on every mobile keyboard and respects platform UI.
 *
 * @example
 * ```tsx
 * <Select id="tahun" defaultValue={2024}>
 *   {SUPPORTED_YEARS.map((y) => (
 *     <option key={y} value={y}>{y}</option>
 *   ))}
 * </Select>
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { className, hint, errorMessage, id, children, ...rest },
    ref,
  ) {
    const describedById = errorMessage
      ? `${id}-error`
      : hint
        ? `${id}-hint`
        : undefined;
    return (
      <div className="w-full">
        <select
          ref={ref}
          id={id}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            "block h-11 w-full rounded-md border bg-surface pl-3 pr-9 text-sm text-foreground transition-colors transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
            errorMessage
              ? "border-danger focus-visible:ring-danger"
              : "border-border",
            className,
          )}
          {...rest}
        >
          {children}
        </select>
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
  },
);
