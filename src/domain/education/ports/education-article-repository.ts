import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";
import type { Slug } from "@/domain/shared/ids";
import type { EducationArticle } from "../entities/education-article";
import type { ArticleTopic } from "../value-objects/article-topic";

/**
 * Age constraint for {@link ArticleListFilter}. Prenatal articles store both
 * age bounds as NULL in the database. Child filters request overlap with
 * `[minAgeMonths, maxAgeMonths]` and exclude prenatal-only articles.
 */
export type ArticleAgeRange =
  | { readonly kind: "prenatal" }
  | {
      readonly kind: "child";
      readonly minAgeMonths: number;
      readonly maxAgeMonths: number;
    };

export interface ArticleListFilter {
  readonly topic?: ArticleTopic;
  readonly ageRange?: ArticleAgeRange;
  /** Case-insensitive substring match across title and summary. */
  readonly search?: string;
  /** Page size (defaults are enforced by use cases, not the repository). */
  readonly limit?: number;
  /** Zero-based offset into the result set. */
  readonly offset?: number;
}

export interface ArticleListResult {
  readonly items: readonly EducationArticle[];
  /** Total number of articles matching the filter, ignoring limit/offset. */
  readonly total: number;
}

export interface EducationArticleRepository {
  list(
    filter?: ArticleListFilter,
  ): Promise<Result<ArticleListResult, AppError>>;
  findBySlug(slug: Slug): Promise<Result<EducationArticle | null, AppError>>;
}
