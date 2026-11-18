"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authorBookSchema, type AuthorBookInput } from "@/lib/validations";
import type { Book, Category, Series } from "@/types";
import { ArrowLeft, Loader2, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [previewUploading, setPreviewUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<AuthorBookInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(authorBookSchema) as any,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/author/books/${id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/author/series").then((r) => r.json()),
    ]).then(([bJson, cJson, sJson]) => {
      if (bJson.success) {
        const b: Book = bJson.data;
        setBook(b);
        // Populate form
        reset({
          title: b.title,
          slug: b.slug,
          subtitle: b.subtitle ?? "",
          description: b.description,
          suggestedPriceRupees: b.suggestedPriceRupees,
          categoryIds: b.categoryIds ?? [],
          seriesId: b.seriesId ?? undefined,
          seriesOrder: b.seriesOrder ?? undefined,
          pageCount: b.pageCount,
          language: b.language ?? "English",
          seoTitle: b.seoTitle ?? "",
          seoDescription: b.seoDescription ?? "",
          seoKeywords: (b as Book & { seoKeywords?: string }).seoKeywords ?? "",
        });
        setCoverUrl(b.coverImageUrl ?? null);
        setCoverPath(b.coverImagePath ?? null);
        setPdfUrl(b.privatePdfUrl ?? null);
        setPdfPath(b.privatePdfPath ?? null);
        setPreviewUrl(b.previewPdfUrl ?? null);
        setPreviewPath(b.previewPdfPath ?? null);
      }
      if (cJson.success) setCategories(cJson.data);
      if (sJson.success) setSeries(sJson.data);
    }).finally(() => setLoading(false));
  }, [id, reset]);

  async function uploadFile(file: File, type: "cover" | "pdf" | "preview") {
    const setUploading = type === "cover" ? setCoverUploading : type === "pdf" ? setPdfUploading : setPreviewUploading;
    setUploading(true);
    try {
      const sigRes = await fetch("/api/author/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const sigData = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigData.error ?? "Failed to get upload signature");
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sigData.apiKey);
      form.append("timestamp", sigData.timestamp);
      form.append("signature", sigData.signature);
      form.append("folder", sigData.folder);
      form.append("use_filename", "true");
      form.append("unique_filename", "true");
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${sigData.resource_type}/upload`,
        { method: "POST", body: form }
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message ?? "Upload failed");
      return { url: uploadData.secure_url as string, path: uploadData.public_id as string };
    } finally {
      setUploading(false);
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const r = await uploadFile(file, "cover"); setCoverUrl(r.url); setCoverPath(r.path); }
    catch (err) { setError(err instanceof Error ? err.message : "Cover upload failed"); }
  };
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const r = await uploadFile(file, "pdf"); setPdfUrl(r.url); setPdfPath(r.path); }
    catch (err) { setError(err instanceof Error ? err.message : "PDF upload failed"); }
  };
  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const r = await uploadFile(file, "preview"); setPreviewUrl(r.url); setPreviewPath(r.path); }
    catch (err) { setError(err instanceof Error ? err.message : "Preview upload failed"); }
  };

  const onSubmit = async (data: AuthorBookInput) => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      const res = await fetch(`/api/author/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coverImageUrl: coverUrl, coverImagePath: coverPath,
          privatePdfUrl: pdfUrl, privatePdfPath: pdfPath,
          previewPdfUrl: previewUrl, previewPdfPath: previewPath,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
      setSuccess(true);
      setTimeout(() => router.push(`/author/books/${id}`), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const selectedCategories = watch("categoryIds") ?? [];
  const toggleCategory = (cid: string) => {
    const cur = selectedCategories;
    setValue("categoryIds", cur.includes(cid) ? cur.filter((c) => c !== cid) : [...cur, cid]);
  };

  if (loading) return <div className="max-w-2xl mx-auto space-y-4"><div className="h-8 bg-gray-200 rounded w-32 animate-pulse" /><div className="h-80 bg-gray-100 rounded-xl animate-pulse" /></div>;

  if (!book) return <div className="text-center py-16 text-[#888]">Book not found.<br /><Link href="/author/books" className="text-[#789185] hover:underline mt-2 inline-block">← Back</Link></div>;

  const status = book.submissionStatus ?? "draft";
  if (status !== "draft" && status !== "changes_requested") {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-[#888]">This book is in <strong>{status}</strong> status and cannot be edited.</p>
        <Link href={`/author/books/${id}`} className="mt-4 inline-block text-sm text-[#789185] hover:underline">← Back to book</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/author/books/${id}`} className="p-2 rounded-lg hover:bg-[#F0EDE7] transition-colors">
          <ArrowLeft size={16} className="text-[#666]" />
        </Link>
        <div>
          <h1 className="text-xl font-heading font-bold text-[#080808]">Edit Book</h1>
          <p className="text-xs text-[#888] mt-0.5">{book.title}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2"><CheckCircle2 size={15} /> Saved. Redirecting…</div>}

      {status === "changes_requested" && book.ownerFeedback && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
          <strong>Owner feedback:</strong> {book.ownerFeedback}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Cover */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5">
          <h2 className="font-semibold text-sm text-[#080808] mb-4">Cover Image</h2>
          <div className="flex items-center gap-4">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Cover" className="w-24 h-32 object-cover rounded-lg border border-[#E6E3DD]" />
            ) : (
              <div className="w-24 h-32 rounded-lg bg-[#F4F2EE] border-2 border-dashed border-[#DDD] flex items-center justify-center"><Upload size={20} className="text-[#CCC]" /></div>
            )}
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#F4F2EE] hover:bg-[#E8E5E0] border border-[#E6E3DD] rounded-lg text-sm font-medium transition-colors">
              {coverUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {coverUploading ? "Uploading…" : coverUrl ? "Replace" : "Upload Cover"}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={coverUploading} />
            </label>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#080808]">Book Details</h2>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Title *</label>
            <input {...register("title")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Slug *</label>
            <input {...register("slug")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm font-mono focus:outline-none" />
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Subtitle</label>
            <input {...register("subtitle")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Description *</label>
            <textarea {...register("description")} rows={5} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm resize-none focus:outline-none" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Language</label>
              <input {...register("language")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Page Count</label>
              <input {...register("pageCount", { valueAsNumber: true })} type="number" min="1" className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Suggested Price (₹)</label>
            <input {...register("suggestedPriceRupees", { valueAsNumber: true })} type="number" min="1" step="0.01" className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5">
          <h2 className="font-semibold text-sm text-[#080808] mb-3">Categories *</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedCategories.includes(cat.id) ? "bg-[#080808] text-white border-[#080808]" : "bg-white text-[#555] border-[#E6E3DD] hover:border-[#080808]"}`}>
                {cat.name}
              </button>
            ))}
          </div>
          {errors.categoryIds && <p className="text-xs text-red-500 mt-2">{errors.categoryIds.message as string}</p>}
        </div>

        {/* Series */}
        {series.length > 0 && (
          <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-sm text-[#080808]">Series</h2>
            <select {...register("seriesId")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none">
              <option value="">— None —</option>
              {series.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Volume / Order</label>
              <input {...register("seriesOrder", { valueAsNumber: true })} type="number" min="1" className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" />
            </div>
          </div>
        )}

        {/* Manuscript */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#080808]">Manuscript & Preview</h2>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-2">Full Manuscript PDF</label>
            <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${pdfUrl ? "bg-green-50 border-green-200 text-green-700" : "bg-[#F4F2EE] border-[#E6E3DD] text-[#080808] hover:bg-[#E8E5E0]"}`}>
              {pdfUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {pdfUploading ? "Uploading…" : pdfUrl ? "✓ Uploaded — Replace" : "Upload PDF"}
              <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" disabled={pdfUploading} />
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-2">Preview PDF (optional)</label>
            <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${previewUrl ? "bg-green-50 border-green-200 text-green-700" : "bg-[#F4F2EE] border-[#E6E3DD] text-[#080808] hover:bg-[#E8E5E0]"}`}>
              {previewUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {previewUploading ? "Uploading…" : previewUrl ? "✓ Uploaded — Replace" : "Upload Preview"}
              <input type="file" accept="application/pdf" onChange={handlePreviewUpload} className="hidden" disabled={previewUploading} />
            </label>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#080808]">SEO</h2>
          <div><label className="block text-xs font-medium text-[#555] mb-1.5">SEO Title</label><input {...register("seoTitle")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-[#555] mb-1.5">SEO Description</label><textarea {...register("seoDescription")} rows={2} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm resize-none focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-[#555] mb-1.5">Keywords</label><input {...register("seoKeywords")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" /></div>
        </div>

        <div className="flex gap-3 pb-4">
          <button type="submit" disabled={saving || coverUploading || pdfUploading || previewUploading}
            className="flex items-center gap-2 bg-[#080808] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#111] disabled:opacity-50 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link href={`/author/books/${id}`} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#666] hover:bg-[#F0EDE7] transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
