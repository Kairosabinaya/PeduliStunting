import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type {
  ArticleListFilter,
  EducationArticleRepository,
} from "@/domain/education/ports/education-article-repository";
import {
  toEducationArticleDto,
  type EducationArticleListDto,
} from "../dtos";

/**
 * Returns a page of published articles together with the total count under
 * the same filter (so the presentation layer can render pagination). Filter
 * input is delegated unchanged to the repository — boundary validation lives
 * in `@/schemas/education#articleListFilterSchema`.
 */
export class ListArticlesUseCase {
  constructor(private readonly repository: EducationArticleRepository) {}

  async execute(
    filter?: ArticleListFilter,
  ): Promise<Result<EducationArticleListDto, AppError>> {
    const result = await this.repository.list(filter);
    return map(result, ({ items, total }) => ({
      items: items.map(toEducationArticleDto),
      total,
    }));
  }
}
