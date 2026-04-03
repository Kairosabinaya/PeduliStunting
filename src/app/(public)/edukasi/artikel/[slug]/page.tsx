/** Halaman Detail Artikel — render artikel berdasarkan slug. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .single<{ title: string; excerpt: string | null }>();

  if (!article) return { title: "Artikel Tidak Ditemukan" };

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

export default async function ArtikelDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) notFound();

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const wordCount = article.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          href="/edukasi/artikel"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-6"
        >
          &larr; Kembali ke Artikel
        </Link>

        {/* Cover image */}
        {article.cover_image_url && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-foreground/50">
          {article.category && (
            <span className="bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full font-medium">
              {article.category}
            </span>
          )}
          {formattedDate && <span>{formattedDate}</span>}
          <span>{readingTime} menit baca</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 leading-tight">
          {article.title}
        </h1>

        {/* Content */}
        <div
          className="article-content text-foreground/80"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Back link at bottom */}
        <div className="mt-12 pt-6 border-t border-primary-100">
          <Link
            href="/edukasi/artikel"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            &larr; Kembali ke semua artikel
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
