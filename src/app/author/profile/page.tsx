"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, User } from "lucide-react";
import type { AuthorProfile } from "@/types";
import { AuthorShell } from "@/components/author/AuthorShell";

const inputCls = "w-full bg-[#F7F5F2] border border-[#E2DDD8] px-4 py-3 text-[13px] font-body text-[#111] placeholder:text-[#C4BFB9] focus:outline-none focus:border-[#203A2B] focus:bg-white focus:ring-2 focus:ring-[#203A2B]/8 transition-all rounded-lg";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">{children}</label>;
}

export default function AuthorProfilePage() {
  const [profile, setProfile]   = useState<AuthorProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Partial<AuthorProfile>>();

  useEffect(() => {
    fetch("/api/author/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) { setProfile(json.data); reset(json.data); }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: Partial<AuthorProfile>) => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      const res  = await fetch("/api/author/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSaving(false); }
  };

  return (
    <AuthorShell title="My Profile" subtitle="Update your author bio and public information">
      <div className="max-w-xl space-y-5">

        {/* Account info card */}
        {!loading && profile && (
          <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 shadow-sm">
            <p className="text-[10.5px] font-body font-semibold uppercase tracking-[0.09em] text-[#b5b0a9] mb-4">Account Info</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFC928]/20 flex items-center justify-center shrink-0">
                <User size={20} className="text-[#0D1F17]" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13.5px] font-body font-semibold text-[#0a0a0a]">{profile.email}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10.5px] rounded-full font-semibold font-body ring-1 ${
                    profile.accountStatus === "active"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-red-50 text-red-700 ring-red-200"
                  }`}>
                    {profile.accountStatus}
                  </span>
                </div>
                {profile.institution && (
                  <p className="text-[12px] font-body text-[#999]">{profile.institution}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F2F0EC]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-[#F2F0EC] rounded w-40" />
                <div className="h-3 bg-[#F2F0EC] rounded w-24" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-emerald-700">
            Profile updated successfully.
          </div>
        )}

        {/* Edit form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#E8E4DE] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[#EDE9E3]">
            <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a]">Edit Profile</h2>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <FieldLabel>Display Name</FieldLabel>
              <input {...register("displayName")} className={inputCls} placeholder="Your full name" />
            </div>

            <div>
              <FieldLabel>Bio</FieldLabel>
              <textarea
                {...register("bio")}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="A short author bio for your public profile…"
              />
            </div>

            <div>
              <FieldLabel>Website</FieldLabel>
              <input
                {...register("website")}
                type="url"
                className={inputCls}
                placeholder="https://yoursite.com"
              />
            </div>

            <div>
              <FieldLabel>Institution / College</FieldLabel>
              <input {...register("institution")} className={inputCls} />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body font-bold text-[13px] uppercase tracking-[0.1em] px-6 py-3 rounded-xl hover:bg-[#203A2B] disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </div>
        </form>

      </div>
    </AuthorShell>
  );
}
