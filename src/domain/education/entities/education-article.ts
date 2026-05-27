import type { ArticleId, Slug } from "@/domain/shared/ids";
import type { ArticleTopic } from "../value-objects/article-topic";

export class EducationArticle {
  readonly id: ArticleId;
  readonly slug: Slug;
  readonly title: string;
  readonly topic: ArticleTopic;
  readonly minAgeMonths: number | null;
  readonly maxAgeMonths: number | null;
  readonly summary: string | null;
  readonly bodyMd: string | null;
  readonly sourceLabel: string | null;
  readonly sourceUrl: string | null;
  readonly publishedAt: Date | null;

  constructor(props: {
    id: ArticleId;
    slug: Slug;
    title: string;
    topic: ArticleTopic;
    minAgeMonths: number | null;
    maxAgeMonths: number | null;
    summary: string | null;
    bodyMd: string | null;
    sourceLabel: string | null;
    sourceUrl: string | null;
    publishedAt: Date | null;
  }) {
    this.id = props.id;
    this.slug = props.slug;
    this.title = props.title;
    this.topic = props.topic;
    this.minAgeMonths = props.minAgeMonths;
    this.maxAgeMonths = props.maxAgeMonths;
    this.summary = props.summary;
    this.bodyMd = props.bodyMd;
    this.sourceLabel = props.sourceLabel;
    this.sourceUrl = props.sourceUrl;
    this.publishedAt = props.publishedAt;
  }
}
