"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { User, Mail, Check, X, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user }          = useAuth();
  const [name, setName]   = useState(user?.displayName ?? "");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initials = (user?.displayName ?? user?.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile(user, { displayName: name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Account</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808] leading-none">Profile Settings</h1>
      </div>

      {/* ── Avatar + form card ──────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6DFD5] max-w-lg">

        {/* Avatar row */}
        <div className="px-6 py-5 border-b border-[#E6DFD5] flex items-center gap-4">
          <div className="w-14 h-14 bg-[#203A2B] flex items-center justify-center shrink-0">
            <span className="font-heading text-lg font-bold text-[#FFC928]">{initials}</span>
          </div>
          <div>
            <p className="font-body text-[13px] font-semibold text-[#080808]">
              {user?.displayName ?? "—"}
            </p>
            <p className="font-body text-[11px] text-[#A8B5A0]">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

          {/* Name field */}
          <div>
            <label className="block text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccc] pointer-events-none" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#E6DFD5] pl-9 pr-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185] bg-white transition-colors"
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Email field — read only */}
          <div>
            <label className="block text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccc] pointer-events-none" />
              <input
                value={user?.email ?? ""}
                disabled
                className="w-full border border-[#F0EEE9] pl-9 pr-4 py-3 text-sm font-body bg-[#FAF9F6] text-[#A8B5A0] cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] font-body text-[#A8B5A0] mt-1.5">
              Email cannot be changed here.
            </p>
          </div>

          {/* Feedback messages */}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5">
              <Check size={13} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
              <p className="text-[12px] font-body text-emerald-700">Profile updated successfully.</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2.5">
              <X size={13} className="text-[#F12F43] shrink-0" />
              <p className="text-[12px] font-body text-[#F12F43]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3 hover:bg-[#315B55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

    </div>
  );
}
