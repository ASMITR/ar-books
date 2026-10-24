"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { User } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface AuthorProfile { authorBio?: string; authorPhotoUrl?: string; }

const inputCls = "w-full border border-[#E9E7E2] rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AuthorProfile>({});
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AuthorProfile>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((json) => {
      if (json.success) setProfile({ authorBio: json.data?.authorBio ?? "", authorPhotoUrl: json.data?.authorPhotoUrl ?? "" });
    });
  }, []);

  const openModal = () => { setDraft(profile); setSuccess(false); setError(null); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const json = await res.json();
      if (!json.success) throw new Error("Failed to save");
      setProfile(draft); setSuccess(true);
      setTimeout(() => setOpen(false), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  };

  return (
    <AdminShell
      title="Author Profile"
      subtitle="Bio and photo shown on About page and homepage"
      action={
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-[#0a0a0a] text-white text-xs font-body font-medium px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors"
        >
          <User size={13} />
          Edit Profile
        </button>
      }
    >
      <div className="bg-white border border-[#E9E7E2] rounded-xl overflow-hidden max-w-lg">
        <div className="px-5 py-4 border-b border-[#E9E7E2]">
          <h2 className="font-heading text-sm font-bold text-[#0a0a0a]">Profile Details</h2>
        </div>
        <div className="p-5 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            {profile.authorPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.authorPhotoUrl} alt="Author" className="w-14 h-14 rounded-full object-cover border-2 border-[#E9E7E2] shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#F5F4F0] border-2 border-[#E9E7E2] flex items-center justify-center shrink-0">
                <User size={20} className="text-[#ddd]" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-body uppercase tracking-wider text-[#bbb] mb-1">Photo URL</p>
              <p className="text-xs font-body text-[#666] break-all">{profile.authorPhotoUrl || <span className="text-[#ccc]">Not set</span>}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-body uppercase tracking-wider text-[#bbb] mb-2">Bio</p>
            <p className="text-sm font-body text-[#555] leading-relaxed whitespace-pre-wrap">
              {profile.authorBio || <span className="text-[#ccc]">No bio set yet.</span>}
            </p>
          </div>
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title="Edit Author Profile">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Author Bio</label>
                <textarea value={draft.authorBio ?? ""} onChange={(e) => setDraft((p) => ({ ...p, authorBio: e.target.value }))} rows={6} autoFocus placeholder="Write a short biography..." className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Author Photo URL</label>
                <input value={draft.authorPhotoUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, authorPhotoUrl: e.target.value }))} placeholder="https://..." className={inputCls} />
                <p className="text-xs text-[#bbb] mt-1">Upload to Firebase Storage and paste the public URL.</p>
              </div>
              {success && <p className="text-xs text-emerald-600 font-body">Profile saved.</p>}
              {error && <p className="text-xs text-red-600 font-body">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-[#E9E7E2] text-[#666] font-body text-sm px-4 py-2.5 rounded-lg hover:bg-[#FAFAF9] transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#0a0a0a] text-white font-body text-sm px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50">{loading ? "Saving…" : "Save Profile"}</button>
              </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
