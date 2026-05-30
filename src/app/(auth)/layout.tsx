import type { ReactNode } from "react";

import { AuthShell } from "@/components/features/auth/auth-shell";

/**
 * Marketing auth surfaces — sign-in, sign-up, reset-password. They share the
 * split-screen {@link AuthShell} with the functional `(auth-fn)` group so every
 * auth page looks identical: a blue-to-green brand panel on desktop and a
 * focused, card-less form column on every breakpoint.
 *
 * No MapLibre, no nav pill — the shell owns the entire chrome.
 */
interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthShell>{children}</AuthShell>;
}
