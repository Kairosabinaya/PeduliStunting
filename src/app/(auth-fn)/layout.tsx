import type { ReactNode } from "react";

import { FloatingHeader } from "@/components/navigation/floating-header";

/**
 * Layout for functional auth pages — currently `check-email` and
 * `update-password`. These two surfaces are NOT marketing moments:
 *
 *   - `check-email` lands after sign-up. The user just submitted a form and
 *     needs a clear next step ("buka email kamu"), not another sales pitch.
 *   - `update-password` lands after the user clicks a recovery link in their
 *     email. They are mid-task, often anxious; the map backdrop's saturated
 *     choropleth would compete for attention with the security-critical
 *     password field.
 *
 * Both routes opt out of `LandingMapBackground` entirely. A solid surface
 * + plain card keeps focus on the action, and the MapLibre bundle does not
 * load on these routes at all. Header is passed `session={null}` so the
 * brand + Masuk/Daftar pill shows uniformly — even update-password, where
 * the user is technically authenticated via a recovery token, gets the
 * pre-sign-in shell because they have not actually completed sign-in yet.
 */
interface AuthFunctionalLayoutProps {
  readonly children: ReactNode;
}

export default function AuthFunctionalLayout({
  children,
}: AuthFunctionalLayoutProps) {
  return (
    <div className="min-h-dvh bg-background">
      <FloatingHeader session={null} />
      <main className="pt-safe-4 grid min-h-dvh place-items-center px-4 pb-12">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-md md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
