"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/currency";
import { AdminButton } from "@/components/admin/AdminButton";
import type { MembershipPlan } from "@/types/subscription";

const inputCls =
  "w-full border border-[#E6E3DD] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#080808] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls =
  "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";
const sectionHdg =
  "text-[11px] font-body font-bold uppercase tracking-[0.1em] text-[#789185] mb-3 mt-2";

export function AdminPlanEditForm({ plan }: { plan: MembershipPlan }) {
  const router  = useRouter();
  const [form,   setForm]   = useState({ ...plan, benefitsText: plan.benefits.join("\n") });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const update = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        benefits:    form.benefitsText.split("\n").map((s: string) => s.trim()).filter(Boolean),
        pricePaise:  Number(form.pricePaise),
        priceRupees: Math.round(Number(form.pricePaise) / 100),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { benefitsText: _b, ...body } = payload;
      const res  = await fetch(`/api/admin/membership/plans/${plan.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Save failed");
      setMsg({ type: "ok", text: "Plan saved successfully." });
      router.refresh();
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-body border ${msg.type === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
          {msg.text}
        </div>
      )}

      {/* ── Plan Details ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6E3DD] rounded-xl p-6 shadow-sm space-y-4">
        <p className={sectionHdg}>Plan Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Plan Name</label>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>
              Monthly Price (paise) &nbsp;
              <span className="text-[#789185] normal-case">Currently: {formatINR(Number(form.pricePaise))}</span>
            </label>
            <input type="number" value={form.pricePaise} onChange={(e) => update("pricePaise", e.target.value)} className={inputCls} />
            <p className="text-[11px] text-[#b0aca6] mt-1">₹199 = 19900 · ₹399 = 39900 · ₹599 = 59900</p>
          </div>
          <div>
            <label className={labelCls}>Badge Label</label>
            <input value={form.badgeLabel} onChange={(e) => update("badgeLabel", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value))} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Benefits (one per line)</label>
          <textarea value={form.benefitsText} onChange={(e) => update("benefitsText", e.target.value)} rows={7} className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* ── Access & Features ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6E3DD] rounded-xl p-6 shadow-sm">
        <p className={sectionHdg}>Access & Features</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            ["active",                "Plan Active (accepting subscribers)"],
            ["highlighted",           "Highlight as Most Popular"],
            ["canDownload",           "Allow PDF Downloads"],
            ["canReadOnline",         "Allow Online Reading"],
            ["includesStarter",       "Access: Starter tier books"],
            ["includesPlus",          "Access: Plus tier books"],
            ["includesPremium",       "Access: Premium tier books"],
            ["includesExclusive",     "Access: Exclusive collections"],
            ["includesLatestReleases","Access: Latest releases"],
          ] as [keyof typeof form, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group py-1">
              <input
                type="checkbox"
                checked={!!form[key]}
                onChange={(e) => update(key, e.target.checked)}
                className="w-4 h-4 rounded border-[#E6E3DD] accent-[#203A2B] cursor-pointer"
              />
              <span className="text-[13px] font-body text-[#555] group-hover:text-[#080808] transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <AdminButton
          onClick={handleSave}
          loading={saving}
          loadingText="Saving…"
          variant="dark"
        >
          Save Changes
        </AdminButton>
        <AdminButton variant="secondary" onClick={() => router.back()}>
          Cancel
        </AdminButton>
      </div>
    </div>
  );
}
