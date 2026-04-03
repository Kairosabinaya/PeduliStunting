/** Halaman Edukasi — hub untuk konten edukasi stunting. */
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArticleCard, RandomFact } from "@/components/education";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edukasi Stunting",
  description:
    "Pelajari tentang stunting melalui artikel, kuis interaktif, dan fakta menarik.",
};

const FEATURES = [
  {
    href: "/edukasi/artikel",
    title: "Artikel",
    description: "Baca artikel tentang stunting, gizi, dan kebijakan kesehatan.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/edukasi/aktivitas",
    title: "Aktivitas Interaktif",
    description: "Uji pemahamanmu dengan kuis Mitos vs Fakta tentang stunting.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
] as const;

export default async function EdukasiPage() {
  const supabase = await createClient();

  const { data: latestArticles } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, cover_image_url, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Edukasi Stunting
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">
            Pelajari tentang stunting melalui artikel, kuis interaktif, dan fakta
            menarik berbasis data.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-xl border border-primary-100 bg-white p-6 hover:shadow-md hover:border-primary-300 transition-all"
            >
              <div className="text-primary-600 mb-4">{f.icon}</div>
              <h2 className="text-lg font-semibold text-foreground group-hover:text-primary-600 transition-colors mb-2">
                {f.title}
              </h2>
              <p className="text-sm text-foreground/60">{f.description}</p>
            </Link>
          ))}
        </div>

        {/* Latest articles */}
        {latestArticles && latestArticles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Artikel Terbaru</h2>
              <Link
                href="/edukasi/artikel"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Lihat semua &rarr;
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  slug={article.slug}
                  title={article.title}
                  excerpt={article.excerpt}
                  coverImageUrl={article.cover_image_url}
                  category={article.category}
                  publishedAt={article.published_at}
                />
              ))}
            </div>
          </div>
        )}

        {/* Random fact */}
        <RandomFact />
      </main>
      <Footer />
    </>
  );
}
