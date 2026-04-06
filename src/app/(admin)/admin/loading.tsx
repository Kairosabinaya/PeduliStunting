/** Loading skeleton for admin pages. */
export default function AdminLoading() {
  return (
    <div>
      <div className="h-8 w-48 bg-primary-100 rounded animate-pulse mb-6" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-primary-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
