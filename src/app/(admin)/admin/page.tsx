/** Halaman Admin Dashboard — overview statistik platform. */
import { getAdminStats } from "./actions";

const STAT_CARDS = [
  { key: "totalUsers", label: "Total Users", icon: "👤" },
  { key: "activeSubscriptions", label: "Subscription Aktif", icon: "⭐" },
  { key: "totalSimulations", label: "Total Simulasi", icon: "📊" },
  { key: "publishedArticles", label: "Artikel Published", icon: "📝" },
] as const;

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="rounded-xl border border-primary-200 bg-white p-5">
            <p className="text-sm text-foreground/50 mb-1">{card.label}</p>
            <p className="text-3xl font-bold text-foreground">
              {stats[card.key].toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
