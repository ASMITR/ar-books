"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, type BookInput } from "@/lib/validations";
import type { Book, Category } from "@/types";
import { AlertCircle, CheckCircle2, Upload, X, FileText, ImageIcon } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";

// ─── Upload helper ────────────────────────────────────────────────────────────
async function uploadFile(file: File, type: "cover" | "pdf" | "preview") {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Upload failed");
  return json.data as { publicId: string; secureUrl: string };
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-[#E8E6E1] rounded-lg px-4 py-3 text-[14px] font-body text-[#0a0a0a] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";

const labelCls =
  "block text-[12px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-2";

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#F0EEE9] bg-[#FAFAF8]">
        <h2 className="font-heading text-[16px] font-bold text-[#0a0a0a] tracking-tight">{title}</h2>
      </div>
      <div className="p-6 flex flex-col gap-5">{children}</div>
    </div>
  );
}

// ─── File input ───────────────────────────────────────────────────────────────
// Uses a hidden <input> triggered by a button (not a label) to avoid
// accidental form submission. Shows filename once selected and never clears
// it when the file dialog is cancelled.
function FileInput({
  label,
  accept,
  currentPath,
  currentUrl,
  selectedFile,
  onChange,
  isUploading,
}: {
  label: string;
  accept: string;
  currentPath?: string;
  currentUrl?: string;
  selectedFile: File | null;
  onChange: (f: File) => void;
  isUploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = accept.includes("image");

  const handleClick = () => {
    // Reset value first so re-selecting same file fires onChange
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file); // only update when a file is actually picked
  };

  // Determine display info
  const hasNewFile = !!selectedFile;
  const hasExisting = !hasNewFile && (currentUrl || currentPath);

  return (
    <div>
      <p className={labelCls}>{label}</p>

      {/* Current / selected file preview */}
      {hasNewFile ? (
        <div className="flex items-center gap-2.5 mb-2.5 bg-[#F0F7F4] border border-[#c5ddd6] rounded-lg px-3 py-2">
          {isImage ? (
            <ImageIcon size={13} className="text-[#789185] shrink-0" />
          ) : (
            <FileText size={13} className="text-[#789185] shrink-0" />
          )}
          <span className="text-[12.5px] font-body text-[#3a6b5f] font-medium truncate flex-1">
            {selectedFile!.name}
          </span>
          <span className="text-[11px] font-body text-[#789185] shrink-0">
            {(selectedFile!.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
      ) : hasExisting ? (
        <div className="mb-2.5">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt={label}
              className="h-20 rounded-lg object-contain border border-[#E8E6E1]"
            />
          ) : (
            <div className="flex items-center gap-2 bg-[#F7F6F3] border border-[#E8E6E1] rounded-lg px-3 py-2">
              <FileText size={13} className="text-[#aaa] shrink-0" />
              <span className="text-[12px] font-body text-[#888] truncate">{currentPath}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Hidden native input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {/* Trigger button — type="button" prevents form submit */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className="flex items-center gap-2.5 w-full border border-dashed border-[#D8D5CF] rounded-lg px-4 py-3 hover:border-[#789185] hover:bg-[#F7F6F3] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <span className="w-3.5 h-3.5 border-2 border-[#789185]/30 border-t-[#789185] rounded-full animate-spin shrink-0" />
        ) : (
          <Upload size={14} className="text-[#bbb] group-hover:text-[#789185] transition-colors shrink-0" />
        )}
        <span className="text-[13px] font-body text-[#aaa] group-hover:text-[#789185] transition-colors">
          {isUploading
            ? "Uploading…"
            : hasNewFile || hasExisting
            ? "Replace file…"
            : "Choose file…"}
        </span>
      </button>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  book?: Book;
  categories: Category[];
  onSuccess?: () => void;
}

// ─── Upload status per file slot ─────────────────────────────────────────────
type UploadStatus = "idle" | "uploading" | "done" | "error";

// ─── Main form ────────────────────────────────────────────────────────────────
export function BookForm({ book, categories, onSuccess }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Per-file upload status shown during save
  const [uploadStatus, setUploadStatus] = useState<{
    cover: UploadStatus;
    pdf: UploadStatus;
    preview: UploadStatus;
  }>({ cover: "idle", pdf: "idle", preview: "idle" });

  const isEdit = !!book;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookInput, unknown, BookInput>({
    resolver: zodResolver(bookSchema) as Resolver<BookInput>,
    defaultValues: book
      ? {
          title: book.title,
          slug: book.slug,
          subtitle: book.subtitle ?? "",
          description: book.description,
          pricePaise: book.pricePaise,
          originalPricePaise: book.originalPricePaise,
          categoryIds: book.categoryIds,
          pageCount: book.pageCount,
          language: book.language,
          published: book.published,
          featured: book.featured,
          seoTitle: book.seoTitle ?? "",
          seoDescription: book.seoDescription ?? "",
        }
      : { language: "English", published: false, featured: false, categoryIds: [] },
  });

  const title = watch("title");

  const autoSlug = () => {
    if (!isEdit && title) {
      setValue(
        "slug",
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      );
    }
  };

  const onSubmit = async (data: BookInput) => {
    setLoading(true);
    setError(null);
    setUploadStatus({ cover: "idle", pdf: "idle", preview: "idle" });

    try {
      const extra: Record<string, string> = {};

      // Upload cover image
      if (coverFile) {
        setUploadStatus((s) => ({ ...s, cover: "uploading" }));
        try {
          const r = await uploadFile(coverFile, "cover");
          extra.coverImageUrl = r.secureUrl;
          extra.coverImagePath = r.publicId;
          setUploadStatus((s) => ({ ...s, cover: "done" }));
        } catch (err) {
          setUploadStatus((s) => ({ ...s, cover: "error" }));
          throw new Error(`Cover image upload failed: ${err instanceof Error ? err.message : "unknown error"}`);
        }
      }

      // Upload private PDF
      if (pdfFile) {
        setUploadStatus((s) => ({ ...s, pdf: "uploading" }));
        try {
          const r = await uploadFile(pdfFile, "pdf");
          extra.privatePdfPath = r.publicId;
          setUploadStatus((s) => ({ ...s, pdf: "done" }));
        } catch (err) {
          setUploadStatus((s) => ({ ...s, pdf: "error" }));
          throw new Error(`Private PDF upload failed: ${err instanceof Error ? err.message : "unknown error"}`);
        }
      }

      // Upload preview PDF
      if (previewFile) {
        setUploadStatus((s) => ({ ...s, preview: "uploading" }));
        try {
          const r = await uploadFile(previewFile, "preview");
          extra.previewPdfPath = r.publicId;
          setUploadStatus((s) => ({ ...s, preview: "done" }));
        } catch (err) {
          setUploadStatus((s) => ({ ...s, preview: "error" }));
          throw new Error(`Preview PDF upload failed: ${err instanceof Error ? err.message : "unknown error"}`);
        }
      }

      // Save book record
      const url = isEdit ? `/api/admin/books/${book!.id}` : "/api/admin/books";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...extra }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(
          typeof json.error === "string"
            ? json.error
            : JSON.stringify(json.error) ?? "Failed to save book",
        );
      }

      if (onSuccess) {
        onSuccess();
        router.refresh();
      } else {
        router.push("/admin/books");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Upload status badge helper
  const statusIcon = (s: UploadStatus) => {
    if (s === "uploading") return <span className="w-3 h-3 border-2 border-[#789185]/30 border-t-[#789185] rounded-full animate-spin" />;
    if (s === "done") return <CheckCircle2 size={13} className="text-emerald-500" />;
    if (s === "error") return <X size={13} className="text-red-500" />;
    return null;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-2xl">

      {/* ── Book Details ── */}
      <SectionCard title="Book Details">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            {...register("title")}
            onBlur={autoSlug}
            placeholder="Enter book title"
            className={inputCls}
          />
          {errors.title && (
            <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5">
              <AlertCircle size={13} />{errors.title.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Slug *</label>
            <input {...register("slug")} placeholder="book-url-slug" className={inputCls} />
            {errors.slug && (
              <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5">
                <AlertCircle size={13} />{errors.slug.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelCls}>Subtitle</label>
            <input {...register("subtitle")} placeholder="Optional subtitle" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description *</label>
          <textarea
            {...register("description")}
            rows={5}
            placeholder="Write a compelling book description…"
            className={inputCls + " resize-none"}
          />
          {errors.description && (
            <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5">
              <AlertCircle size={13} />{errors.description.message}
            </p>
          )}
        </div>
      </SectionCard>

      {/* ── Pricing ── */}
      <SectionCard title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Price (paise) *</label>
            <input
              {...register("pricePaise", { valueAsNumber: true })}
              type="number"
              placeholder="49900 = ₹499"
              className={inputCls}
            />
            {errors.pricePaise && (
              <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5">
                <AlertCircle size={13} />{errors.pricePaise.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelCls}>Original Price (paise)</label>
            <input
              {...register("originalPricePaise", { valueAsNumber: true })}
              type="number"
              placeholder="Optional MRP"
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Categories & Details ── */}
      <SectionCard title="Categories & Details">
        <div>
          <label className={labelCls}>Categories *</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 cursor-pointer bg-[#F7F6F3] hover:bg-[#F0EEE9] border border-[#E8E6E1] rounded-lg px-3.5 py-2.5 transition-colors"
              >
                <input
                  type="checkbox"
                  value={cat.id}
                  {...register("categoryIds")}
                  className="accent-[#789185] w-4 h-4"
                />
                <span className="text-[13.5px] font-body text-[#444]">{cat.name}</span>
              </label>
            ))}
          </div>
          {errors.categoryIds && (
            <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5">
              <AlertCircle size={13} />{errors.categoryIds.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Page Count</label>
            <input
              {...register("pageCount", { valueAsNumber: true })}
              type="number"
              placeholder="e.g. 240"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Language</label>
            <input {...register("language")} placeholder="English" className={inputCls} />
          </div>
        </div>

        <div className="flex gap-5 pt-1">
          {[
            { field: "published" as const, label: "Published" },
            { field: "featured" as const, label: "Featured on Homepage" },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                {...register(field)}
                className="accent-[#789185] w-4 h-4 rounded"
              />
              <span className="text-[14px] font-body text-[#555] group-hover:text-[#0a0a0a] transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* ── Files ── */}
      <SectionCard title="Files">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <FileInput
                label="Cover Image"
                accept="image/*"
                currentUrl={!coverFile ? book?.coverImageUrl : undefined}
                selectedFile={coverFile}
                onChange={setCoverFile}
                isUploading={uploadStatus.cover === "uploading"}
              />
            </div>
            <div className="mt-8 shrink-0">{statusIcon(uploadStatus.cover)}</div>
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <FileInput
                label="Private PDF"
                accept="application/pdf"
                currentPath={!pdfFile ? book?.privatePdfPath : undefined}
                selectedFile={pdfFile}
                onChange={setPdfFile}
                isUploading={uploadStatus.pdf === "uploading"}
              />
            </div>
            <div className="mt-8 shrink-0">{statusIcon(uploadStatus.pdf)}</div>
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <FileInput
                label="Preview PDF"
                accept="application/pdf"
                currentPath={!previewFile ? book?.previewPdfPath : undefined}
                selectedFile={previewFile}
                onChange={setPreviewFile}
                isUploading={uploadStatus.preview === "uploading"}
              />
            </div>
            <div className="mt-8 shrink-0">{statusIcon(uploadStatus.preview)}</div>
          </div>
        </div>

        {(coverFile || pdfFile || previewFile) && (
          <p className="text-[11.5px] font-body text-[#b0aca6] mt-1">
            Files will be uploaded when you save the book.
          </p>
        )}
      </SectionCard>

      {/* ── SEO ── */}
      <SectionCard title="SEO">
        <div>
          <label className={labelCls}>SEO Title</label>
          <input
            {...register("seoTitle")}
            placeholder="Custom page title for search engines"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>SEO Description</label>
          <textarea
            {...register("seoDescription")}
            rows={2}
            placeholder="Meta description (150–160 chars)"
            className={inputCls + " resize-none"}
          />
        </div>
      </SectionCard>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-[13.5px] font-body p-4 rounded-xl">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3 pb-2">
        <AdminButton
          type="submit"
          variant="dark"
          loading={loading}
          loadingText={
            uploadStatus.cover === "uploading"
              ? "Uploading cover…"
              : uploadStatus.pdf === "uploading"
              ? "Uploading PDF…"
              : uploadStatus.preview === "uploading"
              ? "Uploading preview…"
              : "Saving…"
          }
          icon={<CheckCircle2 />}
        >
          {isEdit ? "Save Changes" : "Create Book"}
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => (onSuccess ? onSuccess() : router.push("/admin/books"))}
        >
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
