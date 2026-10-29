"use client";

import { useState, useEffect } from "react";
import { slugify } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { PlusCircle, AlertCircle, Tag, Trash2 } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface Category { id: string; name: string; slug: string; description?: string; sortOrder: number; visible: boolean }

const inputCls = "w-full border border-[#E6E3DD] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#080808] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls = "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    if (json.success) setCategories(json.data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slugify(name), description, sortOrder: categories.length, visible: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error("Failed to add category");
      setName(""); setDescription(""); setOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete category");
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell
      title="Categories"
      subtitle={`${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`}
      action={
        <AdminButton onClick={() => setOpen(true)} icon={<PlusCircle />}>
          Add Category
        </AdminButton>
      }
    >
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {categories.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F2F0EC] flex items-center justify-center mx-auto mb-4">
              <Tag size={20} className="text-[#ccc]" />
            </div>
            <p className="text-sm font-body text-[#bbb] mb-3">No categories yet.</p>
            <AdminButton variant="inline" onClick={() => setOpen(true)}>
              Add your first category →
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[480px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Name</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Slug</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Description</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Visibility</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-[#080808] text-[13px]">{cat.name}</td>
                    <td className="px-4 py-3.5 text-[#aaa] font-mono text-xs">{cat.slug}</td>
                    <td className="px-4 py-3.5 text-[#888] text-xs max-w-[240px] truncate">{cat.description || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ${
                        cat.visible ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"
                      }`}>
                        {cat.visible ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setDeleteTarget(cat); setDeleteError(null); }}
                        title="Delete category"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title="Add Category" subtitle="Create a new book category">
        <form onSubmit={handleAdd} className="p-6 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus placeholder="e.g. Self Help" className={inputCls} />
            {name && (
              <p className="text-[11px] text-[#9e9a94] mt-1.5 font-body">
                Slug: <span className="font-mono text-[#789185]">{slugify(name)}</span>
              </p>
            )}
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className={inputCls} />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 font-body bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={12} className="shrink-0" />{error}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <AdminButton type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" className="flex-1" loading={loading} loadingText="Adding…">
              Add Category
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Delete confirmation modal */}
      <AdminModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Category">
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm font-body text-[#555]">
            Are you sure you want to delete the category{" "}
            <span className="font-semibold text-[#080808]">{deleteTarget?.name}</span>?
            If any books use this category, the delete will be blocked — remove it from all books first.
          </p>
          {deleteError && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 font-body">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              {deleteError}
            </div>
          )}
          <div className="flex gap-3">
            <AdminButton variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              className="flex-1"
              loading={deleting}
              loadingText="Deleting…"
              onClick={handleDelete}
            >
              Delete Category
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
