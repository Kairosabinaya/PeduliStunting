import { Skeleton } from "@/components/primitives/skeleton";

export default function TrackerListLoading() {
  return (
    <div className="space-y-8">
      {/* PageHeader */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* PregnancyBanner */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* ChildSwitcher */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>

      {/* StatusHero */}
      <Skeleton className="h-24 w-full rounded-xl" />

      {/* ModuleGrid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-32 w-full rounded-xl" />
        ))}
      </div>

      <div className="grid gap-6">
        {/* ChildSummary */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full rounded-lg" />
          ))}
        </div>

        {/* GrowthChartCard */}
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
