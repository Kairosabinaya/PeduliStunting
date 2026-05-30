import { Skeleton } from "@/components/primitives/skeleton";
import { DASHBOARD_ERROR } from "@/config/dashboard";

/**
 * Route-segment skeleton matching the dashboard's header + three sections so
 * navigation has a shaped placeholder rather than a blank frame (project guidelines §11).
 */
export default function DashboardLoading() {
  return (
    <div
      className="space-y-16"
      aria-busy
      aria-label={DASHBOARD_ERROR.loadingLabel}
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      {[0, 1, 2].map((section) => (
        <div key={section} className="space-y-4">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
