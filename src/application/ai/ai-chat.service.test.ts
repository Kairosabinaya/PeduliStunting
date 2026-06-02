import { describe, expect, it } from "vitest";

import { fakeChatModel, fakeLogger } from "../../../tests/factories/ai";
import {
  AiChatService,
  buildSystemPrompt,
  sanitizeMessages,
} from "./ai-chat.service";
import type { ChatMessageInput } from "@/schemas/ai";

describe("sanitizeMessages", () => {
  it("keeps only non-empty text parts of user/assistant messages", () => {
    const messages: ChatMessageInput[] = [
      { role: "system", parts: [{ type: "text", text: "ignore" }] },
      {
        role: "user",
        parts: [{ type: "text", text: "halo" }, { type: "tool-x" }],
      },
      { role: "assistant", parts: [{ type: "text", text: "" }] },
    ];
    const out = sanitizeMessages(messages);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({
      role: "user",
      parts: [{ type: "text", text: "halo" }],
    });
  });
});

describe("buildSystemPrompt", () => {
  it("includes the language rule, page fragment, and fenced context", () => {
    const prompt = buildSystemPrompt("tracker", "RINGKASAN-ANAK");
    expect(prompt).toContain("Bahasa Indonesia");
    expect(prompt).toContain("TRACKER");
    expect(prompt).toContain("RINGKASAN-ANAK");
  });
});

describe("AiChatService.startStream", () => {
  it("returns a stream result on success", async () => {
    const service = new AiChatService(fakeChatModel(), fakeLogger());
    const result = await service.startStream({
      pageId: "map",
      pageContext: { pageId: "map", summary: "x" },
      messages: [{ role: "user", parts: [{ type: "text", text: "hi" }] }],
      tools: {},
    });
    expect(result.ok).toBe(true);
  });

  it("rejects when no text remains after sanitization", async () => {
    const service = new AiChatService(fakeChatModel(), fakeLogger());
    const result = await service.startStream({
      pageId: "map",
      pageContext: { pageId: "map", summary: "x" },
      messages: [{ role: "system", parts: [{ type: "text", text: "x" }] }],
      tools: {},
    });
    expect(result.ok).toBe(false);
  });
});
