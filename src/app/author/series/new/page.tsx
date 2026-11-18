"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authorSeriesSchema, type AuthorSeriesInput } from "@/lib/validations";
import { ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const inputCls = "w-full bg-[#F7F5F2] border border-[#E2DDD8] px-4 py-3 text-[13px] font-body text-[#111] placeholder:text-[#C4BFB9] focus:outline-none focus:border-[#203A2B] focus:bg-white focus:ring-2 focus:ring-[#203A2B]/8 transition-all rounded-lg";

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

export default function NewSeriesPage() {
  const router = useRouter();
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUrl, setCoverUrl]         = useState<string | null>(null);
  const [coverPath, setCoverPath]       = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthorSeriesInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(authorSeriesSchema) as any,
  });

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCoverUploading(true); setError(null);
    try {
      const sigRes  = await fetch("/api/author/upload-signature", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cover" }),
      });
      const sigData = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigData.error ?? "Signature failed");
      const form = new FormData();
      form.append("file", file); form.append("api_key", sigData.apiKey);
      form.append("timestamp", sigData.timestamp); form.append("signature", sigData.signature);
      form.append("folder", sigData.folder); form.append("use_filename", "true");
      form.append("unique_filename", "true");
      const uploadRes  = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, { method: "POST", body: form });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message ?? "Upload failed");
      setCoverUrl(uploadData.secure_url as string);
      setCoverPath(uploadData.public_id as string);
    } catch (err) { setError(err instanceof Error ? err.message : "Cover upload failed"); }
    finally { setCoverUploading(false); }
  };

  const onSubmit = async (data: AuthorSeriesInput) => {
    setSaving(true); setError(null);
    try {
      const res  = await fetch("/api/author/series", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, coverImageUrl: coverUrl, coverImagePath: coverPath }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
      router.push("/author/series");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to create series"); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      <div className="shrink-0 bg-white border-b border-[#E8E4DE] px-5 sm:px-7 lg:px-8" style={{ minHeight: 64 }}>
        <div className="flex items-center gap-3 h-full py-3">
          <Link href="/author/series" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#999] hover:text-[#0a0a0a] hover:bg-[#F0EEE9] transition-all">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="font-heading text-[20px] sm:text-[23px] font-bold text-[#0a0a0a] leading-tight tracking-tight">New Series</h1>
            <p className="text-[12px] font-body text-[#a09c96]">Saved as draft — submit for owner review when ready</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-5">

          {error && <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <SectionCard title="Series Cover">
              <div className="flex items-center gap-5">
                <div className="shrink-0">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="Cover" className="w-24 h-32 object-cover rounded-xl border border-[#E8E4DE] shadow-sm" />
                  ) : (
                    <div className="w-24 h-32 rounded-xl bg-[#F7F5F2] border-2 border-dashed border-[#E2DDD8] flex flex-col items-center justify-center gap-1">
                      <Upload size={18} className="text-[#C4BFB9]" />
                      <span className="text-[9px] font-body text-[#C4BFB9] uppercase tracking-wider">Cover</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-[#F7F5F2] border border-[#E2DDD8] text-[#0a0a0a] font-body font-semibold text-[12.5px] px-4 py-2.5 rounded-lg hover:bg-[#EDE9E3] transition-colors">
                    {coverUploading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[#aaa]/30 border-t-[#aaa] animate-spin" /> : coverUrl ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Upload size={13} />}
                    {coverUploading ? "Uploading…" : coverUrl ? "Replace" : "Upload Cover"}
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={coverUploading} />
                  </label>
                  <p className="text-[11.5px] font-body text-[#b5b0a9]">Required before submission · Max 5 MB</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Series Details">
              <div>
                <FieldLabel>Series Name *</FieldLabel>
                <input {...register("name")} className={inputCls} placeholder="Enter series name" />
                {errors.name && <p className="text-[11px] font-body text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <FieldLabel hint="(URL-friendly)">Slug *</FieldLabel>
                <input {...register("slug")} className={`${inputCls} font-mono`} placeholder="my-series-name" />
                {errors.slug && <p className="text-[11px] font-body text-red-500 mt-1">{errors.slug.message}</p>}
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea {...register("description")} rows={4} className={`${inputCls} resize-none`} placeholder="Describe this series…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Genre</FieldLabel>
                  <input {...register("genre")} className={inputCls} placeholder="e.g. Fiction" />
                </div>
                <div>
                  <FieldLabel>Planned Books</FieldLabel>
                  <input {...register("plannedBooks", { valueAsNumber: true })} type="number" min="1" className={inputCls} placeholder="e.g. 3" />
                </div>
              </div>
            </SectionCard>

            <div className="flex items-center gap-3 pb-6">
              <button type="submit" disabled={saving || coverUploading}
                className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body font-bold text-[13px] uppercase tracking-[0.1em] px-6 py-3 rounded-xl hover:bg-[#203A2B] disabled:opacity-50 transition-colors">
                {saving ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
                {saving ? "Saving…" : "Save Draft"}
              </button>
              <Link href="/author/series" className="inline-flex items-center font-body font-semibold text-[13px] text-[#888] hover:text-[#0a0a0a] px-4 py-3 rounded-xl hover:bg-[#EDE9E3] transition-colors">Cancel</Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
