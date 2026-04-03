/** Halaman Listing Artikel — menampilkan grid artikel yang sudah dipublish. */
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArticleCard } from "@/components/education";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Artikel Edukasi Stunting",
  description:
    "Kumpulan artikel edukasi tentang stunting, gizi anak, dan kebijakan kesehatan di Indonesia.",
};

export default async function ArtikelListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("id, title, slug, excerpt, cover_image_url, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data: articles } = await query;

  // Get unique categories for filter
  const { data: allArticles } = await supabase
    .from("articles")
    .select("category")
    .eq("status", "published")
    .not("category", "is", null);

  const categories = [
    ...new Set((allArticles ?? []).map((a) => a.category).filter(Boolean)),
  ] as string[];

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6">Artikel Edukasi</h1>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <a
              href="/edukasi/artikel"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !category
                  ? "bg-primary-600 text-white"
                  : "bg-primary-50 text-primary-700 hover:bg-primary-100"
              }`}
            >
              Semua
            </a>
            {categories.map((cat) => (
              <a
                key={cat}
                href={`/edukasi/artikel?category=${encodeURIComponent(cat)}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-primary-600 text-white"
                    : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                }`}
              >
                {cat}
              </a>
            ))}
          </div>
        )}

        {/* Article grid */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
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
        ) : (
          <div className="text-center py-16 text-foreground/50">
            <p className="text-lg">Belum ada artikel.</p>
            <p className="text-sm mt-2">Artikel edukasi akan segera tersedia.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
