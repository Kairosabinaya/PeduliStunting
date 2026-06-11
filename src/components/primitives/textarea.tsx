import { forwardRef } from "react";

import { cn } from "@/lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly hint?: string | undefined;
  readonly errorMessage?: string | undefined;
}

/**
 * Multi-line text input. Shares hint/error semantics with {@link Input}.
 *
 * @example
 * ```tsx
 * <Textarea id="catatan" rows={4} placeholder="Catatan tambahan" />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, hint, errorMessage, id, ...rest }, ref) {
    const describedById = errorMessage
      ? `${id}-error`
      : hint
        ? `${id}-hint`
        : undefined;
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          id={id}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            "block w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground transition-colors transition-shadow placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
            errorMessage
              ? "border-danger focus-visible:ring-danger"
              : "border-border",
            className,
          )}
          {...rest}
        />
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
