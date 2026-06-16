"use client";

/**
 * App notification helper. Every toast in the app goes through here so they all
 * render the branded {@link ToastCard} (design-system surface + the standard
 * `<Button>` for actions) instead of Sonner's default look. Use this instead of
 * calling `toast.*` from `sonner` directly.
 *
 * @example
 * ```ts
 * notify.success("Tersimpan.");
 * notify.action({
 *   tone: "success",
 *   title: "Data dihapus.",
 *   actionLabel: "Pulihkan",
 *   onAction: restore,
 * });
 * ```
 */

import { toast } from "sonner";

import { ToastCard, type ToastTone } from "@/components/primitives/toast-card";
import { TOAST_DURATION_MS } from "@/config/toast";

interface ShowOptions {
  readonly tone?: ToastTone;
  readonly title: string;
  readonly description?: string;
  readonly action?: { readonly label: string; readonly onClick: () => void };
  readonly duration?: number;
}

function show({
  tone,
  title,
  description,
  action,
  duration,
}: ShowOptions): void {
  toast.custom(
    (id) => (
      <ToastCard
        {...(tone !== undefined ? { tone } : {})}
        title={title}
        {...(description !== undefined ? { description } : {})}
        {...(action
          ? {
              action: {
                label: action.label,
                // Acting also closes the toast so the affordance disappears
                // once its job is done.
                onClick: () => {
                  action.onClick();
                  toast.dismiss(id);
                },
              },
            }
          : {})}
        onDismiss={() => toast.dismiss(id)}
      />
    ),
    { duration: duration ?? TOAST_DURATION_MS },
  );
}

export interface NotifyActionOptions {
  readonly tone?: ToastTone;
  readonly title: string;
  readonly description?: string;
  readonly actionLabel: string;
  readonly onAction: () => void;
  /** Longer than the default is sensible for undo (user needs time to react). */
  readonly duration?: number;
}

export const notify = {
  success: (title: string, description?: string): void =>
    show({ tone: "success", title, ...(description ? { description } : {}) }),
  error: (title: string, description?: string): void =>
    show({ tone: "error", title, ...(description ? { description } : {}) }),
  info: (title: string, description?: string): void =>
    show({ tone: "info", title, ...(description ? { description } : {}) }),
  /** A toast carrying a single primary action (e.g. an undo snackbar). */
  action: (options: NotifyActionOptions): void =>
    show({
      tone: options.tone ?? "info",
      title: options.title,
      ...(options.description ? { description: options.description } : {}),
      action: { label: options.actionLabel, onClick: options.onAction },
      ...(options.duration !== undefined ? { duration: options.duration } : {}),
    }),
} as const;
