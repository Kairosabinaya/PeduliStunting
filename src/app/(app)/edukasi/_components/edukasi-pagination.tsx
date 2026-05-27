import Link from "next/link";

import { cn } from "@/lib/cn";
import { EDUCATION_COPY } from "@/config/education";

import {
  buildEdukasiHref,
  type ParsedEdukasiFilters,
} from "../_lib/filters";

interface EdukasiPaginationProps {
  readonly filters: ParsedEdukasiFilters;
  readonly totalPages: number;
}

/**
 * Anchor-based previous/next pagination. Total-page count is derived in the
 * page component from `total / pageSize` so the pagination block only renders
 * when there is more than one page of results.
 */
export function EdukasiPagination({
  filters,
  totalPages,
}: EdukasiPaginationProps) {
  if (totalPages <= 1) return null;
  const current = Math.min(Math.max(filters.page, 1), totalPages);
  const hasPrev = current > 1;
  const hasNext = current < totalPages;

  return (
    <nav
      aria-label="Paginasi artikel"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p
        className="text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {EDUCATION_COPY.paginationStatus(current, totalPages)}
      </p>
      <div className="flex items-center gap-2">
        <PaginationLink
          href={buildEdukasiHref(filters, { page: current - 1 })}
          enabled={hasPrev}
        >
          {EDUCATION_COPY.paginationPrevious}
        </PaginationLink>
        <PaginationLink
          href={buildEdukasiHref(filters, { page: current + 1 })}
          enabled={hasNext}
        >
          {EDUCATION_COPY.paginationNext}
        </PaginationLink>
      </div>
    </nav>
  );
}

interface PaginationLinkProps {
  readonly href: string;
  readonly enabled: boolean;
  readonly children: React.ReactNode;
}

function PaginationLink({ href, enabled, children }: PaginationLinkProps) {
  const className = cn(
    "inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm font-medium transition-colors",
    enabled
      ? "bg-surface text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      : "cursor-not-allowed bg-surface-muted text-muted-foreground opacity-60",
  );
  if (!enabled) {
    return (
      <span aria-disabled className={className}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} prefetch={false} className={className}>
      {children}
    </Link>
  );
}
