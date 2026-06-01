import { Skeleton } from "@/components/primitives/skeleton";

export default function TrackerListLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        <Skeleton className="h-72 w-full rounded-xl lg:col-span-3" />
        <Skeleton className="h-72 w-full rounded-xl lg:col-span-1" />
      </div>
    </div>
  );
}
