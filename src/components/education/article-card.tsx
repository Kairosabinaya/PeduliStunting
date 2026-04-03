/** ArticleCard — card component for displaying an article summary. */
import Link from "next/link";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string | null;
  publishedAt: string | null;
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  coverImageUrl,
  category,
  publishedAt,
}: ArticleCardProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/edukasi/artikel/${slug}`}
      className="group block rounded-xl border border-primary-100 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Cover image or gradient placeholder */}
      <div className="aspect-video relative overflow-hidden">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400" />
        )}
        {category && (
          <span className="absolute top-3 left-3 bg-white/90 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
            {category}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {title}
        </h3>
        {excerpt && (
          <p className="text-sm text-foreground/60 line-clamp-3 mb-3">{excerpt}</p>
        )}
        {formattedDate && (
          <p className="text-xs text-foreground/40">{formattedDate}</p>
        )}
      </div>
    </Link>
  );
}
