import { Skeleton } from "@/components/primitives/skeleton";
import { EDUCATION_COPY } from "@/config/education";

/**
 * Route-level fallback for `/edukasi/[slug]`. Mirrors the production layout
 * (back link + header + body) so the swap to the real content does not shift
 * the page. Pure server markup — zero client JS.
 */
export default function EdukasiDetailLoading() {
  return (
    <div
      className="space-y-6 md:space-y-8"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-9/12" />
        <Skeleton className="h-4 w-full" />
      </div>
      <span className="sr-only">{EDUCATION_COPY.loadingLabel}</span>
    </div>
  );
}
