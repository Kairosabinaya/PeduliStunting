import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { Slug } from "@/domain/shared/ids";
import type { EducationArticle } from "@/domain/education/entities/education-article";
import type {
  ArticleListFilter,
  ArticleListResult,
  EducationArticleRepository,
} from "@/domain/education/ports/education-article-repository";
import { mapEducationArticleRow } from "@/schemas/education";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "id, slug, title, topic, min_age_months, max_age_months, summary, body_md, source_label, source_url, published_at, created_at, updated_at";

const DEFAULT_LIMIT = 12;
const DEFAULT_OFFSET = 0;

export class SupabaseEducationArticleRepository
  implements EducationArticleRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(
    filter?: ArticleListFilter,
  ): Promise<Result<ArticleListResult, AppError>> {
    try {
      const limit = filter?.limit ?? DEFAULT_LIMIT;
      const offset = filter?.offset ?? DEFAULT_OFFSET;

      let query = this.client
        .from("education_articles")
        .select(SELECT_COLUMNS, { count: "exact" })
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });

      if (filter?.topic !== undefined) {
        query = query.eq("topic", filter.topic);
      }

      if (filter?.ageRange !== undefined) {
        if (filter.ageRange.kind === "prenatal") {
          query = query
            .is("min_age_months", null)
            .is("max_age_months", null);
        } else {
          const { minAgeMonths, maxAgeMonths } = filter.ageRange;
          query = query
            .or(
              `min_age_months.not.is.null,max_age_months.not.is.null`,
            )
            .or(
              `min_age_months.is.null,min_age_months.lte.${maxAgeMonths}`,
            )
            .or(
              `max_age_months.is.null,max_age_months.gte.${minAgeMonths}`,
            );
        }
      }

      if (filter?.search !== undefined) {
        const escaped = escapeIlikePattern(filter.search);
        query = query.or(
          `title.ilike.%${escaped}%,summary.ilike.%${escaped}%`,
        );
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) return err(mapPostgrestError(error, "education_articles"));

      const items: EducationArticle[] = [];
      for (const row of data ?? []) {
        const mapped = mapEducationArticleRow(row);
        if (!mapped.ok) return err(mapped.error);
        items.push(mapped.value);
      }

      return ok({ items, total: count ?? items.length });
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "education_articles.list"),
      );
    }
  }

  async findBySlug(
    slug: Slug,
  ): Promise<Result<EducationArticle | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("education_articles")
        .select(SELECT_COLUMNS)
        .eq("slug", slug)
        .not("published_at", "is", null)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "education_articles"));
      if (data === null) return ok(null);
      const mapped = mapEducationArticleRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(
          cause,
          "education_articles.findBySlug",
        ),
      );
    }
  }
}

/**
 * Escape PostgREST/Postgres ILIKE special characters so user-provided search
 * terms cannot inject wildcards. Backslashes are escaped first to avoid
 * double-escaping the escape character itself. Commas, parentheses, and
 * single quotes are also escaped because PostgREST uses them as delimiters in
 * the `or=` query string.
 */
function escapeIlikePattern(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, "\\,")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}
