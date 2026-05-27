import { describe, expect, it } from "vitest";

import { err, ok, type Result } from "@/domain/shared/result";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { EducationArticle } from "@/domain/education/entities/education-article";
import { asArticleId, asSlug, type Slug } from "@/domain/shared/ids";
import type {
  ArticleListFilter,
  ArticleListResult,
  EducationArticleRepository,
} from "@/domain/education/ports/education-article-repository";

import { GetArticleBySlugUseCase } from "./get-article-by-slug";

class StubRepo implements EducationArticleRepository {
  public lastSlug: Slug | undefined;

  constructor(
    private readonly article: EducationArticle | null,
    private readonly error?: AppError,
  ) {}

  async list(
    _filter?: ArticleListFilter,
  ): Promise<Result<ArticleListResult, AppError>> {
    return ok({ items: [], total: 0 });
  }

  async findBySlug(
    slug: Slug,
  ): Promise<Result<EducationArticle | null, AppError>> {
    this.lastSlug = slug;
    if (this.error) return err(this.error);
    return ok(this.article);
  }
}

function makeArticle(): EducationArticle {
  return new EducationArticle({
    id: asArticleId("11111111-1111-4111-8111-111111111111"),
    slug: asSlug("tanda-bahaya-kehamilan"),
    title: "Tanda Bahaya Kehamilan",
    topic: "kehamilan",
    minAgeMonths: null,
    maxAgeMonths: null,
    summary: "Daftar tanda bahaya kehamilan.",
    bodyMd: "# Hello",
    sourceLabel: "Buku KIA 2024 hal. 11",
    sourceUrl: "https://kesmas.kemkes.go.id/konten/133/0/buku-kia",
    publishedAt: new Date("2026-05-12T00:00:00.000Z"),
  });
}

describe("GetArticleBySlugUseCase", () => {
  describe("execute", () => {
    it("returns the mapped DTO when the article exists", async () => {
      const repo = new StubRepo(makeArticle());
      const useCase = new GetArticleBySlugUseCase(repo);

      const result = await useCase.execute(asSlug("tanda-bahaya-kehamilan"));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value?.slug).toBe("tanda-bahaya-kehamilan");
      expect(result.value?.topic).toBe("kehamilan");
      expect(result.value?.publishedAt).toBe("2026-05-12T00:00:00.000Z");
    });

    it("returns null when the article is missing", async () => {
      const repo = new StubRepo(null);
      const useCase = new GetArticleBySlugUseCase(repo);

      const result = await useCase.execute(asSlug("does-not-exist"));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBeNull();
    });

    it("propagates repository errors verbatim", async () => {
      const repo = new StubRepo(
        null,
        AppErrors.externalService("supabase down", "supabase"),
      );
      const useCase = new GetArticleBySlugUseCase(repo);

      const result = await useCase.execute(asSlug("any-slug"));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.kind).toBe("external_service");
    });
  });
});
