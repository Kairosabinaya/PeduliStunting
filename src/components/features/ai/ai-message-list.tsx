"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { AI_COPY } from "@/config/ai-copy";
import { cn } from "@/lib/cn";

import { AiCardRenderer } from "./cards/ai-card-renderer";
import { AiMessageMarkdown } from "./ai-message-markdown";
import { computeVisibleMessages } from "./message-window";
import type { UseAiChatResult } from "./use-ai-chat";

type ChatMessage = UseAiChatResult["messages"][number];

/**
 * Collapsed conversation view (GeoPangan-style): only the latest user + latest
 * assistant bubble are shown; older turns fold into a clickable
 * "x pesan sebelumnya" pill. No assistant avatar.
 */
export function AiMessageList({
  messages,
  expanded,
  onToggleExpanded,
  isBusy,
}: {
  readonly messages: UseAiChatResult["messages"];
  readonly expanded: boolean;
  readonly onToggleExpanded: () => void;
  readonly isBusy: boolean;
}) {
  const { visible, hidden } = computeVisibleMessages(messages, expanded);
  const canCollapse = messages.length > 2;
  const last = messages[messages.length - 1];
  const lastAssistantHasText =
    last?.role === "assistant" &&
    last.parts.some(
      (part) => part.type === "text" && "text" in part && part.text.length > 0,
    );
  const showTyping = isBusy && !lastAssistantHasText;

  return (
    <div className="space-y-3">
      {canCollapse ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onToggleExpanded}
            className="glass-panel inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            {expanded ? (
              <>
                <ChevronDown className="size-3.5" />
                {AI_COPY.collapseLabel}
              </>
            ) : (
              <>
                <ChevronUp className="size-3.5" />
                {hidden} {AI_COPY.previousMessages}
              </>
            )}
          </button>
        </div>
      ) : null}

      {visible.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {showTyping ? <TypingBubble /> : null}
    </div>
  );
}

function MessageBubble({ message }: { readonly message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] space-y-2 rounded-2xl px-3.5 py-2.5",
          isUser
            ? "bg-primary/85 text-primary-foreground shadow-lg backdrop-blur-xl"
            : "glass-panel text-foreground",
        )}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return isUser ? (
              <p key={index} className="whitespace-pre-wrap text-sm">
                {part.text}
              </p>
            ) : (
              <AiMessageMarkdown key={index} text={part.text} />
            );
          }
          if (
            "state" in part &&
            part.state === "output-available" &&
            "output" in part
          ) {
            return <AiCardRenderer key={index} output={part.output} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="glass-panel rounded-2xl px-4 py-3">
        <span
          className="flex animate-pulse gap-1"
          aria-label={AI_COPY.thinking}
        >
          <span className="size-1.5 rounded-full bg-muted-foreground/70" />
          <span className="size-1.5 rounded-full bg-muted-foreground/70" />
          <span className="size-1.5 rounded-full bg-muted-foreground/70" />
        </span>
      </div>
    </div>
  );
}
