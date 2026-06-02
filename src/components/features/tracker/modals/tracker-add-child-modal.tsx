import { AddChildForm } from "@/components/features/tracker/add-child-form";
import { ADD_CHILD_COPY } from "@/config/tracker";

import { TrackerModal } from "./tracker-modal";

/**
 * "Tambah anak" as an in-place modal instead of a separate page. Renders the
 * shared {@link AddChildForm} in a {@link TrackerModal}; on success the
 * `createChild` action redirects to `/tracker?anak=<id>`, which drops the
 * `?modal=` param (closing the modal) and selects the new child.
 */
export function TrackerAddChildModal() {
  return (
    <TrackerModal
      title={ADD_CHILD_COPY.title}
      description={ADD_CHILD_COPY.description}
    >
      <AddChildForm />
    </TrackerModal>
  );
}
