import { PageHeader } from "@/components/primitives/page-header";
import { Skeleton } from "@/components/primitives/skeleton";
import {
  EDUCATION_COPY,
  EDUCATION_PAGE_SIZE,
} from "@/config/education";

/**
 * Route-level fallback. Mirrors the production layout (header + filters +
 * grid) so the swap to the real content does not shift the page. Pure server
 * markup — zero client JS.
 */
export default function EdukasiLoading() {
  return (
    <div
      className="space-y-6 md:space-y-8"
      aria-busy="true"
      aria-live="polite"
    >
      <PageHeader
        eyebrow={EDUCATION_COPY.eyebrow}
        title={EDUCATION_COPY.title}
        description={EDUCATION_COPY.description}
      />
      <Skeleton className="h-12 w-full max-w-xl" />
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: EDUCATION_PAGE_SIZE }).map((_, index) => (
          <Skeleton key={index} className="h-56 w-full rounded-xl" />
        ))}
      </div>
      <span className="sr-only">{EDUCATION_COPY.loadingLabel}</span>
    </div>
  );
}
