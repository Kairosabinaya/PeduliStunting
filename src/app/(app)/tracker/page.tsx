import type { Metadata } from "next";
import Link from "next/link";

import { ChildCard } from "@/components/features/tracker/child-card";
import { buttonVariants } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { PageHeader } from "@/components/primitives/page-header";
import {
  TRACKER_LIST_COPY,
  TRACKER_NEW_CHILD_ROUTE,
} from "@/config/tracker";
import { fetchChildrenByOwner } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";

export const metadata: Metadata = {
  title: TRACKER_LIST_COPY.metaTitle,
};

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const session = await requireServerSession();
  const result = await fetchChildrenByOwner(session.userId);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={TRACKER_LIST_COPY.eyebrow}
        title={TRACKER_LIST_COPY.title}
        description={TRACKER_LIST_COPY.description}
        actions={
          <Link
            href={TRACKER_NEW_CHILD_ROUTE}
            className={buttonVariants({ variant: "primary" })}
          >
            {TRACKER_LIST_COPY.addCta}
          </Link>
        }
      />

      {!result.ok ? (
        <ErrorState
          title={TRACKER_LIST_COPY.errorTitle}
          description={
            result.error.message || TRACKER_LIST_COPY.errorDescriptionFallback
          }
        />
      ) : result.value.length === 0 ? (
        <EmptyState
          title={TRACKER_LIST_COPY.emptyTitle}
          description={TRACKER_LIST_COPY.emptyDescription}
          action={
            <Link
              href={TRACKER_NEW_CHILD_ROUTE}
              className={buttonVariants({ variant: "primary" })}
            >
              {TRACKER_LIST_COPY.addCta}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.value.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  );
}
