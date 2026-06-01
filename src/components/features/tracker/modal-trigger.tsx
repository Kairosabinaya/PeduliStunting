"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";

export interface ModalTriggerProps {
  readonly modalKey: string;
  readonly children: (props: { onClick: () => void }) => ReactNode;
}

/**
 * Client component that wraps a trigger element and opens a modal by setting
 * the `?modal=` search param. Used to convert navigation links into modal
 * triggers without full page navigation.
 *
 * @example
 * ```tsx
 * <ModalTrigger modalKey="edit">
 *   {({ onClick }) => <button onClick={onClick}>Edit</button>}
 * </ModalTrigger>
 * ```
 */
export function ModalTrigger({ modalKey, children }: ModalTriggerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", modalKey);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams, modalKey]);

  return <>{children({ onClick: handleClick })}</>;
}
