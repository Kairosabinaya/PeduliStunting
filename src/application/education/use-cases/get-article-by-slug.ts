import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { Slug } from "@/domain/shared/ids";
import type { EducationArticleRepository } from "@/domain/education/ports/education-article-repository";
import { toEducationArticleDto, type EducationArticleDto } from "../dtos";

export class GetArticleBySlugUseCase {
  constructor(private readonly repository: EducationArticleRepository) {}

  async execute(
    slug: Slug,
  ): Promise<Result<EducationArticleDto | null, AppError>> {
    const result = await this.repository.findBySlug(slug);
    return map(result, (row) => (row ? toEducationArticleDto(row) : null));
  }
}
