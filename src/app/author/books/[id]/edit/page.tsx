"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authorBookSchema, type AuthorBookInput } from "@/lib/validations";
import type { Book, Category, Series } from "@/types";
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
  onProgress: (v: boolean) => void
): Promise<{ url: string; path: string }> {
  onProgress(true);
  try {
    const sigRes  = await fetch("/api/author/upload-signature", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const sigData = await sigRes.json();
    if (!sigRes.ok) throw new Error(sigData.error ?? "Signature failed");
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sigData.apiKey);
    form.append("timestamp", sigData.timestamp);
    form.append("signature", sigData.signature);
    form.append("folder", sigData.folder);
    form.append("use_filename", "true");
    form.append("unique_filename", "true");
    const uploadRes  = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/${sigData.resource_type}/upload`, { method: "POST", body: form });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error?.message ?? "Upload failed");
    return { url: uploadData.secure_url as string, path: uploadData.public_id as string };
  } finally { onProgress(false); }
}

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const router   = useRouter();
  const [book, setBook]           = useState<Book | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [series, setSeries]         = useState<Series[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [pdfUploading, setPdfUploading]     = useState(false);
  const [previewUploading, setPreviewUploading] = useState(false);
  const [coverUrl, setCoverUrl]     = useState<string | null>(null);
  const [coverPath, setCoverPath]   = useState<string | null>(null);
  const [pdfUrl, setPdfUrl]         = useState<string | null>(null);
  const [pdfPath, setPdfPath]       = useState<string | null>(null);
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
        const b: Book & { seoKeywords?: string } = bJson.data;
        setBook(b);
        reset({
          title: b.title, slug: b.slug, subtitle: b.subtitle ?? "",
          description: b.description, suggestedPriceRupees: b.suggestedPriceRupees,
          categoryIds: b.categoryIds ?? [], seriesId: b.seriesId ?? undefined,
          seriesOrder: b.seriesOrder ?? undefined, pageCount: b.pageCount,
          language: b.language ?? "English",
          seoTitle: b.seoTitle ?? "", seoDescription: b.seoDescription ?? "",
          seoKeywords: b.seoKeywords ?? "",
        });
        setCoverUrl(b.coverImageUrl ?? null);  setCoverPath(b.coverImagePath ?? null);
        setPdfUrl(b.privatePdfUrl ?? null);    setPdfPath(b.privatePdfPath ?? null);
        setPreviewUrl(b.previewPdfUrl ?? null); setPreviewPath(b.previewPdfPath ?? null);
      }
      if (cJson.success) setCategories(cJson.data);
      if (sJson.success) setSeries(sJson.data);
    }).finally(() => setLoading(false));
  }, [id, reset]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "pdf" | "preview") => {
    const file = e.target.files?.[0]; if (!file) return; setError(null);
    try {
      const { url, path } = await uploadToCloudinary(file, type,
        type === "cover" ? setCoverUploading : type === "pdf" ? setPdfUploading : setPreviewUploading);
      if (type === "cover")   { setCoverUrl(url);   setCoverPath(path);   }
      if (type === "pdf")     { setPdfUrl(url);     setPdfPath(path);     }
      if (type === "preview") { setPreviewUrl(url); setPreviewPath(path); }
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); }
  };

  const selectedCategories = watch("categoryIds") ?? [];
  const toggleCategory = (cid: string) =>
    setValue("categoryIds", selectedCategories.includes(cid)
      ? selectedCategories.filter((c) => c !== cid) : [...selectedCategories, cid]);

  const onSubmit = async (data: AuthorBookInput) => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      const res  = await fetch(`/api/author/books/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coverImageUrl: coverUrl, coverImagePath: coverPath,
          privatePdfUrl: pdfUrl,   privatePdfPath: pdfPath,
          previewPdfUrl: previewUrl, previewPdfPath: previewPath,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
      setSuccess(true);
      setTimeout(() => router.push(`/author/books/${id}`), 1200);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      <div className="shrink-0 bg-white border-b border-[#E8E4DE] h-16 animate-pulse" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-2xl mx-auto w-full">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-[#E8E4DE]" />)}
      </div>
    </div>
  );

  if (!book) return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      <div className="p-8 text-center"><p className="font-body text-[#bbb]">Book not found.</p></div>
    </div>
  );

  const status = book.submissionStatus ?? "draft";
  if (status !== "draft" && status !== "changes_requested") return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="font-body text-[14px] text-[#777]">This book is in <strong>{status}</strong> status and cannot be edited.</p>
        <Link href={`/author/books/${id}`} className="mt-4 inline-block text-[13px] font-body text-[#789185] hover:text-[#0a0a0a]">← Back to book</Link>
      </div>
    </div>
  );

  const anyUploading = coverUploading || pdfUploading || previewUploading;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      <div className="shrink-0 bg-white border-b border-[#E8E4DE] px-5 sm:px-7 lg:px-8" style={{ minHeight: 64 }}>
        <div className="flex items-center gap-3 h-full py-3">
          <Link href={`/author/books/${id}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#999] hover:text-[#0a0a0a] hover:bg-[#F0EEE9] transition-all">
            <ArrowLeft size={15} />
          </Link>
          <div className="min-w-0">
            <h1 className="font-heading text-[20px] sm:text-[23px] font-bold text-[#0a0a0a] leading-tight tracking-tight">Edit Book</h1>
            <p className="text-[12px] font-body text-[#a09c96] truncate">{book.title}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-5">

          {status === "changes_requested" && book.ownerFeedback && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-[16px]">💬</span>
              </div>
              <div>
                <p className="text-[13px] font-body font-semibold text-orange-800">Owner feedback</p>
                <p className="text-[13px] font-body text-orange-700 mt-1 leading-relaxed">{book.ownerFeedback}</p>
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">{error}</div>}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <p className="text-[13px] font-body text-emerald-700">Saved. Redirecting…</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <SectionCard title="Cover Image">
              <div className="flex items-center gap-5">
                <div className="shrink-0">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="Cover" className="w-24 h-32 object-cover rounded-xl border border-[#E8E4DE] shadow-sm" />
                  ) : (
                    <div className="w-24 h-32 rounded-xl bg-[#F7F5F2] border-2 border-dashed border-[#E2DDD8] flex items-center justify-center">
                      <span className="text-[9px] font-body text-[#C4BFB9] uppercase tracking-wider">No cover</span>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 bg-[#F7F5F2] border border-[#E2DDD8] text-[#0a0a0a] font-body font-semibold text-[12.5px] px-4 py-2.5 rounded-lg hover:bg-[#EDE9E3] transition-colors">
                  {coverUploading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[#aaa]/30 border-t-[#aaa] animate-spin" /> : <Upload size={13} />}
                  {coverUploading ? "Uploading…" : coverUrl ? "Replace" : "Upload"}
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "cover")} className="hidden" disabled={coverUploading} />
                </label>
              </div>
            </SectionCard>

            <SectionCard title="Book Details">
              <div>
                <FieldLabel>Title *</FieldLabel>
                <input {...register("title")} className={inputCls} />
                {errors.title && <p className="text-[11px] font-body text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <FieldLabel>Slug *</FieldLabel>
                <input {...register("slug")} className={`${inputCls} font-mono`} />
                {errors.slug && <p className="text-[11px] font-body text-red-500 mt-1">{errors.slug.message}</p>}
              </div>
              <div>
                <FieldLabel>Subtitle</FieldLabel>
                <input {...register("subtitle")} className={inputCls} />
              </div>
              <div>
                <FieldLabel>Description *</FieldLabel>
                <textarea {...register("description")} rows={5} className={textareaCls} />
                {errors.description && <p className="text-[11px] font-body text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Language</FieldLabel>
                  <input {...register("language")} className={inputCls} />
                </div>
                <div>
                  <FieldLabel>Page Count</FieldLabel>
                  <input {...register("pageCount", { valueAsNumber: true })} type="number" min="1" className={inputCls} />
                </div>
              </div>
              <div>
                <FieldLabel hint="— owner sets the final price">Suggested Price (₹)</FieldLabel>
                <input {...register("suggestedPriceRupees", { valueAsNumber: true })} type="number" min="1" step="0.01" className={inputCls} />
              </div>
            </SectionCard>

            <SectionCard title="Categories">
              {categories.length === 0 ? (
                <p className="text-[13px] font-body text-[#bbb]">No categories available.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const sel = selectedCategories.includes(cat.id);
                    return (
                      <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-body font-semibold border transition-all ${sel ? "bg-[#0D1F17] text-white border-[#0D1F17] shadow-sm" : "bg-white text-[#555] border-[#E2DDD8] hover:border-[#203A2B] hover:text-[#203A2B]"}`}>
                        {sel && <CheckCircle2 size={11} />}{cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.categoryIds && <p className="text-[11px] font-body text-red-500 mt-2">{errors.categoryIds.message as string}</p>}
            </SectionCard>

            {series.length > 0 && (
              <SectionCard title="Series">
                <div>
                  <FieldLabel>Link to a Series</FieldLabel>
                  <select {...register("seriesId")} className={inputCls}>
                    <option value="">— None —</option>
                    {series.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Volume / Order</FieldLabel>
                  <input {...register("seriesOrder", { valueAsNumber: true })} type="number" min="1" className={inputCls} />
                </div>
              </SectionCard>
            )}

            <SectionCard title="Manuscript & Preview PDF">
              <div className="space-y-1">
                <FieldLabel>Full Manuscript PDF</FieldLabel>
                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-body font-semibold border transition-colors ${pdfUrl ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-[#F7F5F2] border-[#E2DDD8] text-[#0a0a0a] hover:bg-[#EDE9E3]"}`}>
                  {pdfUploading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[#aaa]/30 border-t-[#aaa] animate-spin" /> : pdfUrl ? <CheckCircle2 size={13} /> : <Upload size={13} />}
                  {pdfUploading ? "Uploading…" : pdfUrl ? "Uploaded — Replace" : "Upload PDF"}
                  <input type="file" accept="application/pdf" onChange={(e) => handleUpload(e, "pdf")} className="hidden" disabled={pdfUploading} />
                </label>
              </div>
              <div className="space-y-1">
                <FieldLabel hint="— optional">Preview PDF</FieldLabel>
                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-body font-semibold border transition-colors ${previewUrl ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-[#F7F5F2] border-[#E2DDD8] text-[#0a0a0a] hover:bg-[#EDE9E3]"}`}>
                  {previewUploading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[#aaa]/30 border-t-[#aaa] animate-spin" /> : previewUrl ? <CheckCircle2 size={13} /> : <Upload size={13} />}
                  {previewUploading ? "Uploading…" : previewUrl ? "Uploaded — Replace" : "Upload Preview"}
                  <input type="file" accept="application/pdf" onChange={(e) => handleUpload(e, "preview")} className="hidden" disabled={previewUploading} />
                </label>
              </div>
            </SectionCard>

            <SectionCard title="SEO">
              <div><FieldLabel>SEO Title</FieldLabel><input {...register("seoTitle")} className={inputCls} /></div>
              <div><FieldLabel>SEO Description</FieldLabel><textarea {...register("seoDescription")} rows={2} className={textareaCls} /></div>
              <div><FieldLabel hint="(comma-separated)">Keywords</FieldLabel><input {...register("seoKeywords")} className={inputCls} /></div>
            </SectionCard>

            <div className="flex items-center gap-3 pb-6">
              <button type="submit" disabled={saving || anyUploading}
                className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body font-bold text-[13px] uppercase tracking-[0.1em] px-6 py-3 rounded-xl hover:bg-[#203A2B] disabled:opacity-50 transition-colors">
                {saving ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <Link href={`/author/books/${id}`} className="inline-flex items-center font-body font-semibold text-[13px] text-[#888] hover:text-[#0a0a0a] px-4 py-3 rounded-xl hover:bg-[#EDE9E3] transition-colors">Cancel</Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
