import type { ReactNode } from "react";

import { FloatingHeader } from "@/components/navigation/floating-header";
import { fetchCurrentProfile } from "@/lib/account-cache";
import { tryServerSession } from "@/lib/server-session";

/**
 * Route group that hosts auth-conditional public surfaces. Unlike `(app)`,
 * this layout does NOT call `requireServerSession()` — pages underneath are
 * expected to handle both signed-in and signed-out visitors. `/map` is the
 * only entry here today: it renders the interactive choropleth for
 * authenticated users and a landing-before-login experience for everyone
 * else.
 *
 * The header is rendered here with a NULLABLE session. For unauthenticated
 * visitors it shows Masuk/Daftar CTAs; for authenticated visitors the
 * existing avatar dropdown. On authenticated `/map`, FloatingHeader detects
 * the path and bows out so MapHeader (mounted inside MapShell) is the only
 * pill at the top of the viewport.
 */
interface PublicMapLayoutProps {
  readonly children: ReactNode;
}

export default async function PublicMapLayout({
  children,
}: PublicMapLayoutProps) {
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
    <div className="min-h-dvh bg-background">
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
      {children}
    </div>
  );
}
