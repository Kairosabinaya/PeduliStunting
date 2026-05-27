import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { EducationArticleDto } from "@/application/education/dtos";
import { EDUCATION_COPY, EDUCATION_TOPIC_INDEX } from "@/config/education";

import { ArticleCard } from "./article-card";

const childArticle: EducationArticleDto = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "asi-eksklusif-6-bulan",
  title: "ASI Eksklusif 6 Bulan Pertama",
  topic: "gizi",
  minAgeMonths: 0,
  maxAgeMonths: 6,
  summary: "Manfaat ASI dan teknik menyusui yang benar untuk bayi.",
  bodyMd: "# ASI",
  sourceLabel: "Buku KIA 2024",
  sourceUrl: "https://example.test/kia",
  publishedAt: "2026-01-01T00:00:00.000Z",
};

const prenatalArticle: EducationArticleDto = {
  ...childArticle,
  id: "22222222-2222-2222-2222-222222222222",
  slug: "persiapan-kehamilan",
  title: "Persiapan Kehamilan Sehat",
  topic: "kehamilan",
  minAgeMonths: null,
  maxAgeMonths: null,
  summary: null,
  sourceLabel: null,
};

describe("ArticleCard", () => {
  it("links to the article detail page via the slug", () => {
    render(<ArticleCard article={childArticle} />);
    const link = screen.getByRole("link", { name: /baca artikel/i });
    expect(link).toHaveAttribute(
      "href",
      `/edukasi/${childArticle.slug}`,
    );
  });

  it("exposes the title and summary content", () => {
    render(<ArticleCard article={childArticle} />);
    expect(screen.getByText(childArticle.title)).toBeInTheDocument();
    if (childArticle.summary)
      expect(screen.getByText(childArticle.summary)).toBeInTheDocument();
  });

  it("renders topic and age badges for a child article", () => {
    render(<ArticleCard article={childArticle} />);
    const topicLabel = EDUCATION_TOPIC_INDEX[childArticle.topic].label;
    expect(screen.getByText(topicLabel)).toBeInTheDocument();
    expect(screen.getByText("0-6 bln")).toBeInTheDocument();
  });

  it("omits the age badge and source line for a prenatal article without a source", () => {
    render(<ArticleCard article={prenatalArticle} />);
    expect(screen.queryByText(/bln/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(EDUCATION_COPY.cardSourcePrefix, "i")),
    ).not.toBeInTheDocument();
  });

  it("renders the source label when present", () => {
    render(<ArticleCard article={childArticle} />);
    expect(
      screen.getByText(/Buku KIA 2024/i),
    ).toBeInTheDocument();
  });

  it("uses an accessible name that includes the call-to-action and title", () => {
    render(<ArticleCard article={childArticle} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName(
      `${EDUCATION_COPY.cardReadMore}: ${childArticle.title}`,
    );
  });
});
