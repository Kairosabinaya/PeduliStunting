import Link from "next/link";

import type { EducationArticleDto } from "@/application/education/dtos";
import { Badge } from "@/components/primitives/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import {
  EDUCATION_COPY,
  EDUCATION_TOPIC_INDEX,
  formatEducationAgeRange,
} from "@/config/education";

interface ArticleCardProps {
  readonly article: EducationArticleDto;
}

/**
 * One article in the `/edukasi` grid. The whole card is a `<Link>` so the
 * touch target spans the full 44px-minimum surface on mobile and exposes a
 * single landmark to assistive tech. Topic and age badges describe the
 * audience at a glance; `<CardDescription>` shows the summary; the source
 * label is muted to keep the title prominent.
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const topic = EDUCATION_TOPIC_INDEX[article.topic];
  const ageLabel = formatEducationAgeRange(
    article.minAgeMonths,
    article.maxAgeMonths,
  );
  return (
    <Card padding="md" className="h-full">
      <Link
        href={`/edukasi/${article.slug}`}
        prefetch={false}
        className="flex h-full flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`${EDUCATION_COPY.cardReadMore}: ${article.title}`}
      >
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={topic.tone}>{topic.label}</Badge>
            {ageLabel ? <Badge tone="neutral">{ageLabel}</Badge> : null}
          </div>
          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
          {article.summary ? (
            <CardDescription className="line-clamp-3">
              {article.summary}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-2 pt-4">
          {article.sourceLabel ? (
            <p className="text-xs text-muted-foreground">
              {EDUCATION_COPY.cardSourcePrefix}: {article.sourceLabel}
            </p>
          ) : null}
          <span className="text-sm font-medium text-primary">
            {EDUCATION_COPY.cardReadMore}
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
