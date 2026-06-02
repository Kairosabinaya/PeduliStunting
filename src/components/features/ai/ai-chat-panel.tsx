"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { RecommendedQuestionInput } from "@/application/ai/recommended-questions/build-recommended-questions";
import { Button, ErrorState } from "@/components/primitives";
import type { AiPageId } from "@/config/ai";
import { AI_COPY } from "@/config/ai-copy";
import { mapAppErrorToUi } from "@/lib/error-mapping";
import type { PageContextSelection } from "@/schemas/ai";

import { AiComposer } from "./ai-composer";
import { AiMessageList } from "./ai-message-list";
import { AiRateLimitNotice } from "./ai-rate-limit-notice";
import { AiRecommendedChips } from "./ai-recommended-chips";
import { useAiChat } from "./use-ai-chat";

export interface AiChatPanelProps {
  readonly pageId: AiPageId;
  readonly selection: PageContextSelection;
  readonly recommended: RecommendedQuestionInput;
  /** Focus the composer on mount (set when opened by activating the shell). */
  readonly autoFocusComposer?: boolean | undefined;
}

/**
 * Always-on, chrome-less chat surface (GeoPangan-style): a floating composer
 * pill that is always visible, recommendations that appear when the input is
 * focused, and messages that stack above as the user chats. No enclosing box;
 * each piece carries its own glass styling. The scroll area hides its scrollbar.
 */
export function AiChatPanel({
  pageId,
  selection,
  recommended,
  autoFocusComposer,
}: AiChatPanelProps) {
  const chat = useAiChat(selection);
  const sectionRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isEmpty = chat.messages.length === 0;
  const isBusy = chat.status === "streaming" || chat.status === "submitted";
  const isError = chat.status === "error";
  const showRecommendations = isEmpty && inputFocused && !isError;

  // Hide the messages/recommendations when the user clicks outside the chat
  // (e.g. the map or page); the always-on composer stays. Re-opens on focus/send.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const node = sectionRef.current;
      if (node && !node.contains(event.target as Node)) setDismissed(true);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      setDismissed(false);
      chat.send(text);
    },
    [chat],
  );

  const handleFocusChange = useCallback((focused: boolean) => {
    setInputFocused(focused);
    if (focused) setDismissed(false);
  }, []);

  const handleReset = useCallback(() => {
    setExpanded(false);
    chat.reset();
  }, [chat]);

  let area: ReactNode = null;
  if (!dismissed && isError) {
    area = (
      <div className="scrollbar-hide max-h-[70vh] overflow-y-auto">
        <ChatError chat={chat} />
      </div>
    );
  } else if (!dismissed && !isEmpty) {
    area = (
      <div className="scrollbar-hide max-h-[70vh] min-h-0 overflow-y-auto">
        <AiMessageList
          messages={chat.messages}
          expanded={expanded}
          onToggleExpanded={() => setExpanded((value) => !value)}
          isBusy={isBusy}
        />
      </div>
    );
  } else if (!dismissed && showRecommendations) {
    // preventDefault keeps the textarea focused while a suggestion is clicked,
    // so its blur does not hide the card before the click lands.
    area = (
      <div onMouseDown={(event) => event.preventDefault()}>
        <AiRecommendedChips
          pageId={pageId}
          input={recommended}
          onPick={handleSend}
        />
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label={AI_COPY.title}
      className="flex w-full flex-col gap-2"
    >
      {area}
      <AiComposer
        status={chat.status}
        onSend={handleSend}
        onStop={chat.stop}
        onReset={handleReset}
        showReset={!isEmpty}
        onFocusChange={handleFocusChange}
        autoFocus={autoFocusComposer}
      />
      <p className="px-2 text-center text-xs text-muted-foreground">
        {AI_COPY.disclaimer}
      </p>
    </section>
  );
}

function ChatError({ chat }: { readonly chat: ReturnType<typeof useAiChat> }) {
  const structured = chat.structuredError;
  if (structured && structured.error.kind === "rate_limit") {
    return (
      <AiRateLimitNotice
        requiresLogin={structured.requiresLogin}
        {...(structured.error.retryAfterSeconds !== undefined
          ? { retryAfterSeconds: structured.error.retryAfterSeconds }
          : {})}
      />
    );
  }
  const ui = structured
    ? mapAppErrorToUi(structured.error)
    : { title: AI_COPY.errorTitle, description: AI_COPY.errorDescription };
  return (
    <ErrorState
      title={ui.title}
      description={ui.description}
      action={
        <Button variant="secondary" size="sm" onClick={chat.reset}>
          {AI_COPY.retryLabel}
        </Button>
      }
    />
  );
}
