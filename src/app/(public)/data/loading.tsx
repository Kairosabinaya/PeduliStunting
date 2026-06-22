import { Skeleton } from "@/components/primitives/skeleton";
import { DASHBOARD_ERROR } from "@/config/dashboard";

/**
 * Route-segment skeleton matching the `/data` header + KPI row + chart rows so
 * navigation has a shaped placeholder rather than a blank frame.
 */
export default function DataLoading() {
  return (
    <div
      className="space-y-10"
      aria-busy
      aria-label={DASHBOARD_ERROR.loadingLabel}
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((tile) => (
          <Skeleton key={tile} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      {[0, 1].map((row) => (
        <div key={row} className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
