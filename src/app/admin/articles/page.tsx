"use client";

import { useState, useEffect } from "react";
import { slugify } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { PlusCircle } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface Article { id: string; title: string; slug: string; excerpt: string; content: string; published: boolean; publishedAt?: string; }

const inputCls = "w-full border border-[#E9E7E2] rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10";

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
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#0a0a0a] text-white text-xs font-body font-medium px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors"
        >
          <PlusCircle size={13} />
          New Article
        </button>
      }
    >
      <div className="bg-white border border-[#E9E7E2] rounded-xl overflow-hidden">
        {articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-body text-[#bbb]">No articles yet.</p>
            <button onClick={() => setOpen(true)} className="text-sm text-[#789185] hover:underline mt-2 inline-block font-medium">Write your first article →</button>
          </div>
        ) : (
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-[#F0EFEB]">
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Title</th>
                <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Slug</th>
                <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Status</th>
                <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F6F3]">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-[#FAFAF9] transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[#0a0a0a] max-w-[260px] truncate">{a.title}</td>
                  <td className="px-4 py-3.5 text-[#aaa] font-mono text-xs">{a.slug}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-[11px] rounded-full font-medium ring-1 ${a.published ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                      {a.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => togglePublish(a.id, a.published)} className="text-xs text-[#789185] hover:underline font-semibold">
                      {a.published ? "Unpublish" : "Publish"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title="New Article" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required autoFocus className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Slug *</label>
                <input name="slug" value={form.slug} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Excerpt *</label>
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} required rows={2} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Content *</label>
                <textarea name="content" value={form.content} onChange={handleChange} required rows={6} className={`${inputCls} resize-none`} />
              </div>
              {error && <p className="text-xs text-red-600 font-body">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-[#E9E7E2] text-[#666] font-body text-sm px-4 py-2.5 rounded-lg hover:bg-[#FAFAF9] transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#0a0a0a] text-white font-body text-sm px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50">{loading ? "Saving…" : "Save Draft"}</button>
              </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
