"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authorBookSchema, type AuthorBookInput } from "@/lib/validations";
import type { Category, Series } from "@/types";
import { ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const inputCls = "w-full bg-[#F7F5F2] border border-[#E2DDD8] px-4 py-3 text-[13px] font-body text-[#111] placeholder:text-[#C4BFB9] focus:outline-none focus:border-[#203A2B] focus:bg-white focus:ring-2 focus:ring-[#203A2B]/8 transition-all rounded-lg";
const textareaCls = `${inputCls} resize-none`;

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">
      {children}{hint && <span className="ml-1.5 normal-case tracking-normal font-normal text-[#b5b0a9]">{hint}</span>}
    </label>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E8E4DE] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-[#EDE9E3]">
        <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a]">{title}</h2>
      </div>
      <div className="p-5 sm:p-6 space-y-4">{children}</div>
    </div>
  );
}

async function uploadToCloudinary(
  file: File,
  type: "cover" | "pdf" | "preview",
  onProgress?: (uploading: boolean) => void
): Promise<{ url: string; path: string }> {
  onProgress?.(true);
  try {
    const sigRes  = await fetch("/api/author/upload-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const sigData = await sigRes.json();
    if (!sigRes.ok) throw new Error(sigData.error ?? "Failed to get upload signature");

    const form = new FormData();
    form.append("file", file);
    form.append("api_key",        sigData.apiKey);
    form.append("timestamp",      sigData.timestamp);
    form.append("signature",      sigData.signature);
    form.append("folder",         sigData.folder);
    form.append("use_filename",   "true");
    form.append("unique_filename","true");

    const uploadRes  = await fetch(
      `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${sigData.resource_type}/upload`,
      { method: "POST", body: form }
    );
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error?.message ?? "Upload failed");
    return { url: uploadData.secure_url as string, path: uploadData.public_id as string };
  } finally {
    onProgress?.(false);
  }
}

export default function NewBookPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [series, setSeries]         = useState<Series[]>([]);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const [coverUploading, setCoverUploading]     = useState(false);
  const [pdfUploading, setPdfUploading]         = useState(false);
  const [previewUploading, setPreviewUploading] = useState(false);
  const [coverUrl, setCoverUrl]     = useState<string | null>(null);
  const [coverPath, setCoverPath]   = useState<string | null>(null);
  const [pdfUrl, setPdfUrl]         = useState<string | null>(null);
  const [pdfPath, setPdfPath]       = useState<string | null>(null);
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
      if (sJson.success) setSeries(
        sJson.data.filter((s: Series) => s.submissionStatus === "published" || s.submissionStatus === "approved")
      );
    });
  }, []);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "pdf" | "preview"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const { url, path } = await uploadToCloudinary(
        file, type,
        type === "cover"   ? setCoverUploading :
        type === "pdf"     ? setPdfUploading   : setPreviewUploading
      );
      if (type === "cover")   { setCoverUrl(url);   setCoverPath(path);   }
      if (type === "pdf")     { setPdfUrl(url);     setPdfPath(path);     }
      if (type === "preview") { setPreviewUrl(url); setPreviewPath(path); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const selectedCategories = watch("categoryIds") ?? [];
  const toggleCategory = (id: string) =>
    setValue("categoryIds", selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id]);

  const onSubmit = async (data: AuthorBookInput) => {
    setSaving(true); setError(null);
    try {
      const res  = await fetch("/api/author/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coverImageUrl: coverUrl, coverImagePath: coverPath,
          privatePdfUrl: pdfUrl,   privatePdfPath: pdfPath,
          previewPdfUrl: previewUrl, previewPdfPath: previewPath,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
      router.push(`/author/books/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save book");
    } finally { setSaving(false); }
  };

  const anyUploading = coverUploading || pdfUploading || previewUploading;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      {/* Page header */}
      <div className="shrink-0 bg-white border-b border-[#E8E4DE] px-5 sm:px-7 lg:px-8" style={{ minHeight: 64 }}>
        <div className="flex items-center gap-3 h-full py-3">
          <Link href="/author/books" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#999] hover:text-[#0a0a0a] hover:bg-[#F0EEE9] transition-all">
            <ArrowLeft size={15} />
          </Link>
          <div className="min-w-0">
            <h1 className="font-heading text-[20px] sm:text-[23px] font-bold text-[#0a0a0a] leading-tight tracking-tight">Add New Book</h1>
            <p className="text-[12px] font-body text-[#a09c96]">Saved as draft — submit for owner review when ready</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Cover */}
            <SectionCard title="Cover Image">
              <div className="flex items-center gap-5">
                <div className="shrink-0">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="Cover preview" className="w-24 h-32 object-cover rounded-xl border border-[#E8E4DE] shadow-sm" />
                  ) : (
                    <div className="w-24 h-32 rounded-xl bg-[#F7F5F2] border-2 border-dashed border-[#E2DDD8] flex flex-col items-center justify-center gap-1">
                      <Upload size={18} className="text-[#C4BFB9]" />
                      <span className="text-[9px] font-body text-[#C4BFB9] uppercase tracking-wider">Cover</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-[#F7F5F2] border border-[#E2DDD8] text-[#0a0a0a] font-body font-semibold text-[12.5px] px-4 py-2.5 rounded-lg hover:bg-[#EDE9E3] transition-colors">
                    {coverUploading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[#aaa]/30 border-t-[#aaa] animate-spin" /> : <Upload size={13} />}
                    {coverUploading ? "Uploading…" : coverUrl ? "Replace Cover" : "Upload Cover"}
                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "cover")} className="hidden" disabled={coverUploading} />
                  </label>
                  <p className="text-[11.5px] font-body text-[#b5b0a9]">JPG, PNG or WEBP · Max 5 MB</p>
                </div>
              </div>
            </SectionCard>

            {/* Book details */}
            <SectionCard title="Book Details">
              <div>
                <FieldLabel>Title *</FieldLabel>
                <input {...register("title")} className={inputCls} placeholder="Enter your book title" />
                {errors.title && <p className="text-[11px] font-body text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <FieldLabel hint="(URL-friendly, e.g. my-book-title)">Slug *</FieldLabel>
                <input {...register("slug")} className={`${inputCls} font-mono`} placeholder="my-book-title" />
                {errors.slug && <p className="text-[11px] font-body text-red-500 mt-1">{errors.slug.message}</p>}
              </div>

              <div>
                <FieldLabel>Subtitle</FieldLabel>
                <input {...register("subtitle")} className={inputCls} placeholder="Optional subtitle" />
              </div>

              <div>
                <FieldLabel hint="(min 10 characters)">Description *</FieldLabel>
                <textarea {...register("description")} rows={5} className={textareaCls} placeholder="Tell readers what this book is about…" />
                {errors.description && <p className="text-[11px] font-body text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Language</FieldLabel>
                  <input {...register("language")} className={inputCls} placeholder="English" />
                </div>
                <div>
                  <FieldLabel>Page Count</FieldLabel>
                  <input {...register("pageCount", { valueAsNumber: true })} type="number" min="1" className={inputCls} placeholder="e.g. 250" />
                </div>
              </div>

              <div>
                <FieldLabel hint="— owner sets the final price">Suggested Price (₹)</FieldLabel>
                <input
                  {...register("suggestedPriceRupees", { valueAsNumber: true })}
                  type="number" min="1" step="0.01"
                  className={inputCls}
                  placeholder="e.g. 299"
                />
                {errors.suggestedPriceRupees && <p className="text-[11px] font-body text-red-500 mt-1">{errors.suggestedPriceRupees.message}</p>}
              </div>
            </SectionCard>

            {/* Categories */}
            <SectionCard title="Categories">
              {categories.length === 0 ? (
                <p className="text-[13px] font-body text-[#bbb]">No categories available. The owner needs to add categories first.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[12px] font-body text-[#999]">Select at least one category for your book.</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const selected = selectedCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-body font-semibold border transition-all ${
                            selected
                              ? "bg-[#0D1F17] text-white border-[#0D1F17] shadow-sm"
                              : "bg-white text-[#555] border-[#E2DDD8] hover:border-[#203A2B] hover:text-[#203A2B]"
                          }`}
                        >
                          {selected && <CheckCircle2 size={11} />}
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.categoryIds && (
                    <p className="text-[11px] font-body text-red-500">{errors.categoryIds.message as string}</p>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Series */}
            {series.length > 0 && (
              <SectionCard title="Series (optional)">
                <div>
                  <FieldLabel>Link to a Series</FieldLabel>
                  <select {...register("seriesId")} className={inputCls}>
                    <option value="">— None —</option>
                    {series.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Volume / Order in Series</FieldLabel>
                  <input {...register("seriesOrder", { valueAsNumber: true })} type="number" min="1" className={inputCls} placeholder="e.g. 1" />
                </div>
              </SectionCard>
            )}

            {/* Manuscript */}
            <SectionCard title="Manuscript & Preview PDF">
              <div className="space-y-1">
                <FieldLabel hint="— required before submission">Full Manuscript PDF</FieldLabel>
                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-body font-semibold border transition-colors ${pdfUrl ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-[#F7F5F2] border-[#E2DDD8] text-[#0a0a0a] hover:bg-[#EDE9E3]"}`}>
                  {pdfUploading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[#aaa]/30 border-t-[#aaa] animate-spin" /> : pdfUrl ? <CheckCircle2 size={13} /> : <Upload size={13} />}
                  {pdfUploading ? "Uploading…" : pdfUrl ? "Uploaded — Replace" : "Upload Manuscript PDF"}
                  <input type="file" accept="application/pdf" onChange={(e) => handleUpload(e, "pdf")} className="hidden" disabled={pdfUploading} />
                </label>
                <p className="text-[11.5px] font-body text-[#b5b0a9]">Max 100 MB · Never exposed directly to customers</p>
              </div>

              <div className="space-y-1">
                <FieldLabel hint="— optional">Preview / Sample PDF</FieldLabel>
                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-body font-semibold border transition-colors ${previewUrl ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-[#F7F5F2] border-[#E2DDD8] text-[#0a0a0a] hover:bg-[#EDE9E3]"}`}>
                  {previewUploading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[#aaa]/30 border-t-[#aaa] animate-spin" /> : previewUrl ? <CheckCircle2 size={13} /> : <Upload size={13} />}
                  {previewUploading ? "Uploading…" : previewUrl ? "Uploaded — Replace" : "Upload Preview PDF"}
                  <input type="file" accept="application/pdf" onChange={(e) => handleUpload(e, "preview")} className="hidden" disabled={previewUploading} />
                </label>
                <p className="text-[11.5px] font-body text-[#b5b0a9]">Max 20 MB · Shown to potential buyers</p>
              </div>
            </SectionCard>

            {/* SEO */}
            <SectionCard title="SEO (optional)">
              <div>
                <FieldLabel>SEO Title</FieldLabel>
                <input {...register("seoTitle")} className={inputCls} placeholder="Defaults to book title if empty" />
              </div>
              <div>
                <FieldLabel>SEO Description</FieldLabel>
                <textarea {...register("seoDescription")} rows={2} className={textareaCls} placeholder="Brief description for search engines…" />
              </div>
              <div>
                <FieldLabel hint="(comma-separated)">Keywords</FieldLabel>
                <input {...register("seoKeywords")} className={inputCls} placeholder="e.g. fiction, thriller, india" />
              </div>
            </SectionCard>

            {/* Actions */}
            <div className="flex items-center gap-3 pb-6">
              <button
                type="submit"
                disabled={saving || anyUploading}
                className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body font-bold text-[13px] uppercase tracking-[0.1em] px-6 py-3 rounded-xl hover:bg-[#203A2B] disabled:opacity-50 transition-colors"
              >
                {saving ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
                {saving ? "Saving…" : "Save Draft"}
              </button>
              <Link href="/author/books" className="inline-flex items-center font-body font-semibold text-[13px] text-[#888] hover:text-[#0a0a0a] px-4 py-3 rounded-xl hover:bg-[#EDE9E3] transition-colors">
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
