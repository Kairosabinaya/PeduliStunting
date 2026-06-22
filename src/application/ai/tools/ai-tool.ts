/**
 * Framework-agnostic AI tool definition. Tools are defined here (application
 * layer) and translated into the AI SDK `tool()` shape by the infrastructure
 * adapter, so the `ai` package never leaks inward (DIP).
 */

import type { z } from "zod";

import type { AiToolOutput } from "@/application/ai/cards/ai-card";

/** A single tool the model may call. */
export interface AiToolDefinition {
  readonly description: string;
  readonly inputSchema: z.ZodTypeAny;
  /**
   * Runs the tool. Input has already been validated against `inputSchema` by
   * the SDK; {@link defineTool} re-parses it so `execute` receives a typed value
   * (defense in depth, no `as` cast on unvalidated input). Never throws — it
   * returns a {@link AiToolOutput} card or a structured failure.
   */
  execute(input: unknown): Promise<AiToolOutput>;
}

export type AiToolSet = Record<string, AiToolDefinition>;

/**
 * Create a typed tool definition. The `execute` callback receives the parsed,
 * typed input; the wrapper re-parses with the same Zod schema so the value is
 * runtime-validated at this boundary before use.
 *
 * @example
 * ```ts
 * const t = defineTool({
 *   description: "Echo a city",
 *   inputSchema: z.object({ city: z.string() }),
 *   execute: async ({ city }) => ({ ok: true, matches: [] }),
 * });
 * ```
 */
export function defineTool<TSchema extends z.ZodTypeAny>(def: {
  readonly description: string;
  readonly inputSchema: TSchema;
  readonly execute: (input: z.infer<TSchema>) => Promise<AiToolOutput>;
}): AiToolDefinition {
  return {
    description: def.description,
    inputSchema: def.inputSchema,
    execute: async (input: unknown): Promise<AiToolOutput> => {
      const parsed: z.infer<TSchema> = def.inputSchema.parse(input);
      return def.execute(parsed);
    },
  };
}
