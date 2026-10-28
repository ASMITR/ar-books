"use client";

import { useState, useEffect } from "react";
import { slugify } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { PlusCircle } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface Article { id: string; title: string; slug: string; excerpt: string; content: string; published: boolean; publishedAt?: string; }

const inputCls = "w-full border border-[#E6E3DD] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#080808] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls = "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    const res = await fetch("/api/admin/articles");
    const json = await res.json();
    if (json.success) setArticles(json.data);
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value, ...(name === "title" ? { slug: slugify(value) } : {}) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published: false }),
      });
      const json = await res.json();
      if (!json.success) throw new Error("Failed to create article");
      setForm({ title: "", slug: "", excerpt: "", content: "" });
      setOpen(false); fetchArticles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  };

  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/admin/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published, publishedAt: !published ? new Date().toISOString() : null }),
    });
    fetchArticles();
  };

  return (
    <AdminShell
      title="Articles"
      subtitle={`${articles.length} article${articles.length !== 1 ? "s" : ""}`}
      action={
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-[#FFC928] text-[#080808] text-[13px] font-body font-semibold px-4 py-2.5 rounded-lg hover:bg-[#F2B916] transition-colors shadow-sm">
          <PlusCircle size={14} /> New Article
        </button>
      }
    >
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-body text-[#bbb]">No articles yet.</p>
            <button onClick={() => setOpen(true)} className="text-sm text-[#789185] hover:underline mt-2 inline-block font-semibold">Write your first article →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[480px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Title</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Slug</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Status</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-[#080808] max-w-[260px] truncate">{a.title}</td>
                    <td className="px-4 py-3.5 text-[#aaa] font-mono text-xs">{a.slug}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ${a.published ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                        {a.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => togglePublish(a.id, a.published)} className="text-xs text-[#789185] hover:text-[#080808] hover:underline font-semibold transition-colors">
                        {a.published ? "Unpublish" : "Publish"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title="New Article" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required autoFocus className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input name="slug" value={form.slug} onChange={handleChange} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Excerpt *</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} required rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Content *</label>
            <textarea name="content" value={form.content} onChange={handleChange} required rows={6} className={`${inputCls} resize-none`} />
          </div>
          {error && <p className="text-xs text-red-600 font-body">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-[#E6E3DD] text-[#666] font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#F2F0EC] transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#FFC928] text-[#080808] font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#F2B916] transition-colors disabled:opacity-50 shadow-sm">{loading ? "Saving…" : "Save Draft"}</button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
