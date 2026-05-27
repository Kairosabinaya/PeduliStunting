/**
 * Pure helpers for the `/edukasi` filter URL. Kept apart from the page so the
 * parsing and href construction can be unit-tested without booting Next.js.
 */

import type { ArticleListFilter } from "@/domain/education/ports/education-article-repository";
import type { ArticleTopic } from "@/domain/education/value-objects/article-topic";
import {
  EDUCATION_AGE_PARAM,
  EDUCATION_AGE_PRESET_INDEX,
  EDUCATION_PAGE_PARAM,
  EDUCATION_PAGE_SIZE,
  EDUCATION_SEARCH_MAX_LENGTH,
  EDUCATION_SEARCH_MIN_LENGTH,
  EDUCATION_SEARCH_PARAM,
  EDUCATION_TOPIC_PARAM,
  isEducationAgePresetKey,
  isEducationTopicKey,
} from "@/config/education";

/**
 * Raw `searchParams` as received by a Next.js Server Component. Values may be
 * `string | string[] | undefined` — repeating params (e.g. `?topik=a&topik=b`)
 * arrive as arrays.
 */
export type EdukasiSearchParams = Readonly<
  Record<string, string | readonly string[] | undefined>
>;

export interface ParsedEdukasiFilters {
  readonly topic: ArticleTopic | undefined;
  readonly agePresetKey: string | undefined;
  readonly search: string | undefined;
  readonly page: number;
}

function firstParam(
  value: string | readonly string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  if (typeof value === "string") return value;
  return undefined;
}

/**
 * Parse query params into a clean filter shape. Unknown/invalid values fall
 * back to `undefined` rather than throwing — the page renders with the valid
 * subset so a malformed URL never breaks the experience.
 */
export function parseEdukasiFilters(
  params: EdukasiSearchParams,
): ParsedEdukasiFilters {
  const topicRaw = firstParam(params[EDUCATION_TOPIC_PARAM])?.toLowerCase();
  const topic = topicRaw && isEducationTopicKey(topicRaw) ? topicRaw : undefined;

  const ageRaw = firstParam(params[EDUCATION_AGE_PARAM])?.toLowerCase();
  const agePresetKey =
    ageRaw && isEducationAgePresetKey(ageRaw) ? ageRaw : undefined;

  const searchRaw = firstParam(params[EDUCATION_SEARCH_PARAM])?.trim() ?? "";
  const search =
    searchRaw.length >= EDUCATION_SEARCH_MIN_LENGTH &&
    searchRaw.length <= EDUCATION_SEARCH_MAX_LENGTH
      ? searchRaw
      : undefined;

  const pageRaw = firstParam(params[EDUCATION_PAGE_PARAM]);
  const pageNum = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
  const page =
    Number.isFinite(pageNum) && pageNum >= 1 ? Math.floor(pageNum) : 1;

  return { topic, agePresetKey, search, page };
}

/**
 * Translate the parsed filter into the repository-facing shape expected by
 * {@link ArticleListFilter}, including page-based pagination.
 */
export function toArticleListFilter(
  parsed: ParsedEdukasiFilters,
  pageSize: number = EDUCATION_PAGE_SIZE,
): ArticleListFilter {
  const filter: {
    -readonly [K in keyof ArticleListFilter]: ArticleListFilter[K];
  } = {
    limit: pageSize,
    offset: (parsed.page - 1) * pageSize,
  };
  if (parsed.topic !== undefined) filter.topic = parsed.topic;
  if (parsed.search !== undefined) filter.search = parsed.search;
  if (parsed.agePresetKey !== undefined) {
    const preset = EDUCATION_AGE_PRESET_INDEX[parsed.agePresetKey];
    if (preset) filter.ageRange = preset.range;
  }
  return filter;
}

interface BuildHrefOptions {
  readonly topic?: ArticleTopic | "all";
  readonly agePresetKey?: string | "all";
  readonly search?: string | null;
  readonly page?: number;
}

/**
 * Compose a new `/edukasi?...` href by overriding selected filters from the
 * current parsed state. Pass `"all"` to clear a filter; pass `undefined` to
 * preserve the current value; pass `null` for `search` to clear it.
 *
 * The page index is reset to 1 whenever any filter that affects the result
 * set changes, so a user never lands on an out-of-range page.
 */
export function buildEdukasiHref(
  base: ParsedEdukasiFilters,
  override: BuildHrefOptions = {},
): string {
  const next = new URLSearchParams();

  const topic =
    override.topic === "all"
      ? undefined
      : (override.topic ?? base.topic);
  if (topic) next.set(EDUCATION_TOPIC_PARAM, topic);

  const agePresetKey =
    override.agePresetKey === "all"
      ? undefined
      : (override.agePresetKey ?? base.agePresetKey);
  if (agePresetKey) next.set(EDUCATION_AGE_PARAM, agePresetKey);

  const search =
    override.search === null
      ? undefined
      : (override.search ?? base.search);
  if (search && search.length > 0) next.set(EDUCATION_SEARCH_PARAM, search);

  const filterChanged =
    override.topic !== undefined ||
    override.agePresetKey !== undefined ||
    override.search !== undefined;
  const page = override.page ?? (filterChanged ? 1 : base.page);
  if (page > 1) next.set(EDUCATION_PAGE_PARAM, String(page));

  const query = next.toString();
  return query.length > 0 ? `/edukasi?${query}` : "/edukasi";
}

/**
 * True if any filter that affects the result set is currently active. Used by
 * the UI to decide whether to expose a "Bersihkan filter" action.
 */
export function hasActiveEdukasiFilters(parsed: ParsedEdukasiFilters): boolean {
  return (
    parsed.topic !== undefined ||
    parsed.agePresetKey !== undefined ||
    parsed.search !== undefined
  );
}
