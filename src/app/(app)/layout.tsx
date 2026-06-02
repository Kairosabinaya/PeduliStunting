import type { ReactNode } from "react";

import { FloatingHeader } from "@/components/navigation/floating-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { fetchCurrentProfile } from "@/lib/account-cache";
import { requireServerSession } from "@/lib/server-session";

interface AppLayoutProps {
  readonly children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await requireServerSession();
  const profileResult = await fetchCurrentProfile(session.userId);
  const displayName =
    profileResult.ok && profileResult.value
      ? profileResult.value.displayName
      : session.email;
  const avatarUrl =
    profileResult.ok && profileResult.value
      ? profileResult.value.avatarUrl
      : null;
  const isAdmin =
    profileResult.ok && profileResult.value
      ? profileResult.value.role === "admin"
      : false;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-brand-50/60 via-background to-background dark:from-brand-900/25">
      <FloatingHeader
        session={{
          displayName: displayName ?? null,
          email: session.email ?? null,
          avatarUrl: avatarUrl ?? null,
          isAdmin,
        }}
      />
      <div className="pb-12 pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          {children}
          <SiteFooter className="mt-12" />
        </div>
      </div>
    </div>
  );
}
