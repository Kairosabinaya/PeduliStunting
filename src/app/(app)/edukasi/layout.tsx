import type { ReactNode } from "react";

import { LenisProvider } from "@/components/features/edukasi/primitives/lenis-provider";

/**
 * Route-scoped layout for /edukasi. Wraps children in the Lenis
 * smooth-scroll provider so pinned ACT sections (ACT 2, 4, 5 in Phase 2)
 * have a smooth scroll feel without the heavy library polluting other
 * routes. Lenis itself is gated by `prefers-reduced-motion` and disabled
 * on touch devices — see `LenisProvider`.
 */
export default function EdukasiLayout({ children }: { children: ReactNode }) {
  return <LenisProvider>{children}</LenisProvider>;
}
