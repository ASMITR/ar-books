"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authorBookSchema, type AuthorBookInput } from "@/lib/validations";
import type { Category, Series } from "@/types";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";

export default function NewBookPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [previewUploading, setPreviewUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AuthorBookInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(authorBookSchema) as any,
    defaultValues: { language: "English", categoryIds: [] },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/author/series").then((r) => r.json()),
    ]).then(([cJson, sJson]) => {
      if (cJson.success) setCategories(cJson.data);
      if (sJson.success) setSeries(sJson.data.filter((s: Series) => s.submissionStatus === "published" || s.submissionStatus === "approved"));
    });
  }, []);

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
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url, path } = await uploadFile(file, "cover");
      setCoverUrl(url);
      setCoverPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url, path } = await uploadFile(file, "pdf");
      setPdfUrl(url);
      setPdfPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload failed");
    }
  };

  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url, path } = await uploadFile(file, "preview");
      setPreviewUrl(url);
      setPreviewPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview upload failed");
    }
  };

  const onSubmit = async (data: AuthorBookInput) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/author/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coverImageUrl: coverUrl,
          coverImagePath: coverPath,
          privatePdfUrl: pdfUrl,
          privatePdfPath: pdfPath,
          previewPdfUrl: previewUrl,
          previewPdfPath: previewPath,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
      router.push(`/author/books/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save book");
    } finally {
      setSaving(false);
    }
  };

  const selectedCategories = watch("categoryIds") ?? [];

  const toggleCategory = (id: string) => {
    const current = selectedCategories;
    setValue("categoryIds", current.includes(id) ? current.filter((c) => c !== id) : [...current, id]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/author/books" className="p-2 rounded-lg hover:bg-[#F0EDE7] transition-colors">
          <ArrowLeft size={16} className="text-[#666]" />
        </Link>
        <div>
          <h1 className="text-xl font-heading font-bold text-[#080808]">Add New Book</h1>
          <p className="text-xs text-[#888] mt-0.5">Your book will be saved as a draft. Submit it for owner review when ready.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Cover Upload */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5">
          <h2 className="font-semibold text-sm text-[#080808] mb-4">Cover Image</h2>
          <div className="flex items-center gap-4">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Cover" className="w-24 h-32 object-cover rounded-lg border border-[#E6E3DD]" />
            ) : (
              <div className="w-24 h-32 rounded-lg bg-[#F4F2EE] border-2 border-dashed border-[#DDD] flex items-center justify-center">
                <Upload size={20} className="text-[#CCC]" />
              </div>
            )}
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#F4F2EE] hover:bg-[#E8E5E0] border border-[#E6E3DD] rounded-lg text-sm font-medium text-[#080808] transition-colors">
                {coverUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {coverUploading ? "Uploading…" : coverUrl ? "Replace Cover" : "Upload Cover"}
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={coverUploading} />
              </label>
              <p className="text-xs text-[#999] mt-1.5">JPG, PNG or WEBP. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#080808]">Book Details</h2>

          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Title *</label>
            <input {...register("title")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="Enter book title" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Slug * <span className="text-[#999] font-normal">(URL-friendly, e.g. my-book-title)</span></label>
            <input {...register("slug")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="my-book-title" />
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Subtitle</label>
            <input {...register("subtitle")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="Optional subtitle" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Description * <span className="text-[#999] font-normal">(min 10 characters)</span></label>
            <textarea {...register("description")} rows={5} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="Describe your book…" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Language</label>
              <input {...register("language")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="English" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Page Count</label>
              <input {...register("pageCount", { valueAsNumber: true })} type="number" min="1" className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="e.g. 250" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">
              Suggested Price (₹) <span className="text-[#999] font-normal">— owner sets the final price</span>
            </label>
            <input
              {...register("suggestedPriceRupees", { valueAsNumber: true })}
              type="number"
              min="1"
              step="0.01"
              className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]"
              placeholder="e.g. 299"
            />
            {errors.suggestedPriceRupees && <p className="text-xs text-red-500 mt-1">{errors.suggestedPriceRupees.message}</p>}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5">
          <h2 className="font-semibold text-sm text-[#080808] mb-3">Categories *</h2>
          {categories.length === 0 ? (
            <p className="text-xs text-[#999]">No categories available.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedCategories.includes(cat.id)
                      ? "bg-[#080808] text-white border-[#080808]"
                      : "bg-white text-[#555] border-[#E6E3DD] hover:border-[#080808]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
          {errors.categoryIds && <p className="text-xs text-red-500 mt-2">{errors.categoryIds.message as string}</p>}
        </div>

        {/* Series */}
        {series.length > 0 && (
          <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-sm text-[#080808]">Series (optional)</h2>
            <select {...register("seriesId")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30">
              <option value="">— None —</option>
              {series.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Volume / Order in Series</label>
              <input {...register("seriesOrder", { valueAsNumber: true })} type="number" min="1" className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" placeholder="e.g. 1" />
            </div>
          </div>
        )}

        {/* Manuscript Upload */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#080808]">Manuscript & Preview</h2>

          <div>
            <label className="block text-xs font-medium text-[#555] mb-2">Full Manuscript PDF (private — required for submission)</label>
            <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${pdfUrl ? "bg-green-50 border-green-200 text-green-700" : "bg-[#F4F2EE] border-[#E6E3DD] text-[#080808] hover:bg-[#E8E5E0]"}`}>
              {pdfUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {pdfUploading ? "Uploading…" : pdfUrl ? "✓ Uploaded — Replace" : "Upload PDF"}
              <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" disabled={pdfUploading} />
            </label>
            <p className="text-xs text-[#999] mt-1.5">Max 100MB. This PDF will never be directly exposed to customers.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#555] mb-2">Preview / Sample PDF (optional)</label>
            <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${previewUrl ? "bg-green-50 border-green-200 text-green-700" : "bg-[#F4F2EE] border-[#E6E3DD] text-[#080808] hover:bg-[#E8E5E0]"}`}>
              {previewUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {previewUploading ? "Uploading…" : previewUrl ? "✓ Uploaded — Replace" : "Upload Preview PDF"}
              <input type="file" accept="application/pdf" onChange={handlePreviewUpload} className="hidden" disabled={previewUploading} />
            </label>
            <p className="text-xs text-[#999] mt-1.5">A sample chapter or excerpt for potential buyers. Max 20MB.</p>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#080808]">SEO (optional)</h2>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">SEO Title</label>
            <input {...register("seoTitle")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">SEO Description</label>
            <textarea {...register("seoDescription")} rows={2} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm resize-none focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Keywords (comma-separated)</label>
            <input {...register("seoKeywords")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" placeholder="e.g. fiction, thriller, india" />
          </div>
        </div>

        <div className="flex gap-3 pb-4">
          <button
            type="submit"
            disabled={saving || coverUploading || pdfUploading || previewUploading}
            className="flex items-center gap-2 bg-[#080808] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#111] disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <Link href="/author/books" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#666] hover:bg-[#F0EDE7] transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
