import type { ReactNode } from "react";

import { FloatingHeader } from "@/components/navigation/floating-header";
import { fetchCurrentProfile } from "@/lib/account-cache";
import { cn } from "@/lib/cn";
import { displayFont } from "@/lib/fonts";
import { tryServerSession } from "@/lib/server-session";

/**
 * Route group for public, content-shell surfaces (currently `/dashboard`).
 *
 * Unlike `(app)`, this layout does NOT call `requireServerSession()` — pages
 * underneath render for signed-in and signed-out visitors alike (the dashboard
 * is published research output, backed by anon-readable reference tables). The
 * header receives a nullable session: Masuk/Daftar CTAs for guests, the avatar
 * menu for members. Product palette throughout (no `theme-landing` scope — that
 * is reserved for the editorial landing).
 */
interface PublicLayoutProps {
  readonly children: ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const session = await tryServerSession();
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  let isAdmin = false;
  if (session) {
    const profileResult = await fetchCurrentProfile(session.userId);
    if (profileResult.ok && profileResult.value) {
      displayName = profileResult.value.displayName ?? session.email;
      avatarUrl = profileResult.value.avatarUrl ?? null;
      isAdmin = profileResult.value.role === "admin";
    } else {
      displayName = session.email;
    }
  }

  return (
    <div
      className={cn(
        // Soft brand wash at the top fading into the page so the dashboard
        // never reads as a flat white sheet. `--font-display` (Bricolage) is
        // exposed here so editorial headings can opt in via `font-display`.
        "min-h-dvh bg-gradient-to-b from-brand-50/60 via-background to-background dark:from-brand-900/25",
        displayFont.variable,
      )}
    >
      <FloatingHeader
        session={
          session === null
            ? null
            : {
                displayName,
                email: session.email,
                avatarUrl,
                isAdmin,
              }
        }
      />
      <div className="pb-16 pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">{children}</div>
      </div>
    </div>
  );
}
