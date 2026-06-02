/**
 * Translate framework-agnostic {@link AiToolSet} definitions into the AI SDK
 * `ToolSet` shape. This is the only place the application tools meet the `ai`
 * package, keeping `tool()` out of the application layer.
 */

import "server-only";

import { tool, type ToolSet } from "ai";

import type { AiToolSet } from "@/application/ai/tools/ai-tool";

export function toSdkTools(tools: AiToolSet): ToolSet {
  const sdkTools: ToolSet = {};
  for (const [name, definition] of Object.entries(tools)) {
    sdkTools[name] = tool({
      description: definition.description,
      inputSchema: definition.inputSchema,
      execute: async (input) => definition.execute(input),
    });
  }
  return sdkTools;
}
