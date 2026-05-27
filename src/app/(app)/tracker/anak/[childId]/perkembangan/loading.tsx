import { Skeleton } from "@/components/primitives/skeleton";

export default function MilestonesLoading() {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-5 md:p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-72" />
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
