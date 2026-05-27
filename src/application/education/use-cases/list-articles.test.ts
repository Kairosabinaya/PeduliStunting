import { describe, expect, it } from "vitest";

import { err, ok, type Result } from "@/domain/shared/result";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { EducationArticle } from "@/domain/education/entities/education-article";
import { asArticleId, asSlug } from "@/domain/shared/ids";
import type {
  ArticleListFilter,
  ArticleListResult,
  EducationArticleRepository,
} from "@/domain/education/ports/education-article-repository";

import { ListArticlesUseCase } from "./list-articles";

class InMemoryEducationRepo implements EducationArticleRepository {
  public lastFilter: ArticleListFilter | undefined;
  public lastSlug: string | undefined;

  constructor(
    private readonly articles: EducationArticle[],
    private readonly options: {
      readonly listError?: AppError;
      readonly findError?: AppError;
      readonly findResult?: EducationArticle | null;
    } = {},
  ) {}

  async list(
    filter?: ArticleListFilter,
  ): Promise<Result<ArticleListResult, AppError>> {
    this.lastFilter = filter;
    if (this.options.listError) return err(this.options.listError);
    return ok({ items: this.articles, total: this.articles.length });
  }

  async findBySlug(): Promise<Result<EducationArticle | null, AppError>> {
    if (this.options.findError) return err(this.options.findError);
    return ok(this.options.findResult ?? null);
  }
}

function makeArticle(slug: string): EducationArticle {
  return new EducationArticle({
    id: asArticleId("11111111-1111-4111-8111-111111111111"),
    slug: asSlug(slug),
    title: `Artikel ${slug}`,
    topic: "gizi",
    minAgeMonths: 0,
    maxAgeMonths: 6,
    summary: null,
    bodyMd: null,
    sourceLabel: null,
    sourceUrl: null,
    publishedAt: new Date("2026-05-20T00:00:00.000Z"),
  });
}

describe("ListArticlesUseCase", () => {
  describe("execute", () => {
    it("returns an empty list with total 0 when the repository is empty", async () => {
      const repo = new InMemoryEducationRepo([]);
      const useCase = new ListArticlesUseCase(repo);

      const result = await useCase.execute();

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toEqual([]);
      expect(result.value.total).toBe(0);
    });

    it("maps domain entities to DTOs preserving the total count", async () => {
      const articles = [makeArticle("a"), makeArticle("b")];
      const repo = new InMemoryEducationRepo(articles);
      const useCase = new ListArticlesUseCase(repo);

      const result = await useCase.execute();

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toHaveLength(2);
      expect(result.value.items[0]?.slug).toBe("a");
      expect(result.value.items[0]?.topic).toBe("gizi");
      expect(result.value.items[0]?.publishedAt).toBe(
        "2026-05-20T00:00:00.000Z",
      );
      expect(result.value.total).toBe(2);
    });

    it("forwards the filter to the repository unchanged", async () => {
      const repo = new InMemoryEducationRepo([]);
      const useCase = new ListArticlesUseCase(repo);
      const filter: ArticleListFilter = {
        topic: "gizi",
        ageRange: { kind: "child", minAgeMonths: 0, maxAgeMonths: 6 },
        search: "ASI",
        limit: 12,
        offset: 0,
      };

      await useCase.execute(filter);

      expect(repo.lastFilter).toEqual(filter);
    });

    it("propagates repository errors verbatim", async () => {
      const repo = new InMemoryEducationRepo([], {
        listError: AppErrors.externalService("supabase down", "supabase"),
      });
      const useCase = new ListArticlesUseCase(repo);

      const result = await useCase.execute();

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.kind).toBe("external_service");
    });
  });
});
