import { cn } from "@/lib/cn";

type Tone = "error" | "success" | "info";

interface AuthFeedbackProps {
  readonly tone: Tone;
  readonly children: React.ReactNode;
  readonly role?: "alert" | "status";
}

const TONE_CLASSES: Readonly<Record<Tone, string>> = {
  error: "border-danger/40 bg-danger/10 text-danger",
  success: "border-success/40 bg-success/10 text-success",
  info: "border-border bg-surface-muted text-foreground",
};

/**
 * Inline banner shared by every auth form. Use `tone="error"` with the
 * default `role="alert"` for server-side action failures and `tone="success"`
 * with `role="status"` for confirmations like the verification-email notice.
 */
export function AuthFeedback({
  tone,
  children,
  role,
}: AuthFeedbackProps) {
  const resolvedRole = role ?? (tone === "error" ? "alert" : "status");
  return (
    <p
      role={resolvedRole}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </p>
  );
}
