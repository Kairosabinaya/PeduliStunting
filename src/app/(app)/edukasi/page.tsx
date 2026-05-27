import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { PageHeader } from "@/components/primitives/page-header";
import {
  EDUCATION_COPY,
  EDUCATION_PAGE_SIZE,
} from "@/config/education";
import { fetchEducationArticles } from "@/lib/education-cache";

import { ArticleCard } from "./_components/article-card";
import { EdukasiFilters } from "./_components/edukasi-filters";
import { EdukasiPagination } from "./_components/edukasi-pagination";
import { EdukasiSearch } from "./_components/edukasi-search";
import {
  buildEdukasiHref,
  hasActiveEdukasiFilters,
  parseEdukasiFilters,
  toArticleListFilter,
  type EdukasiSearchParams,
} from "./_lib/filters";

export const metadata: Metadata = {
  title: EDUCATION_COPY.title,
  description: EDUCATION_COPY.description,
};

export const revalidate = 1800;

interface EdukasiPageProps {
  readonly searchParams: Promise<EdukasiSearchParams>;
}

export default async function EdukasiPage({ searchParams }: EdukasiPageProps) {
  const filters = parseEdukasiFilters(await searchParams);
  const result = await fetchEducationArticles(toArticleListFilter(filters));

  const clearFiltersHref = buildEdukasiHref(filters, {
    topic: "all",
    agePresetKey: "all",
    search: null,
  });
  const hasFilters = hasActiveEdukasiFilters(filters);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        eyebrow={EDUCATION_COPY.eyebrow}
        title={EDUCATION_COPY.title}
        description={EDUCATION_COPY.description}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,2fr)] lg:items-start">
        <EdukasiSearch filters={filters} />
        <EdukasiFilters filters={filters} />
      </div>

      {!result.ok ? (
        <ErrorState
          title={EDUCATION_COPY.errorTitle}
          description={EDUCATION_COPY.errorDescription}
          action={
            <Link
              href="/edukasi"
              prefetch={false}
              className={buttonVariants({ variant: "primary" })}
            >
              {EDUCATION_COPY.errorAction}
            </Link>
          }
        />
      ) : result.value.items.length === 0 ? (
        <EmptyState
          title={EDUCATION_COPY.emptyTitle}
          description={EDUCATION_COPY.emptyDescription}
          action={
            hasFilters ? (
              <Link
                href={clearFiltersHref}
                prefetch={false}
                className={buttonVariants({ variant: "outline" })}
              >
                {EDUCATION_COPY.emptyAction}
              </Link>
            ) : null
          }
        />
      ) : (
        <>
          <p
            className="text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {EDUCATION_COPY.resultsSummary(result.value.total)}
          </p>
          <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.value.items.map((article) => (
              <li key={article.id} className="h-full">
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
          <EdukasiPagination
            filters={filters}
            totalPages={Math.max(
              1,
              Math.ceil(result.value.total / EDUCATION_PAGE_SIZE),
            )}
          />
        </>
      )}
    </div>
  );
}
