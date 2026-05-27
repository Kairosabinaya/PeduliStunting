import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type FeedbackTone = "error" | "success" | "info" | "warning";

export interface FeedbackBannerProps {
  readonly tone: FeedbackTone;
  readonly children: ReactNode;
  /** ARIA live role; defaults to `alert` for errors, `status` otherwise. */
  readonly role?: "alert" | "status";
  readonly className?: string;
}

const TONE_CLASSES: Readonly<Record<FeedbackTone, string>> = {
  error: "border-danger/40 bg-danger/10 text-danger",
  success: "border-success/40 bg-success/10 text-success",
  info: "border-border bg-surface-muted text-foreground",
  warning: "border-warning/40 bg-warning/10 text-warning",
};

/**
 * Inline status banner used by Server Action forms (sign-in, sign-up, account
 * settings). Always tone-aware: error banners receive `role="alert"` so
 * screen readers announce them immediately, others use `role="status"`.
 *
 * @example Error
 * ```tsx
 * <FeedbackBanner tone="error">Email atau kata sandi salah.</FeedbackBanner>
 * ```
 *
 * @example Success
 * ```tsx
 * <FeedbackBanner tone="success">Profil berhasil diperbarui.</FeedbackBanner>
 * ```
 */
export function FeedbackBanner({
  tone,
  children,
  role,
  className,
}: FeedbackBannerProps) {
  const resolvedRole = role ?? (tone === "error" ? "alert" : "status");
  return (
    <p
      role={resolvedRole}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}
