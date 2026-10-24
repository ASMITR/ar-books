"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName ?? "");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile(user, { displayName: name });
      setSuccess(true);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-4xl font-bold text-[#080808]">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E9E7E2] p-6 flex flex-col gap-5 max-w-lg">
        <div>
          <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
          />
        </div>
        <div>
          <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Email</label>
          <input
            value={user?.email ?? ""}
            disabled
            className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body bg-[#FAF9F6] text-[#777777] cursor-not-allowed"
          />
          <p className="text-xs text-[#777777] mt-1">Email cannot be changed here.</p>
        </div>

        {success && <p className="text-sm text-green-600 font-body">Profile updated successfully.</p>}
        {error && <p className="text-sm text-[#F12F43] font-body">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#789185] transition-colors disabled:opacity-60 w-fit"
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
