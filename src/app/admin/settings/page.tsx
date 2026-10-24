"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Settings, AlertCircle, CheckCircle2 } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface StoreSettings { storeName?: string; supportEmail?: string; currency?: string; taxPercent?: number; }

const inputCls = "w-full border border-[#E8E6E1] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#0a0a0a] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-3 focus:ring-[#789185]/10 transition-all";
const labelCls = "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({});
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<StoreSettings>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((json) => { if (json.success) setSettings(json.data ?? {}); });
  }, []);

  const openModal = () => { setDraft(settings); setSuccess(false); setError(null); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const json = await res.json();
      if (!json.success) throw new Error("Failed to save");
      setSettings(draft); setSuccess(true);
      setTimeout(() => setOpen(false), 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  };

  const rows = [
    { label: "Store Name", value: settings.storeName || "—" },
    { label: "Support Email", value: settings.supportEmail || "—" },
    { label: "Currency", value: settings.currency || "INR" },
    { label: "Tax Percent", value: settings.taxPercent != null ? `${settings.taxPercent}%` : "0%" },
  ];

  return (
    <AdminShell
      title="Store Settings"
      subtitle="Store name, email, and tax configuration"
      action={
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-[#0a0a0a] text-white text-[12.5px] font-body font-semibold px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors shadow-sm"
        >
          <Settings size={13} />
          Edit Settings
        </button>
      }
    >
      <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="px-5 py-4 border-b border-[#F0EEE9] bg-[#FAFAF8]">
          <h2 className="font-heading text-[13px] font-bold text-[#0a0a0a] tracking-tight">General</h2>
        </div>
        <div className="divide-y divide-[#F4F3F0]">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-4">
              <span className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#b0aca6]">{label}</span>
              <span className="text-[13px] font-body font-semibold text-[#0a0a0a]">{value}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-[#FAFAF8] border-t border-[#F0EEE9]">
          <p className="text-[11.5px] font-body text-[#b0aca6] leading-relaxed">
            Currency is always INR. Tax percent is applied to order totals. Set to 0 if prices are already tax-inclusive.
          </p>
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title="Edit Settings" subtitle="Update your store configuration">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className={labelCls}>Store Name</label>
                <input type="text" value={draft.storeName ?? ""} onChange={(e) => setDraft((s) => ({ ...s, storeName: e.target.value }))} placeholder="AR Books" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Support Email</label>
                <input type="email" value={draft.supportEmail ?? ""} onChange={(e) => setDraft((s) => ({ ...s, supportEmail: e.target.value }))} placeholder="support@arbooks.in" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Currency</label>
                  <input type="text" value={draft.currency ?? ""} onChange={(e) => setDraft((s) => ({ ...s, currency: e.target.value }))} placeholder="INR" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tax Percent</label>
                  <input type="number" value={draft.taxPercent ?? ""} onChange={(e) => setDraft((s) => ({ ...s, taxPercent: parseFloat(e.target.value) }))} placeholder="0" min="0" className={inputCls} />
                </div>
              </div>
              {success && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-body bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                  <CheckCircle2 size={12} className="shrink-0" />
                  Settings saved successfully.
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 font-body bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <AlertCircle size={12} className="shrink-0" />
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-[#E8E6E1] text-[#666] font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#F7F6F3] hover:border-[#D0CEC9] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#0a0a0a] text-white font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50 shadow-sm">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : "Save Settings"}
                </button>
              </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
