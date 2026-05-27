import "server-only";

import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

/**
 * Render a trusted-but-author-provided markdown string into sanitized HTML.
 *
 * `body_md` columns are written by admins (RLS-guarded). DOMPurify is still
 * applied as defence in depth so a compromised admin or an upstream change
 * to `marked` cannot inject script tags into a Server Component.
 *
 * The output is wrapped in a Tailwind Typography prose block by the caller —
 * this function returns the raw, sanitized HTML fragment.
 *
 * @example
 * ```ts
 * const html = renderArticleMarkdown(article.bodyMd ?? "");
 * <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
 * ```
 */
export function renderArticleMarkdown(source: string): string {
  if (source.trim().length === 0) return "";
  const rendered = marked.parse(source, {
    async: false,
    gfm: true,
    breaks: false,
  }) as string;
  return DOMPurify.sanitize(rendered, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "style"],
  });
}
