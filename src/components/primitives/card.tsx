import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const cardVariants = cva("rounded-xl border bg-surface text-foreground", {
  variants: {
    elevation: {
      flat: "shadow-none",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-5",
      lg: "p-6 md:p-8",
    },
  },
  defaultVariants: {
    elevation: "sm",
    padding: "md",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * Generic surface container. Compose {@link CardHeader}, {@link CardTitle},
 * {@link CardDescription}, {@link CardContent}, and {@link CardFooter} for
 * structured content.
 *
 * @example
 * ```tsx
 * <Card padding="md">
 *   <CardHeader>
 *     <CardTitle>Status pertumbuhan</CardTitle>
 *     <CardDescription>Hasil pengukuran terakhir.</CardDescription>
 *   </CardHeader>
 *   <CardContent>...</CardContent>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, elevation, padding, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ elevation, padding }), className)}
      {...rest}
    />
  );
});

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardHeader({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5", className)}
      {...rest}
    />
  );
});

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function CardTitle({ className, ...rest }, ref) {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-tight", className)}
      {...rest}
    />
  );
});

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...rest }, ref) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...rest}
    />
  );
});

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardContent({ className, ...rest }, ref) {
  return <div ref={ref} className={cn("mt-4", className)} {...rest} />;
});

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardFooter({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "mt-5 flex flex-wrap items-center justify-end gap-2",
        className,
      )}
      {...rest}
    />
  );
});
