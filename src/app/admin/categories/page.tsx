"use client";

import { useState, useEffect } from "react";
import { slugify } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { PlusCircle, AlertCircle, Tag } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface Category { id: string; name: string; slug: string; description?: string; sortOrder: number; visible: boolean }

const inputCls = "w-full border border-[#E8E6E1] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#0a0a0a] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-3 focus:ring-[#789185]/10 transition-all";
const labelCls = "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <AdminShell
      title="Categories"
      subtitle={`${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`}
      action={
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#0a0a0a] text-white text-[12.5px] font-body font-semibold px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors shadow-sm"
        >
          <PlusCircle size={13} />
          Add Category
        </button>
      }
    >
      <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden shadow-sm">
        {categories.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F4F3F0] flex items-center justify-center mx-auto mb-4">
              <Tag size={20} className="text-[#ccc]" />
            </div>
            <p className="text-sm font-body text-[#bbb] mb-2">No categories yet.</p>
            <button onClick={() => setOpen(true)} className="text-sm text-[#789185] hover:underline font-semibold">
              Add your first category →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[480px]">
              <thead>
                <tr className="border-b border-[#F0EEE9] bg-[#FAFAF8]">
                  <th className="text-left px-5 py-3.5 text-[10.5px] uppercase tracking-[0.08em] text-[#b0aca6] font-semibold">Name</th>
                  <th className="text-left px-4 py-3.5 text-[10.5px] uppercase tracking-[0.08em] text-[#b0aca6] font-semibold">Slug</th>
                  <th className="text-left px-4 py-3.5 text-[10.5px] uppercase tracking-[0.08em] text-[#b0aca6] font-semibold">Description</th>
                  <th className="text-left px-4 py-3.5 text-[10.5px] uppercase tracking-[0.08em] text-[#b0aca6] font-semibold">Visibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3F0]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-[#0a0a0a] text-[13px]">{cat.name}</td>
                    <td className="px-4 py-3.5 text-[#aaa] font-mono text-xs">{cat.slug}</td>
                    <td className="px-4 py-3.5 text-[#888] text-xs max-w-[240px] truncate">{cat.description || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ${
                        cat.visible ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"
                      }`}>
                        {cat.visible ? "Visible" : "Hidden"}
                      </span>
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
            <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-[#E8E6E1] text-[#666] font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#F7F6F3] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#0a0a0a] text-white font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50 shadow-sm">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Adding…</span> : "Add Category"}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
