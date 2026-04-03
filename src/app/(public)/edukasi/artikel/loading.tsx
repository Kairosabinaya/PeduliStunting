/** Loading skeleton for artikel listing page. */
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function ArtikelLoading() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-primary-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-primary-100 overflow-hidden">
              <div className="aspect-video bg-primary-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-primary-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-primary-100 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-primary-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-primary-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
