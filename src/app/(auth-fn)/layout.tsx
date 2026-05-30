import type { ReactNode } from "react";

import { AuthShell } from "@/components/features/auth/auth-shell";

/**
 * Functional auth surfaces — check-email and update-password. They reuse the
 * exact same split-screen {@link AuthShell} as the marketing `(auth)` group so
 * the whole auth flow stays visually consistent. Neither route loads MapLibre.
 *
 * `update-password` is reached via the recovery-link callback (the user is
 * technically authenticated by a recovery token) but still gets the pre-sign-in
 * shell because they have not completed a real sign-in yet.
 */
interface AuthFunctionalLayoutProps {
  readonly children: ReactNode;
}

export default function AuthFunctionalLayout({
  children,
}: AuthFunctionalLayoutProps) {
  return <AuthShell>{children}</AuthShell>;
}
