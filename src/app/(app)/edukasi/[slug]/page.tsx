import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/primitives/badge";
import { buttonVariants } from "@/components/primitives/button";
import { ErrorState } from "@/components/primitives/error-state";
import {
  EDUCATION_COPY,
  EDUCATION_DETAIL_COPY,
  EDUCATION_TOPIC_INDEX,
  formatEducationAudienceLabel,
} from "@/config/education";
import { fetchEducationArticleBySlug } from "@/lib/education-cache";
import { renderArticleMarkdown } from "@/lib/markdown";

interface EdukasiDetailPageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export const revalidate = 86_400;

export async function generateMetadata({
  params,
}: EdukasiDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchEducationArticleBySlug(slug);
  if (!result.ok || result.value === null) {
    return {
      title: EDUCATION_DETAIL_COPY.notFoundTitle,
    };
  }
  return {
    title: result.value.title,
    description: result.value.summary ?? EDUCATION_COPY.description,
  };
}

export default async function EdukasiDetailPage({
  params,
}: EdukasiDetailPageProps) {
  const { slug } = await params;
  const result = await fetchEducationArticleBySlug(slug);

  if (!result.ok) {
    return (
      <div className="space-y-6 md:space-y-8">
        <BackLink />
        <ErrorState
          title={EDUCATION_COPY.errorTitle}
          description={EDUCATION_COPY.errorDescription}
          action={
            <Link
              href="/edukasi"
              prefetch={false}
              className={buttonVariants({ variant: "primary" })}
            >
              {EDUCATION_DETAIL_COPY.notFoundAction}
            </Link>
          }
        />
      </div>
    );
  }

  if (result.value === null) {
    notFound();
  }

  const article = result.value;
  const topic = EDUCATION_TOPIC_INDEX[article.topic];
  const audienceLabel = formatEducationAudienceLabel(
    article.minAgeMonths,
    article.maxAgeMonths,
  );
  const bodyHtml = renderArticleMarkdown(article.bodyMd ?? "");
  const publishedAtLabel = article.publishedAt
    ? formatPublishedAt(article.publishedAt)
    : null;

  return (
    <article className="space-y-6 md:space-y-8">
      <BackLink />
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={topic.tone}>{topic.label}</Badge>
          <Badge tone="neutral">{audienceLabel}</Badge>
        </div>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          {article.title}
        </h1>
        {article.summary ? (
          <p className="max-w-prose text-base text-muted-foreground">
            {article.summary}
          </p>
        ) : null}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="space-y-0.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {EDUCATION_DETAIL_COPY.topicLabel}
            </dt>
            <dd className="text-foreground">{topic.label}</dd>
          </div>
          <div className="space-y-0.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {EDUCATION_DETAIL_COPY.ageLabel}
            </dt>
            <dd className="text-foreground">{audienceLabel}</dd>
          </div>
          {article.sourceLabel ? (
            <div className="space-y-0.5">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {EDUCATION_DETAIL_COPY.sourceLabel}
              </dt>
              <dd className="text-foreground">
                {article.sourceUrl ? (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {article.sourceLabel}
                  </a>
                ) : (
                  article.sourceLabel
                )}
              </dd>
            </div>
          ) : null}
          {publishedAtLabel ? (
            <div className="space-y-0.5">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {EDUCATION_DETAIL_COPY.publishedLabel}
              </dt>
              <dd className="text-foreground">
                <time dateTime={article.publishedAt ?? undefined}>
                  {publishedAtLabel}
                </time>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      {bodyHtml.length > 0 ? (
        <div
          className="prose prose-sm md:prose-base max-w-prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : null}

      {article.sourceUrl ? (
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          {EDUCATION_DETAIL_COPY.sourceLinkLabel}
        </a>
      ) : null}
    </article>
  );
}

function BackLink() {
  return (
    <Link
      href="/edukasi"
      prefetch={false}
      aria-label={EDUCATION_DETAIL_COPY.backLinkAria}
      className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      &larr; {EDUCATION_DETAIL_COPY.backLink}
    </Link>
  );
}

function formatPublishedAt(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
