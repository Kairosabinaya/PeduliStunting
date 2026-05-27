import type { EducationArticle } from "@/domain/education/entities/education-article";
import type { ArticleTopic } from "@/domain/education/value-objects/article-topic";

export interface EducationArticleDto {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly topic: ArticleTopic;
  readonly minAgeMonths: number | null;
  readonly maxAgeMonths: number | null;
  readonly summary: string | null;
  readonly bodyMd: string | null;
  readonly sourceLabel: string | null;
  readonly sourceUrl: string | null;
  readonly publishedAt: string | null;
}

export interface EducationArticleListDto {
  readonly items: readonly EducationArticleDto[];
  readonly total: number;
}

export function toEducationArticleDto(
  article: EducationArticle,
): EducationArticleDto {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    topic: article.topic,
    minAgeMonths: article.minAgeMonths,
    maxAgeMonths: article.maxAgeMonths,
    summary: article.summary,
    bodyMd: article.bodyMd,
    sourceLabel: article.sourceLabel,
    sourceUrl: article.sourceUrl,
    publishedAt: article.publishedAt
      ? article.publishedAt.toISOString()
      : null,
  };
}
