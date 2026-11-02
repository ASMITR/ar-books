"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Check, X, ArrowRight, Tag } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminModal } from "@/components/admin/AdminModal";
import { formatINR } from "@/lib/currency";
import type { MembershipPlan } from "@/types/subscription";

// ─── Input styles matching other admin forms ──────────────────────────────────
const inputCls =
  "w-full border border-[#E6E3DD] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#080808] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls =
  "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";
const sectionHdg =
  "text-[11px] font-body font-bold uppercase tracking-[0.1em] text-[#789185] mb-3 mt-1 flex items-center gap-2";

function emptyPlan(): Partial<MembershipPlan> {
  return {
    name: "",
    slug: "",
    description: "",
    pricePaise: 19900,
    priceRupees: 199,
    currency: "INR",
    billingPeriod: "monthly",
    canDownload: false,
    canReadOnline: true,
    includesStarter: true,
    includesPlus: false,
    includesPremium: false,
    includesExclusive: false,
    includesLatestReleases: false,
    badgeLabel: "",
    badgeColor: "#789185",
    highlighted: false,
    sortOrder: 10,
    benefits: [],
    active: true,
  };
}

interface Props {
  initialPlans: MembershipPlan[];
}

export function AdminMembershipPlansClient({ initialPlans }: Props) {
  const router = useRouter();
  const [plans,      setPlans]      = useState<MembershipPlan[]>(initialPlans);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [form,       setForm]       = useState<Partial<MembershipPlan>>(emptyPlan());
  const [benefits,   setBenefits]   = useState(""); // newline-separated string
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Wire the server-rendered "Create Plan" button (in AdminShell action slot)
  useEffect(() => {
    const btn = document.getElementById("open-create-plan");
    if (!btn) return;
    const handler = () => openCreate();
    btn.addEventListener("click", handler);
    return () => btn.removeEventListener("click", handler);
  }, []);

  const reload = useCallback(async () => {
    const res  = await fetch("/api/admin/membership/plans");
    const json = await res.json();
    if (json.success) setPlans(json.data as MembershipPlan[]);
  }, []);

  function openCreate() {
    setForm(emptyPlan());
    setBenefits("");
    setError(null);
    setModalOpen(true);
  }

  function set<K extends keyof MembershipPlan>(key: K, value: MembershipPlan[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    set("name", name);
    set("slug", name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  }

  // Auto-sync priceRupees when pricePaise changes
  function handlePriceChange(paise: number) {
    set("pricePaise", paise);
    set("priceRupees", Math.round(paise / 100));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Partial<MembershipPlan> = {
        ...form,
        benefits: benefits.split("\n").map((s) => s.trim()).filter(Boolean),
        priceRupees: Math.round(Number(form.pricePaise) / 100),
      };

      const res  = await fetch("/api/admin/membership/plans", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to create plan");

      setModalOpen(false);
      await reload();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-5">

        {/* Plans table */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
          {plans.length === 0 ? (
            <div className="py-20 text-center">
              <Tag size={28} className="text-[#ddd] mx-auto mb-3" />
              <p className="text-sm font-body text-[#bbb] mb-4">No plans yet. Create your first plan.</p>
              <AdminButton onClick={openCreate} icon={<PlusCircle />}>
                Create First Plan
              </AdminButton>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                    {["Plan", "Price", "Downloads", "Tiers", "Razorpay Plan", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F0EC]">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#080808]">{plan.name}</p>
                          {plan.highlighted && (
                            <span className="text-[9px] font-bold uppercase tracking-wide bg-[#FFC928] text-[#080808] px-1.5 py-0.5 rounded-full">Popular</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#aaa] mt-0.5 truncate max-w-[200px]">{plan.description}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#080808]">
                        {formatINR(plan.pricePaise)}<span className="font-normal text-[#aaa] text-xs">/mo</span>
                      </td>
                      <td className="px-5 py-4">
                        {plan.canDownload
                          ? <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
                          : <X size={14} className="text-[#ddd]" strokeWidth={2} />}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {plan.includesStarter && <span className="text-[9px] font-bold uppercase bg-[#F5EFE6] text-[#789185] px-1.5 py-0.5 rounded-full border border-[#E6DFD5]">Starter</span>}
                          {plan.includesPlus    && <span className="text-[9px] font-bold uppercase bg-[#EEF3EF] text-[#315B55] px-1.5 py-0.5 rounded-full border border-[#D4E0D6]">Plus</span>}
                          {plan.includesPremium && <span className="text-[9px] font-bold uppercase bg-[#FFF8EC] text-[#C6A66B] px-1.5 py-0.5 rounded-full border border-[#E8D9B4]">Premium</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {plan.razorpayPlanId
                          ? <span className="font-mono text-[11px] text-[#789185] bg-[#F5EFE6] px-2 py-0.5 rounded border border-[#E6DFD5]">{plan.razorpayPlanId.slice(0, 16)}…</span>
                          : <span className="text-[11px] text-[#ddd]">Auto-created on first sub</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ${plan.active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                          {plan.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/membership/plans/${plan.id}`}
                          className="inline-flex items-center gap-1 bg-[#F2F0EC] text-[#555] hover:bg-[#E8E5DF] hover:text-[#080808] transition-all rounded-md text-xs px-2.5 py-1.5 font-semibold"
                        >
                          Edit <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-body font-semibold uppercase tracking-[0.07em] text-[#b0aca6] mb-2">Note</p>
          <p className="text-[13px] font-body text-[#555] leading-relaxed">
            Razorpay plan IDs are automatically created when the first subscriber signs up for each plan.
            You can also seed default plans via:{" "}
            <code className="bg-[#F2F0EC] px-1.5 py-0.5 rounded text-[12px] font-mono text-[#080808]">
              npx ts-node scripts/seed-membership-plans.ts
            </code>
          </p>
        </div>
      </div>

      {/* ── Create Plan Modal ──────────────────────────────────────────────── */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Membership Plan"
        subtitle="Configure the plan details, pricing, and access tiers."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">

          {/* ── Basic details ──────────────────────────────────────── */}
          <p className={sectionHdg}><Tag size={12} /> Plan Details</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Plan Name *</label>
              <input
                value={form.name ?? ""}
                onChange={(e) => handleNameChange(e.target.value)}
                required placeholder="e.g. Starter"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Slug (auto-generated)</label>
              <input
                value={form.slug ?? ""}
                onChange={(e) => set("slug", e.target.value)}
                required placeholder="e.g. starter"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              required rows={2} placeholder="Short customer-facing description"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>
                Price (paise) *
                {form.pricePaise ? <span className="ml-1 text-[#789185] normal-case">= {formatINR(Number(form.pricePaise))}/mo</span> : null}
              </label>
              <input
                type="number" min="100"
                value={form.pricePaise ?? ""}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                required placeholder="19900"
                className={inputCls}
              />
              <p className="text-[11px] text-[#b0aca6] mt-1">₹199 = 19900 · ₹399 = 39900 · ₹599 = 59900</p>
            </div>
            <div>
              <label className={labelCls}>Badge Label</label>
              <input
                value={form.badgeLabel ?? ""}
                onChange={(e) => set("badgeLabel", e.target.value)}
                placeholder="e.g. Starter Member"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input
                type="number"
                value={form.sortOrder ?? 10}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Benefits (one per line)</label>
            <textarea
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              rows={5}
              placeholder={"Access to Starter eBook collection\nRead eligible eBooks online\nPersonal member library"}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* ── Access & features ──────────────────────────────────── */}
          <p className={sectionHdg}><Check size={12} /> Access & Features</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([
              ["active",                "Plan Active (accepting new subscribers)"],
              ["highlighted",           "Mark as Most Popular"],
              ["canReadOnline",         "Allow Online Reading"],
              ["canDownload",           "Allow PDF Downloads"],
              ["includesStarter",       "Includes Starter tier books"],
              ["includesPlus",          "Includes Plus tier books"],
              ["includesPremium",       "Includes Premium tier books"],
              ["includesExclusive",     "Includes Exclusive collections"],
              ["includesLatestReleases","Includes Latest releases"],
            ] as [keyof MembershipPlan, string][]).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group py-1">
                <input
                  type="checkbox"
                  checked={!!(form[key])}
                  onChange={(e) => set(key, e.target.checked as never)}
                  className="w-4 h-4 rounded border-[#E6E3DD] accent-[#789185] cursor-pointer"
                />
                <span className="text-[13px] font-body text-[#555] group-hover:text-[#080808] transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>

          {/* ── Error ─────────────────────────────────────────────── */}
          {error && (
            <p className="text-xs text-red-600 font-body bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* ── Actions ───────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <AdminButton
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              className="flex-1"
              loading={saving}
              loadingText="Creating…"
            >
              Create Plan
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
