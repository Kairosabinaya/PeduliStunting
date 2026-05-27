import { Skeleton } from "@/components/primitives/skeleton";

export default function ChildLayoutLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-border bg-surface p-5 md:p-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-2/3" />
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
