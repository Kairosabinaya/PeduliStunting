import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditChildForm } from "@/components/features/tracker/edit-child-form";
import { Card } from "@/components/primitives/card";
import { ErrorState } from "@/components/primitives/error-state";
import { PageHeader } from "@/components/primitives/page-header";
import { EDIT_CHILD_COPY, TRACKER_LIST_COPY } from "@/config/tracker";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { fetchChildById } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";

interface EditChildPageProps {
  readonly params: Promise<{ readonly childId: string }>;
}

export const metadata: Metadata = {
  title: EDIT_CHILD_COPY.metaTitle,
};

export const dynamic = "force-dynamic";

/**
 * Edit an existing child profile. Loads the child via the owner-scoped cache
 * fetch, 404s when it does not exist (or belongs to another account), and
 * otherwise renders the pre-filled {@link EditChildForm}.
 */
export default async function EditChildPage({ params }: EditChildPageProps) {
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
    return (
      <ErrorState
        title={TRACKER_LIST_COPY.errorTitle}
        description={
          result.error.message || TRACKER_LIST_COPY.errorDescriptionFallback
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={EDIT_CHILD_COPY.eyebrow}
        title={EDIT_CHILD_COPY.title}
        description={EDIT_CHILD_COPY.description}
      />
      <Card elevation="sm" padding="md" className="max-w-3xl">
        <EditChildForm child={result.value} />
      </Card>
    </div>
  );
}
