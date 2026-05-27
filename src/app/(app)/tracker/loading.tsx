import { Skeleton } from "@/components/primitives/skeleton";

export default function TrackerListLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="space-y-3 rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
