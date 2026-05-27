import { Skeleton } from "@/components/primitives/skeleton";

export default function ImmunizationsLoading() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5 md:p-6">
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-4 w-72" />
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}
