/**
 * Public surface of the edukasi config. Re-exports the copy + token modules
 * so feature components import from a single path. Data (datasets, footnote
 * entries, quiz questions) lives in `src/data/edukasi/` instead.
 */

export { EDUKASI_METADATA, EDUKASI_SHORT_TITLE } from "./metadata";
export {
  EDU_DURATION,
  EDU_EASE,
  EDU_WORD_STAGGER_MS,
  EDU_INVIEW_MARGIN,
  EDU_FOOTNOTE_PREFIX,
  edukasiFootnoteHref,
} from "./tokens";

export {
  HERO_COPY,
  HERO_ILLUSTRATION,
  type HeroHeadlineWord,
} from "./copy/hero";
export {
  STAKES_COPY,
  BRAIN_DEVELOPMENT_TILES,
  type BrainDevelopmentTile,
} from "./copy/stakes";
export { HISTORY_COPY } from "./copy/history";
export { DETERMINANT_COPY } from "./copy/determinant";
export { TIMELINE_COPY } from "./copy/timeline";
export { GUIDE_COPY } from "./copy/guide";
export { MYTHS_COPY } from "./copy/myths";
export { POSYANDU_COPY } from "./copy/posyandu";
export { QUIZ_COPY } from "./copy/quiz";
export { CLOSING_COPY, type ClosingHeadlineWord } from "./copy/closing";
