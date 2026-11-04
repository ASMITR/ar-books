"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { User, Mail, Check, X, Loader2 } from "lucide-react";

const inputCls = "w-full bg-[#F5F2EE] border border-black/[0.08] px-4 py-3 text-[13.5px] font-body text-[#111] placeholder:text-[#C0BBB3] focus:outline-none focus:border-[#203A2B] focus:bg-white focus:ring-2 focus:ring-[#203A2B]/8 transition-all rounded-xl";

export default function ProfilePage() {
  const { user }              = useAuth();
  const [name, setName]       = useState(user?.displayName ?? "");
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initials = (user?.displayName ?? user?.email ?? "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true); setError(null); setSuccess(false);
    try {
      await updateProfile(user, { displayName: name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.28em] text-[#B8B3AB] mb-1.5">Account</p>
        <h1 className="font-heading text-[28px] sm:text-[32px] font-bold text-[#111] leading-none">Profile Settings</h1>
      </div>

      <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden w-full max-w-lg">

        {/* Avatar row */}
        <div className="px-5 sm:px-6 py-5 border-b border-black/[0.05] flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0D1F17] border-2 border-[#FFC928]/20 flex items-center justify-center shrink-0">
            <span className="font-heading text-base sm:text-lg font-bold text-[#FFC928]">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-body text-[14px] font-semibold text-[#111] truncate">{user?.displayName ?? "—"}</p>
            <p className="font-body text-[12px] text-[#B8B3AB] truncate">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#999]">Full Name</label>
            <div className="relative">
              <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C0BBB3] pointer-events-none" />
              <input value={name} onChange={(e) => setName(e.target.value)}
                className={`${inputCls} pl-9`} placeholder="Your full name" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#999]">Email Address</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C0BBB3] pointer-events-none" />
              <input value={user?.email ?? ""} disabled
                className="w-full bg-[#F5F2EE] border border-black/[0.06] pl-9 pr-4 py-3 text-[13.5px] font-body text-[#B8B3AB] rounded-xl cursor-not-allowed" />
            </div>
            <p className="text-[11px] font-body text-[#B8B3AB]">Email cannot be changed here.</p>
          </div>

          {success && (
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200/80 px-4 py-3 rounded-xl">
              <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
              <p className="text-[12px] font-body text-emerald-700">Profile updated successfully.</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200/80 px-4 py-3 rounded-xl">
              <X size={14} className="text-red-500 shrink-0" />
              <p className="text-[12px] font-body text-red-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full sm:w-fit inline-flex items-center justify-center gap-2 bg-[#0D1F17] text-white font-body text-[11.5px] font-bold uppercase tracking-[0.12em] px-6 py-3 rounded-xl hover:bg-[#203A2B] transition-colors disabled:opacity-50">
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
