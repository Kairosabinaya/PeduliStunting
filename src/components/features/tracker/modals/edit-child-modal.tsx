import { ErrorState } from "@/components/primitives/error-state";
import { EditChildForm } from "@/components/features/tracker/edit-child-form";
import { EDIT_CHILD_COPY, TRACKER_LIST_COPY } from "@/config/tracker";
import { asChildId } from "@/domain/shared/ids";
import { fetchChildById } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { RoutedModal } from "./routed-modal";

export interface EditChildModalProps {
  readonly childId: string;
}

export async function EditChildModal({ childId }: EditChildModalProps) {
  const session = await requireServerSession();
  const result = await fetchChildById(session.userId, asChildId(childId));

  if (!result.ok) {
    return (
      <RoutedModal childId={childId} title={EDIT_CHILD_COPY.title}>
        <ErrorState
          title={TRACKER_LIST_COPY.errorTitle}
          description={
            result.error.message || TRACKER_LIST_COPY.errorDescriptionFallback
          }
        />
      </RoutedModal>
    );
  }

  return (
    <RoutedModal
      childId={childId}
      title={EDIT_CHILD_COPY.title}
      description={EDIT_CHILD_COPY.description}
    >
      <EditChildForm child={result.value} />
    </RoutedModal>
  );
}
