import { z } from "zod";

import type { Tables } from "@/types/supabase";
import { AppErrors, type ValidationError } from "@/domain/errors/app-error";
import { type Result, err, ok } from "@/domain/shared/result";
import {
  type ArticleId,
  type Slug,
  asArticleId,
  asSlug,
} from "@/domain/shared/ids";
import { EducationArticle } from "@/domain/education/entities/education-article";
import {
  ARTICLE_TOPICS,
  type ArticleTopic,
} from "@/domain/education/value-objects/article-topic";

/* ─────────────────────────── input parsing ─────────────────────────── */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export const slugSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(SLUG_RE, "slug harus huruf-kecil-dipisah-tanda-strip")
  .transform((value): Slug => asSlug(value));

export const articleTopicSchema = z.enum(ARTICLE_TOPICS);

const childAgeRangeSchema = z
  .object({
    kind: z.literal("child"),
    minAgeMonths: z.number().int().min(0).max(120),
    maxAgeMonths: z.number().int().min(0).max(120),
  })
  .strict()
  .refine(
    (range) => range.minAgeMonths <= range.maxAgeMonths,
    "minAgeMonths harus <= maxAgeMonths",
  );

const prenatalAgeRangeSchema = z
  .object({ kind: z.literal("prenatal") })
  .strict();

export const articleAgeRangeSchema = z.discriminatedUnion("kind", [
  prenatalAgeRangeSchema,
  childAgeRangeSchema,
]);

export const articleListFilterSchema = z
  .object({
    topic: articleTopicSchema.optional(),
    ageRange: articleAgeRangeSchema.optional(),
    search: z.string().min(1).max(80).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  })
  .strict();

export type ArticleListFilterInput = z.infer<typeof articleListFilterSchema>;
export type ArticleAgeRangeInput = z.infer<typeof articleAgeRangeSchema>;

/* ─────────────────────────── DB row mappers ─────────────────────────── */

type EducationArticleRow = Tables<"education_articles">;

export function mapEducationArticleRow(
  row: EducationArticleRow,
): Result<EducationArticle, ValidationError> {
  const topicResult = articleTopicSchema.safeParse(row.topic);
  if (!topicResult.success) {
    return err(AppErrors.validation(`topic tidak valid: ${row.topic}`));
  }

  return ok(
    new EducationArticle({
      id: asArticleId(row.id) as ArticleId,
      slug: asSlug(row.slug),
      title: row.title,
      topic: topicResult.data as ArticleTopic,
      minAgeMonths: row.min_age_months,
      maxAgeMonths: row.max_age_months,
      summary: row.summary,
      bodyMd: row.body_md,
      sourceLabel: row.source_label,
      sourceUrl: row.source_url,
      publishedAt: row.published_at ? new Date(row.published_at) : null,
    }),
  );
}
