"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { TRACKER_ROUTE } from "@/config/tracker";

import { MeasurementForm } from "./measurement-form";

export interface ModalMeasurementFormProps {
  readonly childId: string;
  readonly childBirthDate: string;
}

/**
 * {@link MeasurementForm} wired for the modal context: once a measurement saves
 * it closes the modal (drops the `?modal=` param) and refreshes so the growth
 * chart and history behind it reflect the new row immediately.
 */
export function ModalMeasurementForm({
  childId,
  childBirthDate,
}: ModalMeasurementFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSaved = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    const query = params.toString();
    router.push(query ? `?${query}` : TRACKER_ROUTE, { scroll: false });
    router.refresh();
  }, [router, searchParams]);

  return (
    <MeasurementForm
      childId={childId}
      childBirthDate={childBirthDate}
      onSaved={handleSaved}
    />
  );
}
