"use client";

import { useState, useEffect, useRef } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import {
  Store, Home, User, CheckCircle2, AlertCircle, Upload,
} from "lucide-react";

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-[#E6E3DD] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#080808] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls =
  "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SiteData {
  // Store
  storeName?: string;
  supportEmail?: string;
  currency?: string;
  taxPercent?: number;
  // Homepage
  homepageSettings?: { heroHeadline?: string; heroSubtext?: string };
  // Profile
  authorBio?: string;
  authorPhotoUrl?: string;
}

type Tab = "store" | "homepage" | "profile";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "store",    label: "Store",    icon: Store },
  { id: "homepage", label: "Homepage", icon: Home  },
  { id: "profile",  label: "Profile",  icon: User  },
];

// ─── Inline save banner ───────────────────────────────────────────────────────
function SaveBanner({ success, error }: { success: boolean; error: string | null }) {
  if (!success && !error) return null;
  if (success)
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-700 font-body bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
        <CheckCircle2 size={13} className="shrink-0" /> Saved successfully.
      </div>
    );
  return (
    <div className="flex items-center gap-2 text-xs text-red-600 font-body bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
      <AlertCircle size={13} className="shrink-0" /> {error}
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-[#EDE9E3] bg-[#FAF9F6]">
        <h3 className="font-heading text-[13px] font-bold text-[#080808] tracking-tight">{title}</h3>
      </div>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminSitePage() {
  const [tab, setTab] = useState<Tab>("store");
  const [data, setData] = useState<SiteData>({});

  // per-tab save states
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // local draft for the active tab
  const [storeDraft,    setStoreDraft]    = useState<SiteData>({});
  const [homepageDraft, setHomepageDraft] = useState<{ heroHeadline?: string; heroSubtext?: string }>({});
  const [profileDraft,  setProfileDraft]  = useState<{ authorBio?: string; authorPhotoUrl?: string }>({});

  // photo upload
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load everything once
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const d: SiteData = json.data ?? {};
        setData(d);
        setStoreDraft({
          storeName:    d.storeName,
          supportEmail: d.supportEmail,
          currency:     d.currency,
          taxPercent:   d.taxPercent,
        });
        setHomepageDraft(d.homepageSettings ?? {});
        setProfileDraft({
          authorBio:      d.authorBio,
          authorPhotoUrl: d.authorPhotoUrl,
        });
      });
  }, []);

  // Reset banner when switching tabs
  const switchTab = (t: Tab) => { setTab(t); setSuccess(false); setError(null); };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (payload: Partial<SiteData>) => {
    setSaving(true); setSuccess(false); setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error("Failed to save");
      setData((prev) => ({ ...prev, ...payload }));
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "cover");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) throw new Error("Upload failed");
      setProfileDraft((p) => ({ ...p, authorPhotoUrl: json.data.secureUrl }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminShell title="Site Settings" subtitle="Manage store, homepage, and author profile">

      {/* ── Tab bar ── */}
      <div className="flex gap-1 p-1 bg-white border border-[#E6E3DD] rounded-xl shadow-sm w-fit mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-body font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#FFC928]/50 ${
              tab === id
                ? "bg-[#FFC928] text-[#080808] shadow-sm"
                : "text-[#888] hover:text-[#444] hover:bg-[#F5F4F0]"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Store tab ── */}
      {tab === "store" && (
        <form
          className="max-w-lg flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave({
              storeName:    storeDraft.storeName,
              supportEmail: storeDraft.supportEmail,
              currency:     storeDraft.currency,
              taxPercent:   storeDraft.taxPercent,
            });
          }}
        >
          <SectionCard title="General">
            <div>
              <label className={labelCls}>Store Name</label>
              <input
                type="text"
                value={storeDraft.storeName ?? ""}
                onChange={(e) => setStoreDraft((s) => ({ ...s, storeName: e.target.value }))}
                placeholder="AR Books"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Support Email</label>
              <input
                type="email"
                value={storeDraft.supportEmail ?? ""}
                onChange={(e) => setStoreDraft((s) => ({ ...s, supportEmail: e.target.value }))}
                placeholder="support@arbooks.in"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Currency</label>
                <input
                  type="text"
                  value={storeDraft.currency ?? ""}
                  onChange={(e) => setStoreDraft((s) => ({ ...s, currency: e.target.value }))}
                  placeholder="INR"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Tax Percent</label>
                <input
                  type="number"
                  value={storeDraft.taxPercent ?? ""}
                  onChange={(e) => setStoreDraft((s) => ({ ...s, taxPercent: parseFloat(e.target.value) }))}
                  placeholder="0"
                  min="0"
                  className={inputCls}
                />
              </div>
            </div>
            <p className="text-[11.5px] font-body text-[#b0aca6] leading-relaxed">
              Tax percent is applied to order totals. Set to 0 if prices are already tax-inclusive.
            </p>
          </SectionCard>

          <SaveBanner success={success} error={error} />

          <AdminButton type="submit" loading={saving} loadingText="Saving…" className="self-start">
            Save Store Settings
          </AdminButton>
        </form>
      )}

      {/* ── Homepage tab ── */}
      {tab === "homepage" && (
        <form
          className="max-w-lg flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave({ homepageSettings: homepageDraft });
          }}
        >
          <SectionCard title="Hero Section">
            <div>
              <label className={labelCls}>Headline</label>
              <input
                value={homepageDraft.heroHeadline ?? ""}
                onChange={(e) => setHomepageDraft((s) => ({ ...s, heroHeadline: e.target.value }))}
                placeholder="WHAT WILL YOU DISCOVER NEXT?"
                className={inputCls}
              />
              <p className="text-[11px] text-[#c0bdb8] mt-1.5 font-body">Leave blank to use the default.</p>
            </div>
            <div>
              <label className={labelCls}>Subtext</label>
              <textarea
                value={homepageDraft.heroSubtext ?? ""}
                onChange={(e) => setHomepageDraft((s) => ({ ...s, heroSubtext: e.target.value }))}
                rows={3}
                placeholder="Explore new ideas, build useful skills..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </SectionCard>

          <div className="bg-[#FAF9F6] border border-[#E6E3DD] rounded-xl p-4">
            <p className="text-[11.5px] font-body font-semibold text-[#b0aca6] uppercase tracking-wider mb-2">Tips</p>
            <ul className="text-xs font-body text-[#bbb] flex flex-col gap-1.5">
              <li>• Featured books are set in the Books section — mark a book as &quot;Featured&quot;.</li>
              <li>• Categories shown on homepage are those marked as &quot;Visible&quot;.</li>
            </ul>
          </div>

          <SaveBanner success={success} error={error} />

          <AdminButton type="submit" loading={saving} loadingText="Saving…" className="self-start">
            Save Homepage
          </AdminButton>
        </form>
      )}

      {/* ── Profile tab ── */}
      {tab === "profile" && (
        <form
          className="max-w-lg flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(profileDraft);
          }}
        >
          <SectionCard title="Author Photo">
            <div className="flex items-center gap-4">
              {profileDraft.authorPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileDraft.authorPhotoUrl}
                  alt="Author"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#E6E3DD] shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#F5F4F0] border-2 border-[#E6E3DD] flex items-center justify-center shrink-0">
                  <User size={22} className="text-[#ddd]" />
                </div>
              )}
              <div className="flex flex-col gap-1.5 min-w-0">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                  loading={uploading}
                  loadingText="Uploading…"
                  icon={<Upload size={13} />}
                >
                  {profileDraft.authorPhotoUrl ? "Replace Photo" : "Upload Photo"}
                </AdminButton>
                {profileDraft.authorPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setProfileDraft((p) => ({ ...p, authorPhotoUrl: "" }))}
                    className="text-[11px] text-red-400 hover:text-red-600 font-body text-left transition-colors"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Author Bio">
            <div>
              <label className={labelCls}>Bio</label>
              <textarea
                value={profileDraft.authorBio ?? ""}
                onChange={(e) => setProfileDraft((p) => ({ ...p, authorBio: e.target.value }))}
                rows={6}
                placeholder="Write a short biography shown on the About page and homepage…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </SectionCard>

          <SaveBanner success={success} error={error} />

          <AdminButton type="submit" loading={saving} loadingText="Saving…" className="self-start">
            Save Profile
          </AdminButton>
        </form>
      )}
    </AdminShell>
  );
}
