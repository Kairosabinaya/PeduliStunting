import "server-only";

import { unstable_cache } from "next/cache";

import {
  EDUCATION_DETAIL_REVALIDATE_SECONDS,
  EDUCATION_LIST_CACHE_TAG,
  EDUCATION_LIST_REVALIDATE_SECONDS,
  educationArticleCacheTag,
} from "@/config/education";
import type {
  EducationArticleDto,
  EducationArticleListDto,
} from "@/application/education/dtos";
import { makeUseCases } from "@/composition";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { ArticleListFilter } from "@/domain/education/ports/education-article-repository";
import { asSlug } from "@/domain/shared/ids";
import { createSupabasePublicClient } from "@/infrastructure/supabase/server-client";

/**
 * Stable cache key for a list query. Order of fields is fixed so
 * `unstable_cache` recognises equivalent filters as the same key regardless of
 * the order callers pass options in.
 */
function listCacheKey(filter: ArticleListFilter): string {
  return JSON.stringify({
    topic: filter.topic ?? null,
    ageRange: filter.ageRange ?? null,
    search: filter.search ?? null,
    limit: filter.limit ?? null,
    offset: filter.offset ?? null,
  });
}

/**
 * Cached read of the `/edukasi` list. Tagged `articles` so admin mutators can
 * call `revalidateTag(EDUCATION_LIST_CACHE_TAG)` to flush every filter variant
 * in one shot.
 *
 * Articles are public (RLS allows anon SELECT), so the cookieless public
 * client is correct here — `unstable_cache` runs outside request scope and
 * cannot read cookies anyway.
 */
export async function fetchEducationArticles(
  filter: ArticleListFilter,
): Promise<Result<EducationArticleListDto, AppError>> {
  const key = listCacheKey(filter);
  const cached = unstable_cache(
    async (
      payload: string,
    ): Promise<Result<EducationArticleListDto, AppError>> => {
      const parsedFilter = JSON.parse(payload) as ArticleListFilter;
      const supabase = createSupabasePublicClient();
      return makeUseCases(supabase).listArticles.execute(parsedFilter);
    },
    ["education-articles-list", key],
    {
      revalidate: EDUCATION_LIST_REVALIDATE_SECONDS,
      tags: [EDUCATION_LIST_CACHE_TAG],
    },
  );
  return cached(key);
}

/**
 * Cached read of a single article by slug. Tagged `article:{slug}` so admins
 * editing one article do not invalidate every other article's cache entry.
 */
export async function fetchEducationArticleBySlug(
  slug: string,
): Promise<Result<EducationArticleDto | null, AppError>> {
  const cached = unstable_cache(
    async (
      key: string,
    ): Promise<Result<EducationArticleDto | null, AppError>> => {
      const supabase = createSupabasePublicClient();
      return makeUseCases(supabase).getArticleBySlug.execute(asSlug(key));
    },
    ["education-article", slug],
    {
      revalidate: EDUCATION_DETAIL_REVALIDATE_SECONDS,
      tags: [EDUCATION_LIST_CACHE_TAG, educationArticleCacheTag(slug)],
    },
  );
  return cached(slug);
}
