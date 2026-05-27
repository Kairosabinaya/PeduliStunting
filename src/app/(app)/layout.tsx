import type { ReactNode } from "react";

import { FloatingHeader } from "@/components/navigation/floating-header";
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

  return (
    <div className="min-h-dvh bg-background">
      <FloatingHeader displayName={displayName ?? undefined} />
      <div className="pt-24 pb-12 md:pt-28">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">{children}</div>
      </div>
    </div>
  );
}
