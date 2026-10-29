"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { Settings, Info } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface HomepageSettings { heroHeadline?: string; heroSubtext?: string; }

const inputCls = "w-full border border-[#E9E7E2] rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10";

export default function AdminHomepagePage() {
  const [settings, setSettings] = useState<HomepageSettings>({});
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HomepageSettings>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((json) => {
      if (json.success && json.data?.homepageSettings) setSettings(json.data.homepageSettings);
    });
  }, []);

  const openModal = () => { setDraft(settings); setSuccess(false); setError(null); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ homepageSettings: draft }) });
      const json = await res.json();
      if (!json.success) throw new Error("Failed to save");
      setSettings(draft); setSuccess(true);
      setTimeout(() => setOpen(false), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  };

  return (
    <AdminShell
      title="Homepage Content"
      subtitle="Hero section and featured content"
      action={
        <AdminButton onClick={openModal} icon={<Settings />}>
          Edit Content
        </AdminButton>
      }
    >
      <div className="space-y-4 max-w-lg">
        <div className="bg-white border border-[#E9E7E2] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E9E7E2]">
            <h2 className="font-heading text-sm font-bold text-[#0a0a0a]">Hero Section</h2>
          </div>
          <div className="divide-y divide-[#F7F6F3]">
            <div className="px-5 py-4">
              <p className="text-[11px] font-body uppercase tracking-wider text-[#bbb] mb-1.5">Headline</p>
              <p className="text-sm font-body text-[#0a0a0a]">{settings.heroHeadline || <span className="text-[#ccc]">Default headline</span>}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[11px] font-body uppercase tracking-wider text-[#bbb] mb-1.5">Subtext</p>
              <p className="text-sm font-body text-[#0a0a0a]">{settings.heroSubtext || <span className="text-[#ccc]">Default subtext</span>}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#FAFAF9] border border-[#E9E7E2] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={13} className="text-[#789185]" />
            <p className="text-[11px] font-body font-semibold text-[#888] uppercase tracking-wider">Tips</p>
          </div>
          <ul className="text-xs font-body text-[#aaa] flex flex-col gap-1.5">
            <li>• Featured books are controlled via the Books section — mark books as &quot;Featured&quot;.</li>
            <li>• The author bio and photo are managed in the Author Profile section.</li>
            <li>• Categories shown on the homepage are those marked as &quot;Visible&quot;.</li>
          </ul>
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title="Edit Homepage Content">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Hero Headline</label>
            <input value={draft.heroHeadline ?? ""} onChange={(e) => setDraft((s) => ({ ...s, heroHeadline: e.target.value }))} placeholder="WHAT WILL YOU DISCOVER NEXT?" autoFocus className={inputCls} />
            <p className="text-xs text-[#bbb] mt-1">Leave blank to use the default.</p>
          </div>
          <div>
            <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Hero Subtext</label>
            <textarea value={draft.heroSubtext ?? ""} onChange={(e) => setDraft((s) => ({ ...s, heroSubtext: e.target.value }))} rows={3} placeholder="Explore new ideas, build useful skills..." className={`${inputCls} resize-none`} />
          </div>
          {success && <p className="text-xs text-emerald-600 font-body">Saved.</p>}
          {error && <p className="text-xs text-red-600 font-body">{error}</p>}
          <div className="flex gap-3 pt-1">
            <AdminButton type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" className="flex-1" loading={loading} loadingText="Saving…">
              Save Changes
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
