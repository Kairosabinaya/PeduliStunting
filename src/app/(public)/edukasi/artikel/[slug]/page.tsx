/** Halaman Detail Artikel — placeholder untuk Phase 3. */
export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">Artikel: {slug} — Segera Hadir</h1>
    </div>
  );
}
