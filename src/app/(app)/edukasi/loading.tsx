import { Skeleton } from "@/components/primitives/skeleton";

/**
 * Skeleton for the /edukasi route. Matches the hero shape so the layout
 * does not jump while the static page is being streamed. Below-the-fold
 * ACTs render their own skeletons via their dynamic-import loading state.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[88svh] flex-col justify-center bg-edu-tint-warm pb-16 pt-28 sm:pt-32"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr]">
          <div>
            <Skeleton className="h-3 w-48" />
            <Skeleton className="mt-6 h-16 w-3/4" />
            <Skeleton className="mt-4 h-16 w-2/3" />
            <Skeleton className="mt-4 h-16 w-1/2" />
            <Skeleton className="mt-10 h-5 w-80" />
            <Skeleton className="mt-3 h-5 w-72" />
          </div>
          <div>
            <Skeleton className="aspect-square w-full max-w-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
