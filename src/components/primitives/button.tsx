import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-brand-600 active:bg-brand-700",
        secondary:
          "bg-surface text-foreground border border-border shadow-xs hover:bg-surface-muted",
        ghost: "bg-transparent text-foreground hover:bg-surface-muted",
        outline:
          "bg-transparent text-primary border border-primary hover:bg-brand-50 dark:hover:bg-brand-900",
        danger:
          "bg-danger text-white shadow-sm hover:opacity-90 active:opacity-80",
        link: "text-primary underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11 p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Replace content with a spinner and disable interactions. */
  readonly loading?: boolean;
}

/**
 * Primary action element. Touch target is at least 44px tall on `size="md"`
 * per project guidelines §9. For link-styled actions, wrap a Next `Link` with the
 * `buttonVariants` helper rather than nesting interactive elements.
 *
 * @example Primary (default)
 * ```tsx
 * <Button onClick={save}>Simpan</Button>
 * ```
 *
 * @example Loading state
 * ```tsx
 * <Button loading>Menyimpan</Button>
 * ```
 *
 * @example As link
 * ```tsx
 * <Link href="/auth/sign-in" className={buttonVariants({ variant: "outline" })}>
 *   Masuk
 * </Link>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      disabled,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        data-loading={loading ? "" : undefined}
        disabled={disabled ?? loading}
        {...rest}
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

export { buttonVariants };
