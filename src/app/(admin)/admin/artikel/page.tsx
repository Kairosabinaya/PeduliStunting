/** Admin Artikel CMS — list, create, edit, publish/draft, delete articles. */
"use client";

import { useState, useEffect, useCallback } from "react";
import { getArticles, createArticle, updateArticle, deleteArticle } from "../actions";
import { cn } from "@/lib/utils";

interface ArticleForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  status: "draft" | "published";
}

const EMPTY_FORM: ArticleForm = {
  title: "", slug: "", content: "", excerpt: "", category: "", status: "draft",
};

export default function AdminArtikelPage() {
  const [articles, setArticles] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    const data = await getArticles();
    setArticles(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(article: Record<string, unknown>) {
    setForm({
      title: article.title as string,
      slug: article.slug as string,
      content: article.content as string,
      excerpt: (article.excerpt as string) ?? "",
      category: (article.category as string) ?? "",
      status: article.status as "draft" | "published",
    });
    setEditingId(article.id as string);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    if (editingId) {
      await updateArticle(editingId, form);
    } else {
      // Auto-generate slug from title if empty
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      await createArticle({ ...form, slug });
    }
    setShowForm(false);
    setSaving(false);
    loadArticles();
  }

  async function handleDelete(id: string) {
    await deleteArticle(id);
    loadArticles();
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    await updateArticle(id, { status: newStatus });
    loadArticles();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manajemen Artikel</h1>
        <button
          onClick={openNew}
          type="button"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          + Artikel Baru
        </button>
      </div>

      {/* Article form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Artikel" : "Artikel Baru"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul</label>
                <input
                  type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generate dari judul jika kosong"
                  className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <input
                  type="text" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Pencegahan, Gizi, Fakta, dll"
                  className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt} rows={2}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Konten (HTML)</label>
                <textarea
                  value={form.content} rows={10}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                  className="rounded-lg border border-primary-200 px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave} disabled={saving || !form.title}
                type="button"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                type="button"
                className="rounded-lg border border-primary-200 px-4 py-2 text-sm font-medium hover:bg-primary-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-primary-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-primary-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-50 text-left">
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id as string} className="border-t border-primary-100">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{a.title as string}</td>
                  <td className="px-4 py-3 text-foreground/60">{(a.category as string) || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(a.id as string, a.status as string)}
                      type="button"
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        a.status === "published" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                      )}
                    >
                      {a.status as string}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-foreground/50">
                    {new Date(a.created_at as string).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(a)} type="button" className="text-primary-600 hover:text-primary-700 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(a.id as string)} type="button" className="text-accent-500 hover:text-accent-600 text-xs font-medium">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-foreground/40">Belum ada artikel.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
