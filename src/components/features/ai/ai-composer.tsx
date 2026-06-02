"use client";

import { Send, Sparkles, Square } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { Button } from "@/components/primitives";
import { AI_COPY } from "@/config/ai-copy";

import type { UseAiChatResult } from "./use-ai-chat";

/**
 * Floating composer pill (GeoPangan-style): an optional "Baru" reset on the left,
 * a borderless growing input, and a circular Send/Stop on the right. Enter sends,
 * Shift+Enter inserts a newline.
 */
export function AiComposer({
  status,
  onSend,
  onStop,
  onReset,
  showReset,
  onFocusChange,
  autoFocus,
}: {
  readonly status: UseAiChatResult["status"];
  readonly onSend: (text: string) => void;
  readonly onStop: () => void;
  readonly onReset: () => void;
  readonly showReset: boolean;
  readonly onFocusChange?: (focused: boolean) => void;
  readonly autoFocus?: boolean | undefined;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBusy = status === "streaming" || status === "submitted";

  // Focus on mount when opened by activating the lightweight shell, so the
  // handoff feels seamless. Ref-based to avoid the `autoFocus` a11y rule.
  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  function submit() {
    if (isBusy || value.trim().length === 0) return;
    onSend(value);
    setValue("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-floating flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-1.5"
    >
      {showReset ? (
        <button
          type="button"
          onClick={onReset}
          aria-label={AI_COPY.newSessionLabel}
          className="flex min-h-11 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Sparkles className="size-3.5 text-primary" />
          {AI_COPY.newSessionLabel}
        </button>
      ) : null}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => onFocusChange?.(false)}
        rows={1}
        placeholder={AI_COPY.placeholder}
        aria-label={AI_COPY.placeholder}
        className="max-h-32 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {isBusy ? (
        <Button
          type="button"
          variant="danger"
          size="icon"
          className="rounded-full"
          onClick={onStop}
          aria-label={AI_COPY.stopLabel}
        >
          <Square className="size-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          variant="primary"
          size="icon"
          className="rounded-full"
          disabled={value.trim().length === 0}
          aria-label={AI_COPY.sendLabel}
        >
          <Send className="size-4" />
        </Button>
      )}
    </form>
  );
}
