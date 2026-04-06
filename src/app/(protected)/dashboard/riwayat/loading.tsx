/** Loading skeleton for riwayat page. */
export default function RiwayatLoading() {
  return (
    <div>
      <div className="h-8 w-32 bg-primary-100 rounded animate-pulse mb-6" />
      <div className="h-6 w-48 bg-primary-100 rounded animate-pulse mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-primary-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
