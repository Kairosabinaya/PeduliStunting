// Side effect first: switches Zod to jitless mode so no client bundle that
// contains these schemas ever runs the CSP-violating eval probe.
import "@/lib/zod-jitless";

/**
 * Zod schemas for the AI chat endpoint. Single source of truth for the request
 * shape and the page-context selection (project guidelines §4). Types are derived via
 * `z.infer`, never hand-duplicated.
 */

import { z } from "zod";

import { AI_LIMITS, AI_PAGE_IDS } from "@/config/ai";

/**
 * The untrusted selection the client sends. The server NEVER trusts data fields
 * here; it only uses these identifiers to rebuild a compact context from
 * authoritative use cases. `.strict()` rejects unexpected keys.
 */
export const PageContextSelectionSchema = z
  .object({
    pageId: z.enum(AI_PAGE_IDS),
    kodeBps: z.string().min(1).max(32).optional(),
    tahun: z.number().int().min(1900).max(3000).optional(),
    childId: z.string().uuid().optional(),
    // Client-captured visible page text (untrusted; treated as data, capped).
    screenText: z.string().max(AI_LIMITS.maxScreenTextChars).optional(),
  })
  .strict();

export type PageContextSelection = z.infer<typeof PageContextSelectionSchema>;

/** A text message part (the only part type the server honours from history). */
const ChatTextPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().max(AI_LIMITS.maxMessageChars),
});

/** Any non-text part (tool calls/results from history). Extra keys are stripped
 * and the part is later discarded so the client cannot forge tool outputs. */
const ChatOtherPartSchema = z.object({ type: z.string() });

const ChatPartSchema = z.union([ChatTextPartSchema, ChatOtherPartSchema]);

export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(ChatPartSchema).max(64),
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;

/**
 * The request body POSTed by the client transport. The AI SDK transport also
 * sends fields like `id`/`trigger`; this schema validates only what the server
 * needs and ignores the rest (default object strips unknown keys), so it is NOT
 * `.strict()`.
 */
export const AiChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(AI_LIMITS.maxMessagesPerTurn),
  pageContext: PageContextSelectionSchema,
});

export type AiChatRequest = z.infer<typeof AiChatRequestSchema>;
