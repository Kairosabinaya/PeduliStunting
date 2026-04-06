/** Admin Facts — CRUD fakta stunting dengan tag provinsi. */
"use client";

import { useState, useEffect, useCallback } from "react";
import { getFacts, createFact, updateFact, deleteFact } from "../actions";
import { useProvinces } from "@/hooks/use-provinces";
import { cn } from "@/lib/utils";

export default function AdminFactsPage() {
  const [facts, setFacts] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [provinceId, setProvinceId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const { provinces } = useProvinces();

  const loadFacts = useCallback(async () => {
    setIsLoading(true);
    const data = await getFacts();
    setFacts(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadFacts(); }, [loadFacts]);

  function openNew() {
    setContent(""); setSource(""); setCategory(""); setProvinceId("");
    setEditingId(null); setShowForm(true);
  }

  function openEdit(fact: Record<string, unknown>) {
    setContent(fact.content as string);
    setSource((fact.source as string) ?? "");
    setCategory((fact.category as string) ?? "");
    setProvinceId(fact.province_id ? String(fact.province_id) : "");
    setEditingId(fact.id as string); setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      content,
      source: source || undefined,
      category: category || undefined,
      province_id: provinceId ? Number(provinceId) : null,
    };
    if (editingId) {
      await updateFact(editingId, data);
    } else {
      await createFact(data);
    }
    setShowForm(false); setSaving(false); loadFacts();
  }

  async function handleToggleActive(id: string, current: boolean) {
    await updateFact(id, { is_active: !current });
    loadFacts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manajemen Fakta Stunting</h1>
        <button onClick={openNew} type="button" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          + Fakta Baru
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Fakta" : "Fakta Baru"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Konten Fakta</label>
                <textarea value={content} rows={3} onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sumber</label>
                <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="BPS, Kemenkes, WHO"
                  className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Provinsi (opsional)</label>
                <select value={provinceId} onChange={(e) => setProvinceId(e.target.value)}
                  className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
                  <option value="">Nasional (semua)</option>
                  {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving || !content} type="button" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button onClick={() => setShowForm(false)} type="button" className="rounded-lg border border-primary-200 px-4 py-2 text-sm font-medium hover:bg-primary-50 transition-colors">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Facts list */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-primary-100 animate-pulse rounded-lg" />)}</div>
      ) : (
        <div className="space-y-3">
          {facts.map((f) => (
            <div key={f.id as string} className={cn("rounded-lg border p-4", f.is_active ? "border-primary-200 bg-white" : "border-gray-200 bg-gray-50 opacity-60")}>
              <p className="text-sm mb-2">{f.content as string}</p>
              <div className="flex items-center justify-between text-xs text-foreground/40">
                <div className="flex gap-3">
                  {f.source ? <span>Sumber: {String(f.source)}</span> : null}
                  {f.category ? <span>Kategori: {String(f.category)}</span> : null}
                  {f.province_id ? <span>Provinsi ID: {String(f.province_id)}</span> : null}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleActive(f.id as string, f.is_active as boolean)} type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                    {f.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button onClick={() => openEdit(f)} type="button" className="text-primary-600 hover:text-primary-700 font-medium">Edit</button>
                  <button onClick={() => deleteFact(f.id as string).then(loadFacts)} type="button" className="text-accent-500 hover:text-accent-600 font-medium">Hapus</button>
                </div>
              </div>
            </div>
          ))}
          {facts.length === 0 && <p className="text-center text-foreground/40 py-8">Belum ada fakta.</p>}
        </div>
      )}
    </div>
  );
}
