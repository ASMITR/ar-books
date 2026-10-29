"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { PlusCircle, Trash2 } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface Coupon { id: string; code: string; discountType: "percent" | "flat"; discountValue: number; usageCount: number; usageLimit?: number; enabled: boolean; expiresAt?: string; }

const inputCls = "w-full border border-[#E6E3DD] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#080808] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls = "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";

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
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/coupons/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete coupon");
      setDeleteTarget(null);
      fetchCoupons();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell
      title="Coupons"
      subtitle={`${coupons.length} coupon${coupons.length !== 1 ? "s" : ""}`}
      action={
        <AdminButton onClick={() => setOpen(true)} icon={<PlusCircle />}>
          Create Coupon
        </AdminButton>
      }
    >
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {coupons.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-body text-[#bbb] mb-3">No coupons yet.</p>
            <AdminButton variant="inline" onClick={() => setOpen(true)}>
              Create your first coupon →
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[560px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Code</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Discount</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Used</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Expires</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Status</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#080808]">{c.code}</td>
                    <td className="px-4 py-3.5 text-[#666] text-sm">{c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                    <td className="px-4 py-3.5 text-[#aaa] text-sm">{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                    <td className="px-4 py-3.5 text-[#aaa] text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ${c.enabled ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                        {c.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <AdminButton
                          variant={c.enabled ? "danger" : "inline"}
                          onClick={() => toggleEnabled(c.id, c.enabled)}
                        >
                          {c.enabled ? "Disable" : "Enable"}
                        </AdminButton>
                        <button
                          onClick={() => { setDeleteTarget(c); setDeleteError(null); }}
                          title="Delete coupon"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
            <label className={labelCls}>Code *</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required autoFocus placeholder="e.g. SAVE20" className={`${inputCls} uppercase font-mono`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type *</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "percent" | "flat")} className={inputCls}>
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Value *</label>
              <input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required type="number" min="1" placeholder={discountType === "percent" ? "20" : "100"} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Usage Limit</label>
              <input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} type="number" min="1" placeholder="Unlimited" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Expires At</label>
              <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="date" className={inputCls} />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 font-body">{error}</p>}
          <div className="flex gap-3 pt-1">
            <AdminButton type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" className="flex-1" loading={loading} loadingText="Creating…">
              Create Coupon
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Delete confirmation modal */}
      <AdminModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Coupon">
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm font-body text-[#555]">
            Are you sure you want to permanently delete coupon{" "}
            <span className="font-mono font-bold text-[#080808]">{deleteTarget?.code}</span>?
            This cannot be undone.
          </p>
          {deleteError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-body">
              {deleteError}
            </p>
          )}
          <div className="flex gap-3">
            <AdminButton variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              className="flex-1"
              loading={deleting}
              loadingText="Deleting…"
              onClick={handleDelete}
            >
              Delete Coupon
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
