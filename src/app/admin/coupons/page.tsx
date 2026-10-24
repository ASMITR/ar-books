"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PlusCircle } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface Coupon { id: string; code: string; discountType: "percent" | "flat"; discountValue: number; usageCount: number; usageLimit?: number; enabled: boolean; expiresAt?: string; }

const inputCls = "w-full border border-[#E9E7E2] rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    const res = await fetch("/api/admin/coupons");
    const json = await res.json();
    if (json.success) setCoupons(json.data);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase(), discountType, discountValue: parseFloat(discountValue), usageLimit: usageLimit ? parseInt(usageLimit) : undefined, expiresAt: expiresAt || undefined, enabled: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create coupon");
      setCode(""); setDiscountValue(""); setUsageLimit(""); setExpiresAt("");
      setOpen(false); fetchCoupons();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  };

  const toggleEnabled = async (id: string, enabled: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !enabled }) });
    fetchCoupons();
  };

  return (
    <AdminShell
      title="Coupons"
      subtitle={`${coupons.length} coupon${coupons.length !== 1 ? "s" : ""}`}
      action={
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-[#0a0a0a] text-white text-xs font-body font-medium px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors">
          <PlusCircle size={13} /> Create Coupon
        </button>
      }
    >
      <div className="bg-white border border-[#E9E7E2] rounded-xl overflow-hidden">
        {coupons.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-body text-[#bbb]">No coupons yet.</p>
            <button onClick={() => setOpen(true)} className="text-sm text-[#789185] hover:underline mt-2 inline-block font-medium">Create your first coupon →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[560px]">
              <thead>
                <tr className="border-b border-[#F0EFEB] bg-[#FAFAF8]">
                  <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Code</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Discount</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Used</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Expires</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Status</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F6F3]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#0a0a0a]">{c.code}</td>
                    <td className="px-4 py-3.5 text-[#666]">{c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                    <td className="px-4 py-3.5 text-[#aaa]">{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                    <td className="px-4 py-3.5 text-[#aaa] text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 text-[11px] rounded-full font-medium ring-1 ${c.enabled ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                        {c.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggleEnabled(c.id, c.enabled)} className="text-xs text-[#789185] hover:underline font-semibold">{c.enabled ? "Disable" : "Enable"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title="Create Coupon">
        <form onSubmit={handleAdd} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Code *</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required autoFocus placeholder="e.g. SAVE20" className={`${inputCls} uppercase font-mono`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Type *</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "percent" | "flat")} className={inputCls}>
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Value *</label>
              <input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required type="number" min="1" placeholder={discountType === "percent" ? "20" : "100"} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Usage Limit</label>
              <input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} type="number" min="1" placeholder="Unlimited" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-[#aaa] mb-1.5">Expires At</label>
              <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="date" className={inputCls} />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 font-body">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-[#E9E7E2] text-[#666] font-body text-sm px-4 py-2.5 rounded-lg hover:bg-[#FAFAF9] transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#0a0a0a] text-white font-body text-sm px-4 py-2.5 rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50">{loading ? "Creating…" : "Create Coupon"}</button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
