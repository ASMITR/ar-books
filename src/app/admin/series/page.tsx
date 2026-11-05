"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminModal } from "@/components/admin/AdminModal";
import { PlusCircle, Layers, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { Series } from "@/types";

const inputCls =
  "w-full border border-[#E8E6E1] rounded-lg px-4 py-3 text-[14px] font-body text-[#0a0a0a] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls =
  "block text-[12px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-2";

interface FormState {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  visible: boolean;
}

const defaultForm: FormState = { name: "", slug: "", description: "", sortOrder: 0, visible: true };

function autoSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Series | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Series | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeries = useCallback(async () => {
    const res = await fetch("/api/admin/series");
    const json = await res.json();
    if (json.success) setSeries(json.data);
  }, []);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(defaultForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (s: Series) => {
    setEditTarget(s);
    setForm({ name: s.name, slug: s.slug, description: s.description ?? "", sortOrder: s.sortOrder, visible: s.visible });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const url = editTarget ? `/api/admin/series/${editTarget.id}` : "/api/admin/series";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      setModalOpen(false);
      fetchSeries();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/series/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete");
      setDeleteTarget(null);
      fetchSeries();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell
      title="Series"
      subtitle={`${series.length} series`}
      action={
        <AdminButton onClick={openAdd} icon={<PlusCircle />}>
          Add Series
        </AdminButton>
      }
    >
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {series.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-xl bg-[#F2F0EC] flex items-center justify-center mx-auto mb-4">
              <Layers size={24} className="text-[#ccc]" />
            </div>
            <p className="text-[15px] font-body text-[#bbb] mb-3">No series yet.</p>
            <AdminButton variant="inline" onClick={openAdd}>Create your first series →</AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-body min-w-[500px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Name</th>
                  <th className="text-left px-4 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Slug</th>
                  <th className="text-left px-4 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Order</th>
                  <th className="text-left px-4 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Visible</th>
                  <th className="text-left px-4 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {series.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#080808] text-[14px]">{s.name}</p>
                      {s.description && <p className="text-[12px] text-[#aaa] mt-0.5 truncate max-w-[240px]">{s.description}</p>}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#888] font-mono">{s.slug}</td>
                    <td className="px-4 py-4 text-[13px] text-[#888]">{s.sortOrder}</td>
                    <td className="px-4 py-4">
                      {s.visible
                        ? <Eye size={14} className="text-emerald-500" />
                        : <EyeOff size={14} className="text-[#ccc]" />}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <AdminButton variant="inline" onClick={() => openEdit(s)} icon={<Pencil />}>Edit</AdminButton>
                        <button
                          onClick={() => { setDeleteTarget(s); setError(null); }}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Series" : "New Series"}>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Name *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editTarget ? f.slug : autoSlug(e.target.value) }))}
              placeholder="e.g. The Mindset Series"
            />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="the-mindset-series"
            />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description…"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Sort Order</label>
              <input
                type="number"
                className={inputCls}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
                  className="accent-[#789185] w-4 h-4"
                />
                <span className="text-[14px] font-body text-[#555]">Visible on site</span>
              </label>
            </div>
          </div>
          {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <AdminButton variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton variant="dark" className="flex-1" loading={saving} loadingText="Saving…" onClick={handleSave}>
              {editTarget ? "Save Changes" : "Create Series"}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Delete confirmation */}
      <AdminModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Series">
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm font-body text-[#555]">
            Delete <span className="font-semibold text-[#080808]">{deleteTarget?.name}</span>? Books in this series will be unlinked but not deleted.
          </p>
          {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3">
            <AdminButton variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</AdminButton>
            <AdminButton variant="danger" className="flex-1" loading={deleting} loadingText="Deleting…" onClick={handleDelete}>
              Delete Series
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
