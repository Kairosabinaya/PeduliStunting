import { Skeleton } from "@/components/primitives/skeleton";

export default function AddChildLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="max-w-3xl space-y-4 rounded-xl border border-border bg-surface p-6">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-end gap-2">
          <Skeleton className="h-11 w-24" />
          <Skeleton className="h-11 w-44" />
        </div>
      </div>
    </div>
  );
}
