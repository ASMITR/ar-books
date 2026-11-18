"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authorSeriesSchema, type AuthorSeriesInput } from "@/lib/validations";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";

export default function NewSeriesPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPath, setCoverPath] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthorSeriesInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(authorSeriesSchema) as any,
  });

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const sigRes = await fetch("/api/author/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cover" }),
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
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message ?? "Upload failed");

      setCoverUrl(uploadData.secure_url as string);
      setCoverPath(uploadData.public_id as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
    } finally {
      setCoverUploading(false);
    }
  };

  const onSubmit = async (data: AuthorSeriesInput) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/author/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coverImageUrl: coverUrl,
          coverImagePath: coverPath,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
      router.push("/author/series");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create series");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/author/series" className="p-2 rounded-lg hover:bg-[#F0EDE7] transition-colors">
          <ArrowLeft size={16} className="text-[#666]" />
        </Link>
        <div>
          <h1 className="text-xl font-heading font-bold text-[#080808]">Create New Series</h1>
          <p className="text-xs text-[#888] mt-0.5">Your series will be saved as a draft. Submit it for owner review when ready.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Cover */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5">
          <h2 className="font-semibold text-sm text-[#080808] mb-4">Series Cover</h2>
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
              <p className="text-xs text-[#999] mt-1.5">Required before submission. JPG, PNG, WEBP. Max 5MB.</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#080808]">Series Details</h2>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Series Name *</label>
            <input {...register("name")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="Enter series name" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Slug * <span className="text-[#999] font-normal">(URL-friendly)</span></label>
            <input {...register("slug")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm font-mono focus:outline-none" placeholder="my-series-name" />
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1.5">Description</label>
            <textarea {...register("description")} rows={4} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm resize-none focus:outline-none" placeholder="Describe the series…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Genre</label>
              <input {...register("genre")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" placeholder="e.g. Fiction" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Planned Books</label>
              <input {...register("plannedBooks", { valueAsNumber: true })} type="number" min="1" className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none" placeholder="e.g. 3" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-4">
          <button type="submit" disabled={saving || coverUploading} className="flex items-center gap-2 bg-[#080808] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#111] disabled:opacity-50 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <Link href="/author/series" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#666] hover:bg-[#F0EDE7] transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
