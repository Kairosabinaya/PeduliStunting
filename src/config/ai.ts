/**
 * Structural constants for the Gemini AI assistant.
 *
 * Every AI-related identifier (page ids, tool names, card types) and every
 * numeric limit (cost/latency guards) lives here so no magic strings or numbers
 * leak into the feature code (project guidelines §2.2, §10). System-prompt text lives in
 * {@link file://./ai-prompts.ts} and user-facing copy in
 * {@link file://./ai-copy.ts}.
 */

/** The server endpoint the client transport posts to. */
export const AI_CHAT_ENDPOINT = "/api/ai/chat";

/** The four surfaces that mount the AI panel. */
export const AI_PAGE_IDS = ["map", "data", "prediksi", "tracker"] as const;
export type AiPageId = (typeof AI_PAGE_IDS)[number];

/** Returns true when `value` is one of the supported AI page ids. */
export function isAiPageId(value: string): value is AiPageId {
  return (AI_PAGE_IDS as readonly string[]).includes(value);
}

/** Page ids that require an authenticated session to use the assistant. */
export const AI_AUTH_REQUIRED_PAGES: readonly AiPageId[] = ["tracker"] as const;

/**
 * Tool names the model may call. The string values double as the discriminant
 * suffix of UI message parts (`tool-${name}`) on the client.
 */
export const AI_TOOL_NAMES = {
  findRegion: "findRegion",
  compareRegions: "compareRegions",
  rankRegions: "rankRegions",
  regionTrend: "regionTrend",
  regionPrediction: "regionPrediction",
  trackerChildCondition: "trackerChildCondition",
} as const;
export type AiToolName = (typeof AI_TOOL_NAMES)[keyof typeof AI_TOOL_NAMES];

/** Discriminants for the structured cards a tool result renders into. */
export const AI_CARD_TYPES = {
  compareRegions: "compare-regions",
  rankRegions: "rank-regions",
  regionTrend: "region-trend",
  regionPrediction: "region-prediction",
  childCondition: "child-condition",
} as const;
export type AiCardType = (typeof AI_CARD_TYPES)[keyof typeof AI_CARD_TYPES];

/** Aspects the tracker child-condition tool can summarise. */
export const AI_CHILD_ASPECTS = [
  "growth",
  "immunization",
  "milestone",
  "overall",
] as const;
export type AiChildAspect = (typeof AI_CHILD_ASPECTS)[number];

/**
 * Hard limits that bound cost and latency.
 */
export const AI_LIMITS = {
  /** Max generation/tool-call steps per turn (`stopWhen: stepCountIs`). */
  maxSteps: 6,
  /** Max chat messages accepted per request (history is client-side). */
  maxMessagesPerTurn: 40,
  /** Max characters in a single user text part (input guard). */
  maxMessageChars: 2000,
  /** Max chars of on-screen text captured from the page (token/cost guard). */
  maxScreenTextChars: 3000,
  /** Route `maxDuration` in seconds. */
  maxDurationSeconds: 30,
  /** Max regions a compare card may include. */
  maxCompareRegions: 4,
  /** Min regions a compare card needs. */
  minCompareRegions: 2,
  /** Max rows a ranking card may include. */
  maxRankLimit: 10,
  /** Max matches `findRegion` returns. */
  maxRegionMatches: 8,
} as const;

/**
 * Model generation parameters passed through to `streamText`. Kept here (not as
 * magic numbers in the infrastructure adapter) so tuning is one edit.
 *
 * - `temperature` 0.4: focused, consistent answers (avoids the rambling/off-topic
 *   replies that Gemini's default ~1.0 produces) while staying natural.
 * - `thinkingBudgetTokens` 1024: a small reasoning budget on `gemini-2.5-flash`
 *   so multi-part questions are answered coherently without much added latency.
 *   Set to 0 to disable thinking for the fastest possible first token.
 */
export const AI_GENERATION = {
  temperature: 0.4,
  thinkingBudgetTokens: 1024,
} as const;

/**
 * Gemini safety thresholds (provider option). The assistant is a health/nutrition
 * educator, so the default MODERATE filters over-block legitimate questions about
 * malnutrition, child health, and medical concepts — a frequent cause of the
 * model refusing ("tidak bisa membantu"). `BLOCK_ONLY_HIGH` still blocks
 * genuinely harmful content while letting clinical/educational topics through.
 */
export const AI_SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
] as const;

/**
 * Lower-cased phrases that signal the user is pointing at on-screen content.
 * When the latest message contains none of these, the captured page text is NOT
 * attached to the prompt — a big token saving on self-contained questions.
 */
export const AI_SCREEN_REFERENCE_KEYWORDS: readonly string[] = [
  "rumus",
  "grafik",
  "diagram",
  "chart",
  "tabel",
  "gambar",
  "kartu",
  "di atas",
  "di bawah",
  "di layar",
  "yang tampil",
  "yang terlihat",
  "ditampilkan",
  "yang muncul",
  "tampilan ini",
  // Deictic/intent phrases: "jelaskan ini", "apa maksudnya", "kenapa begini"
  // implicitly point at what the user is looking at, so the on-screen text
  // should be attached (without these it was dropped and the model answered
  // generically — "ga nyambung"). Phrase-level on purpose so the definitional
  // "apa itu stunting" stays excluded (bare "itu"/"ini" would over-trigger).
  "maksud",
  "artinya",
  "tersebut",
  "jelaskan ini",
  "jelaskan itu",
  "ini apa",
  "itu apa",
  "apa ini",
  "kenapa begini",
  "kenapa begitu",
];
