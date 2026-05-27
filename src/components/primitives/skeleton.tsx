import { cn } from "@/lib/cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Placeholder block that mimics content shape while data loads. Match the
 * approximate width and number of rows of the final content so the layout
 * does not jump. Avoid using {@link Spinner} as the sole loading affordance.
 *
 * @example Single row
 * ```tsx
 * <Skeleton className="h-4 w-32" />
 * ```
 *
 * @example Card placeholder
 * ```tsx
 * <div className="space-y-3">
 *   <Skeleton className="h-5 w-2/3" />
 *   <Skeleton className="h-4 w-full" />
 *   <Skeleton className="h-4 w-5/6" />
 * </div>
 * ```
 */
export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className,
      )}
      {...rest}
    />
  );
}
