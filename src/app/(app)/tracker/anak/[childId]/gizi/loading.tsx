import { Skeleton } from "@/components/primitives/skeleton";

export default function NutritionLoading() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5 md:p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-72" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
