import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { FloatingHeader } from "@/components/navigation/floating-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/config/routes";
import { fetchCurrentProfile } from "@/lib/account-cache";
import { requireServerSession } from "@/lib/server-session";

interface AdminLayoutProps {
  readonly children: ReactNode;
}

/**
 * Guards every `/admin/*` route. Non-admin visitors get bounced to the
 * default landing page so the admin surface stays out of reach even if
 * someone guesses the URL. Profile lookup is deduped per request via
 * `fetchCurrentProfile` so this layout shares its read with the header.
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireServerSession();
  const profileResult = await fetchCurrentProfile(session.userId);
  const profile = profileResult.ok ? profileResult.value : null;

  if (!profile || profile.role !== "admin") {
    redirect(DEFAULT_AUTHENTICATED_ROUTE);
  }

  return (
    <div className="min-h-dvh bg-background">
      <FloatingHeader
        session={{
          displayName: profile.displayName ?? null,
          email: session.email ?? null,
          avatarUrl: profile.avatarUrl ?? null,
          isAdmin: true,
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
