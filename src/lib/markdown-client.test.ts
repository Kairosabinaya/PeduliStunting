import { describe, expect, it } from "vitest";

import { renderChatMarkdown } from "./markdown-client";

describe("renderChatMarkdown", () => {
  it("renders GitHub-flavoured markdown to HTML", () => {
    const html = renderChatMarkdown("**tebal**");
    expect(html).toContain("<strong>tebal</strong>");
  });

  it("strips script tags and event handlers (untrusted AI output)", () => {
    const html = renderChatMarkdown(
      "halo <script>alert(1)</script> <img src=x onerror=alert(1)>",
    );
    expect(html).not.toContain("<script>");
    expect(html.toLowerCase()).not.toContain("onerror");
  });
});
