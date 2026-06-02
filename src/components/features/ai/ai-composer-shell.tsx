"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/primitives";
import { AI_COPY } from "@/config/ai-copy";

/**
 * Lightweight, always-visible composer placeholder shown before the heavy chat
 * engine (useChat + AI SDK + recharts + katex) is loaded. Looks identical to the
 * real composer pill; focusing/clicking it activates the real panel. Carries no
 * AI dependencies, so it never weighs on the initial route bundle.
 */
export function AiComposerShell({
  onActivate,
}: {
  readonly onActivate: () => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onActivate();
      }}
      className="glass-floating flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-1.5"
    >
      <textarea
        rows={1}
        readOnly
        placeholder={AI_COPY.placeholder}
        aria-label={AI_COPY.placeholder}
        onFocus={onActivate}
        onClick={onActivate}
        className="max-h-32 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button
        type="submit"
        variant="primary"
        size="icon"
        className="rounded-full"
        aria-label={AI_COPY.sendLabel}
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
