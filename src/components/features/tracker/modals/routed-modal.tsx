"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Modal, type ModalProps } from "@/components/primitives/modal";
import { trackerChildRoute } from "@/config/tracker";

export interface RoutedModalProps extends Omit<ModalProps, "open" | "onClose"> {
  readonly childId: string;
}

/**
 * A Modal wrapper that is always open when rendered (driven by searchParams)
 * and navigates back to the child overview page when closed.
 */
export function RoutedModal({ childId, children, ...props }: RoutedModalProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    // Navigate back to the base overview route without the modal param
    router.push(trackerChildRoute(childId), { scroll: false });
  }, [router, childId]);

  return (
    <Modal open={true} onClose={handleClose} {...props}>
      {children}
    </Modal>
  );
}
