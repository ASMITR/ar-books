"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, type BookInput } from "@/lib/validations";
import type { Book, Category } from "@/types";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";

async function uploadFile(file: File, type: "cover" | "pdf" | "preview") {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Upload failed");
  return json.data as { publicId: string; secureUrl: string };
}

interface Props {
  book?: Book;
  categories: Category[];
  onSuccess?: () => void;
}

const inputCls =
  "w-full border border-[#E8E6E1] rounded-lg px-4 py-3 text-[14px] font-body text-[#0a0a0a] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-3 focus:ring-[#789185]/10 transition-all";

const labelCls = "block text-[12px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-2";

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

function FileInput({
  label,
  accept,
  currentPath,
  currentUrl,
  onChange,
}: {
  label: string;
  accept: string;
  currentPath?: string;
  currentUrl?: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="cover" className="h-20 mb-2 rounded-lg object-contain border border-[#E8E6E1]" />
      )}
      {currentPath && !currentUrl && (
        <p className="text-[13px] text-[#9e9a94] mb-2 font-body truncate">{currentPath}</p>
      )}
      <label className="flex items-center gap-3 cursor-pointer border border-dashed border-[#D8D5CF] rounded-lg px-4 py-3.5 hover:border-[#789185] hover:bg-[#F7F6F3] transition-all group">
        <Upload size={15} className="text-[#bbb] group-hover:text-[#789185] transition-colors shrink-0" />
        <span className="text-[13px] font-body text-[#aaa] group-hover:text-[#789185] transition-colors">
          Choose file…
        </span>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

export function BookForm({ book, categories, onSuccess }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const isEdit = !!book;

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<BookInput, unknown, BookInput>({
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
      setValue("slug", title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const onSubmit = async (data: BookInput) => {
    setLoading(true);
    setError(null);
    try {
      const extra: Record<string, string> = {};
      if (coverFile) {
        const r = await uploadFile(coverFile, "cover");
        extra.coverImageUrl = r.secureUrl;
        extra.coverImagePath = r.publicId;
      }
      if (pdfFile) {
        const r = await uploadFile(pdfFile, "pdf");
        extra.privatePdfPath = r.publicId;
      }
      if (previewFile) {
        const r = await uploadFile(previewFile, "preview");
        extra.previewPdfPath = r.publicId;
      }

      const url = isEdit ? `/api/admin/books/${book!.id}` : "/api/admin/books";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...extra }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save book");
      if (onSuccess) { onSuccess(); router.refresh(); }
      else { router.push("/admin/books"); router.refresh(); }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-2xl">

      <SectionCard title="Book Details">
        <div>
          <label className={labelCls}>Title *</label>
          <input {...register("title")} onBlur={autoSlug} placeholder="Enter book title" className={inputCls} />
          {errors.title && <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5"><AlertCircle size={13} />{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Slug *</label>
            <input {...register("slug")} placeholder="book-url-slug" className={inputCls} />
            {errors.slug && <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5"><AlertCircle size={13} />{errors.slug.message}</p>}
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
          {errors.description && <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5"><AlertCircle size={13} />{errors.description.message}</p>}
        </div>
      </SectionCard>

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
            {errors.pricePaise && <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5"><AlertCircle size={13} />{errors.pricePaise.message}</p>}
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

      <SectionCard title="Categories & Details">
        <div>
          <label className={labelCls}>Categories *</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer bg-[#F7F6F3] hover:bg-[#F0EEE9] border border-[#E8E6E1] rounded-lg px-3.5 py-2.5 transition-colors">
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
          {errors.categoryIds && <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1.5"><AlertCircle size={13} />{errors.categoryIds.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Page Count</label>
            <input {...register("pageCount", { valueAsNumber: true })} type="number" placeholder="e.g. 240" className={inputCls} />
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
              <span className="text-[14px] font-body text-[#555] group-hover:text-[#0a0a0a] transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Files">
        <FileInput
          label="Cover Image"
          accept="image/*"
          currentUrl={!coverFile ? book?.coverImageUrl : undefined}
          onChange={setCoverFile}
        />
        <FileInput
          label="Private PDF"
          accept="application/pdf"
          currentPath={!pdfFile ? book?.privatePdfPath : undefined}
          onChange={setPdfFile}
        />
        <FileInput
          label="Preview PDF"
          accept="application/pdf"
          currentPath={!previewFile ? book?.previewPdfPath : undefined}
          onChange={setPreviewFile}
        />
      </SectionCard>

      <SectionCard title="SEO">
        <div>
          <label className={labelCls}>SEO Title</label>
          <input {...register("seoTitle")} placeholder="Custom page title for search engines" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>SEO Description</label>
          <textarea {...register("seoDescription")} rows={2} placeholder="Meta description (150–160 chars)" className={inputCls + " resize-none"} />
        </div>
      </SectionCard>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-[13.5px] font-body p-4 rounded-xl">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pb-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-[#0a0a0a] text-white font-body text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </span>
          ) : (
            <>
              <CheckCircle2 size={15} />
              {isEdit ? "Save Changes" : "Create Book"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onSuccess ? onSuccess() : router.push("/admin/books")}
          className="border border-[#E8E6E1] text-[#666] font-body text-[14px] font-medium px-5 py-3 rounded-lg hover:bg-[#F7F6F3] hover:border-[#D0CEC9] transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
