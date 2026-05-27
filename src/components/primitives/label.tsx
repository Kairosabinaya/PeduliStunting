import { forwardRef } from "react";

import { cn } from "@/lib/cn";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Mark the field as required (renders an asterisk + screen-reader text). */
  readonly required?: boolean;
}

/**
 * Form field label. Always wire `htmlFor` to the matching input `id`.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>Email</Label>
 * <Input id="email" type="email" />
 * ```
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, children, required, ...rest },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
      {required ? (
        <>
          <span aria-hidden className="ml-0.5 text-danger">
            *
          </span>
          <span className="sr-only"> wajib diisi</span>
        </>
      ) : null}
    </label>
  );
});
