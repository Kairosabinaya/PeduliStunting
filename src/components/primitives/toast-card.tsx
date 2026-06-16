"use client";

import { AlertCircle, AlertTriangle, Check, Info, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Button } from "./button";

export type ToastTone = "success" | "error" | "info" | "warning";

interface ToneSpec {
  readonly icon: typeof Check;
  readonly accent: string;
}

const TONES: Readonly<Record<ToastTone, ToneSpec>> = {
  success: { icon: Check, accent: "text-success" },
  error: { icon: AlertCircle, accent: "text-danger" },
  info: { icon: Info, accent: "text-primary" },
  warning: { icon: AlertTriangle, accent: "text-warning" },
};

export interface ToastCardAction {
  readonly label: string;
  /** Optional leading icon for the action button. */
  readonly icon?: ReactNode;
  readonly onClick: () => void;
}

export interface ToastCardProps {
  readonly tone?: ToastTone;
  readonly title: string;
  readonly description?: string;
  /** Primary action (e.g. "Pulihkan") rendered as the design-system Button. */
  readonly action?: ToastCardAction;
  readonly onDismiss?: () => void;
}

/**
 * Branded notification surface used for every toast (success/error/info and the
 * undo snackbar). Built from the same design tokens as the rest of the app —
 * `bg-surface`/`border-border`/`shadow-lg`, the standard `<Button>` for the
 * action, and tone-coloured icons — so notifications no longer look like the
 * default Sonner styling. Rendered inside `toast.custom` by `notify`
 * ({@link file://../../lib/notify.tsx}).
 *
 * @example
 * ```tsx
 * <ToastCard
 *   tone="success"
 *   title="Data Aira dihapus."
 *   description="Ketuk Pulihkan untuk membatalkan penghapusan."
 *   action={{ label: "Pulihkan", onClick: restore }}
 *   onDismiss={dismiss}
 * />
 * ```
 */
export function ToastCard({
  tone = "info",
  title,
  description,
  action,
  onDismiss,
}: ToastCardProps) {
  const { icon: Icon, accent } = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="flex w-[min(22rem,90vw)] items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-lg"
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", accent)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {action ? (
          <div className="mt-2.5">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </Button>
          </div>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup notifikasi"
          className="-mr-1 -mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
