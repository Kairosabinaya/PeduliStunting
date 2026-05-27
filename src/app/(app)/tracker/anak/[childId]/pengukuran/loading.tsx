import { Skeleton } from "@/components/primitives/skeleton";

export default function MeasurementsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-border bg-surface p-5 md:p-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="space-y-4 rounded-xl border border-border bg-surface p-5 md:p-6">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
