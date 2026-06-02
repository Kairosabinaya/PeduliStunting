import DOMPurify from "isomorphic-dompurify";
import katex from "katex";
import { marked } from "marked";

const FORBID_TAGS = ["style", "script", "iframe", "form", "input"] as const;
const FORBID_ATTR = ["onerror", "onload", "onclick", "style"] as const;

/**
 * LaTeX math delimiters, processed in this order so `$$` is consumed before the
 * single-`$` inline pattern can split it.
 */
const MATH_PATTERNS: readonly {
  readonly regex: RegExp;
  readonly display: boolean;
}[] = [
  { regex: /\$\$([\s\S]+?)\$\$/g, display: true },
  { regex: /\\\[([\s\S]+?)\\\]/g, display: true },
  { regex: /\\\(([\s\S]+?)\\\)/g, display: false },
  { regex: /\$([^$\n]+?)\$/g, display: false },
];

/**
 * Render an untrusted markdown string into sanitized HTML for the chat panel,
 * with LaTeX math rendered via KaTeX (supports `**bold**` and `$...$`/`$$...$$`).
 *
 * Math is extracted to placeholders first, the surrounding text is strictly
 * sanitized (scripts/styles/event handlers stripped), then the trusted KaTeX
 * HTML is re-inserted. This keeps strict sanitization on the AI text while still
 * allowing KaTeX's inline-styled output (which DOMPurify would otherwise strip).
 */
export function renderChatMarkdown(source: string): string {
  const math: string[] = [];
  let working = source;
  for (const { regex, display } of MATH_PATTERNS) {
    working = working.replace(regex, (_match, tex: string) => {
      const index = math.length;
      math.push(
        katex.renderToString(tex.trim(), {
          displayMode: display,
          throwOnError: false,
        }),
      );
      return placeholder(index);
    });
  }

  const html = marked.parse(working, { async: false, gfm: true, breaks: true });
  let sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [...FORBID_TAGS],
    FORBID_ATTR: [...FORBID_ATTR],
  });

  math.forEach((rendered, index) => {
    sanitized = sanitized.split(placeholder(index)).join(rendered);
  });
  return sanitized;
}

/** Inert token that survives markdown parsing + sanitization unchanged. */
function placeholder(index: number): string {
  return `xKATEXMATHx${index}xENDx`;
}
