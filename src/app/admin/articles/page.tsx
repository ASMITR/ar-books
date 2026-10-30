"use client";

import { useState, useEffect } from "react";
import { slugify } from "@/lib/utils";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { PlusCircle, Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  publishedAt?: string;
  coverImageUrl?: string;
}

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
};

const EMPTY_FORM: FormState = { title: "", slug: "", excerpt: "", content: "" };

const inputCls =
  "w-full border border-[#E6E3DD] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#080808] " +
  "placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] " +
  "focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls =
  "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";

// ── Article form (shared by create + edit) ─────────────────────────────────
function ArticleForm({
  form,
  onChange,
  onSubmit,
  loading,
  error,
  onCancel,
  submitLabel,
}: {
  form: FormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
      <div>
        <label className={labelCls}>Title *</label>
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          required
          autoFocus
          className={inputCls}
          placeholder="Article title"
        />
      </div>
      <div>
        <label className={labelCls}>Slug *</label>
        <input
          name="slug"
          value={form.slug}
          onChange={onChange}
          required
          className={inputCls}
          placeholder="article-slug"
        />
        <p className="text-[10px] font-body text-[#bbb] mt-1">
          URL: /articles/<span className="text-[#789185]">{form.slug || "…"}</span>
        </p>
      </div>
      <div>
        <label className={labelCls}>Excerpt *</label>
        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={onChange}
          required
          rows={2}
          className={`${inputCls} resize-none`}
          placeholder="Short description shown in listings"
        />
      </div>
      <div>
        <label className={labelCls}>Content *</label>
        <textarea
          name="content"
          value={form.content}
          onChange={onChange}
          required
          rows={14}
          className={`${inputCls} resize-y font-mono text-[13px]`}
          placeholder={`Markdown supported:\n\n## Heading\n\n**Bold**, *italic*, [link](https://…)\n\n> Blockquote\n\n- List item\n- Another item`}
        />
        <p className="text-[10px] font-body text-[#bbb] mt-1">
          Supports Markdown — headings, bold, italic, lists, blockquotes, code, links.
        </p>
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-body">
          {error}
        </p>
      )}
      <div className="flex gap-3 pt-1">
        <AdminButton
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </AdminButton>
        <AdminButton
          type="submit"
          className="flex-1"
          loading={loading}
          loadingText="Saving…"
        >
          {submitLabel}
        </AdminButton>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  // ── Create modal ─────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // ── Edit modal ───────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<Article | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Delete modal ─────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchArticles = async () => {
    const res = await fetch("/api/admin/articles");
    const json = await res.json();
    if (json.success) setArticles(json.data);
  };

  useEffect(() => { fetchArticles(); }, []);

  // ── Shared field change handler factory ──────────────────────────────────
  const makeChangeHandler =
    (setter: React.Dispatch<React.SetStateAction<FormState>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setter((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "title" ? { slug: slugify(value) } : {}),
      }));
    };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...createForm, published: false }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create article");
      setCreateForm(EMPTY_FORM);
      setCreateOpen(false);
      fetchArticles();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEdit = (article: Article) => {
    setEditTarget(article);
    setEditForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
    });
    setEditError(null);
  };

  // ── Save edit ─────────────────────────────────────────────────────────────
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/articles/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save changes");
      setEditTarget(null);
      fetchArticles();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Publish toggle ────────────────────────────────────────────────────────
  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/admin/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        published: !published,
        publishedAt: !published ? new Date().toISOString() : null,
      }),
    });
    fetchArticles();
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete article");
      setDeleteTarget(null);
      fetchArticles();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell
      title="Articles"
      subtitle={`${articles.length} article${articles.length !== 1 ? "s" : ""}`}
      action={
        <AdminButton onClick={() => { setCreateForm(EMPTY_FORM); setCreateError(null); setCreateOpen(true); }} icon={<PlusCircle />}>
          New Article
        </AdminButton>
      }
    >
      {/* ── Articles table ──────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-body text-[#bbb] mb-3">No articles yet.</p>
            <AdminButton variant="inline" onClick={() => setCreateOpen(true)}>
              Write your first article →
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[560px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Title</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Slug</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Status</th>
                  <th className="px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAF9F6] transition-colors group">
                    <td className="px-5 py-3.5 font-semibold text-[#080808] max-w-[260px] truncate">{a.title}</td>
                    <td className="px-4 py-3.5 text-[#aaa] font-mono text-xs">{a.slug}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ${
                        a.published
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-50 text-slate-500 ring-slate-200"
                      }`}>
                        {a.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(a)}
                          title="Edit article"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold border border-[#E6E3DD] text-[#555] px-2.5 py-1.5 rounded hover:bg-[#F5EFE6] hover:border-[#789185] hover:text-[#315B55] transition-colors"
                        >
                          <Pencil size={11} /> Edit
                        </button>

                        {/* Publish / Unpublish */}
                        <button
                          onClick={() => togglePublish(a.id, a.published)}
                          title={a.published ? "Unpublish" : "Publish"}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold border px-2.5 py-1.5 rounded transition-colors ${
                            a.published
                              ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {a.published ? <EyeOff size={11} /> : <Eye size={11} />}
                          {a.published ? "Unpublish" : "Publish"}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => { setDeleteTarget(a); setDeleteError(null); }}
                          title="Delete article"
                          className="w-7 h-7 flex items-center justify-center rounded text-[#ccc] hover:text-red-600 hover:bg-red-50 transition-all"
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

      {/* ── Create modal ────────────────────────────────────────────────── */}
      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Article"
        maxWidth="max-w-2xl"
      >
        <ArticleForm
          form={createForm}
          onChange={makeChangeHandler(setCreateForm)}
          onSubmit={handleCreate}
          loading={createLoading}
          error={createError}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Save Draft"
        />
      </AdminModal>

      {/* ── Edit modal ──────────────────────────────────────────────────── */}
      <AdminModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit — ${editTarget?.title ?? ""}`}
        maxWidth="max-w-2xl"
      >
        <ArticleForm
          form={editForm}
          onChange={makeChangeHandler(setEditForm)}
          onSubmit={handleEdit}
          loading={editLoading}
          error={editError}
          onCancel={() => setEditTarget(null)}
          submitLabel="Save Changes"
        />
      </AdminModal>

      {/* ── Delete confirmation modal ────────────────────────────────────── */}
      <AdminModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Article"
      >
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm font-body text-[#555]">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-[#080808]">
              &quot;{deleteTarget?.title}&quot;
            </span>
            ? This action cannot be undone.
          </p>
          {deleteError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-body">
              {deleteError}
            </p>
          )}
          <div className="flex gap-3">
            <AdminButton
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              className="flex-1"
              loading={deleting}
              loadingText="Deleting…"
              onClick={handleDelete}
            >
              Delete Article
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
