/** Claude API client — wraps Anthropic SDK for LLM features. */
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-20250514";

/** Generate text using Claude API. */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000
): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = message.content[0];
  if (block.type === "text") {
    return block.text;
  }
  return "";
}
