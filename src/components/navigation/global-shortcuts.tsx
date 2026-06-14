"use client";

// Global keyboard-shortcut layer for expert users (Shneiderman rule 2). Mounted
// once in the root layout. Listens for keydown on the document, supports a
// Gmail-style "g then key" navigation sequence plus standalone actions, and
// renders a help dialog (opened with "?") so the shortcuts are discoverable
// rather than memorised (also serves rule 8 — recognition over recall).

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useTheme } from "@/components/theme/theme-provider";
import { Modal } from "@/components/primitives/modal";
import {
  GO_TO_SHORTCUTS,
  SHORTCUTS_HELP_COPY,
  SHORTCUT_LEADER_KEY,
  SHORTCUT_SEQUENCE_TIMEOUT_MS,
  STANDALONE_SHORTCUTS,
} from "@/config/shortcuts";

/** True when focus sits in a control that consumes typing, so we stand down. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function GlobalShortcuts() {
  const router = useRouter();
  const { toggle } = useTheme();
  const [helpOpen, setHelpOpen] = useState(false);

  // Whether the leader key ("g") was pressed within the sequence window.
  const leaderActiveRef = useRef(false);
  const leaderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLeader = useCallback(() => {
    leaderActiveRef.current = false;
    if (leaderTimerRef.current !== null) {
      clearTimeout(leaderTimerRef.current);
      leaderTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      // Let the browser's own chords (Ctrl/Cmd/Alt) through untouched, and
      // never hijack typing in a field.
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (leaderActiveRef.current) {
        const match = GO_TO_SHORTCUTS.find((shortcut) => shortcut.key === key);
        clearLeader();
        if (match) {
          event.preventDefault();
          router.push(match.href);
        }
        return;
      }

      if (key === SHORTCUT_LEADER_KEY) {
        leaderActiveRef.current = true;
        leaderTimerRef.current = setTimeout(
          clearLeader,
          SHORTCUT_SEQUENCE_TIMEOUT_MS,
        );
        return;
      }

      // `?` is Shift+/, so match the produced character rather than a code.
      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen(true);
        return;
      }
      if (key === "t") {
        event.preventDefault();
        toggle();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearLeader();
    };
  }, [router, toggle, clearLeader]);

  return (
    <Modal
      open={helpOpen}
      onClose={() => setHelpOpen(false)}
      variant="centered"
      title={SHORTCUTS_HELP_COPY.title}
      description={SHORTCUTS_HELP_COPY.description}
    >
      <div className="space-y-5">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {SHORTCUTS_HELP_COPY.goToHeading}
          </h3>
          <ul className="space-y-2">
            {GO_TO_SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.key}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-foreground">{shortcut.label}</span>
                <kbd className="rounded-md border border-border bg-surface-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {SHORTCUTS_HELP_COPY.goToHint(shortcut.key)}
                </kbd>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {SHORTCUTS_HELP_COPY.actionsHeading}
          </h3>
          <ul className="space-y-2">
            {STANDALONE_SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.key}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-foreground">{shortcut.label}</span>
                <kbd className="rounded-md border border-border bg-surface-muted px-2 py-0.5 font-mono text-xs uppercase text-muted-foreground">
                  {shortcut.key}
                </kbd>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
}
