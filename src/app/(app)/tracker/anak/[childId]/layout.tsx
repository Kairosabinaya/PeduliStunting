import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { ChildDetailHeader } from "@/components/features/tracker/child-detail-header";
import { ChildNav } from "@/components/features/tracker/child-nav";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { fetchChildById } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";

interface ChildLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ readonly childId: string }>;
}

export const dynamic = "force-dynamic";

export default async function ChildLayout({
  children,
  params,
}: ChildLayoutProps) {
  const { childId } = await params;
  if (!isUuid(childId)) {
    notFound();
  }

  const session = await requireServerSession();
  const result = await fetchChildById(session.userId, asChildId(childId));
  if (!result.ok) {
    if (result.error.kind === "not_found") {
      notFound();
    }
    throw new Error(result.error.message);
  }

  return (
    <div className="space-y-6">
      <ChildDetailHeader child={result.value} />
      <ChildNav childId={result.value.id} />
      {children}
    </div>
  );
}
