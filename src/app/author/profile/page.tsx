"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import type { AuthorProfile } from "@/types";

export default function AuthorProfilePage() {
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Partial<AuthorProfile>>();

  useEffect(() => {
    fetch("/api/author/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setProfile(json.data);
          reset(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: Partial<AuthorProfile>) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/author/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#080808]">My Profile</h1>
        <p className="text-sm text-[#888] mt-1">Update your author bio and public information.</p>
      </div>

      <div className="bg-white border border-[#E6E3DD] rounded-xl p-5">
        <div className="mb-4 p-3 bg-[#F4F2EE] rounded-lg">
          <p className="text-xs text-[#666]">Email: <span className="font-medium text-[#080808]">{profile?.email}</span></p>
          <p className="text-xs text-[#666] mt-0.5">Institution: <span className="font-medium text-[#080808]">{profile?.institution ?? "—"}</span></p>
          <p className="text-xs text-[#666] mt-0.5">Status: <span className={`font-medium ${profile?.accountStatus === "active" ? "text-green-600" : "text-red-600"}`}>{profile?.accountStatus}</span></p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">Profile updated successfully.</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#E6E3DD] rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#555] mb-1.5">Display Name</label>
          <input {...register("displayName")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#555] mb-1.5">Bio</label>
          <textarea {...register("bio")} rows={4} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="A short author bio…" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#555] mb-1.5">Website</label>
          <input {...register("website")} type="url" className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="https://yoursite.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#555] mb-1.5">Institution / College</label>
          <input {...register("institution")} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#080808] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#111] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
