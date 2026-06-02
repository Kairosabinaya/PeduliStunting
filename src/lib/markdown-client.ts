/**
 * Client-safe markdown renderer for AI chat messages. The server-only
 * `markdown.ts` cannot be imported by client components (it is `server-only`),
 * so this mirror uses the browser `dompurify` build with the same allowlist.
 *
 * AI output is untrusted, so sanitization is mandatory: scripts, styles,
 * iframes, and event-handler attributes are stripped.
 */

import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

const FORBID_TAGS = ["style", "script", "iframe", "form", "input"] as const;
const FORBID_ATTR = ["onerror", "onload", "onclick", "style"] as const;

/** Render an untrusted markdown string into sanitized HTML for the chat panel. */
export function renderChatMarkdown(source: string): string {
  const html = marked.parse(source, {
    async: false,
    gfm: true,
    breaks: true,
  });
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [...FORBID_TAGS],
    FORBID_ATTR: [...FORBID_ATTR],
  });
}
