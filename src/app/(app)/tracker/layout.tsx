import type { ReactNode } from "react";

interface TrackerLayoutProps {
  readonly children: ReactNode;
}

/**
 * Tracker-scoped layout. Auth + chrome (FloatingHeader) are handled by the
 * parent `(app)` layout; this layer stays intentionally thin so the tracker
 * dashboard does not compete with floating tools.
 */
export default function TrackerLayout({ children }: TrackerLayoutProps) {
  return children;
}
