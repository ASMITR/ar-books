"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  PlusCircle, Trash2, Tag, Calendar, Users,
  ToggleLeft, ToggleRight, Percent, IndianRupee, Copy, Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Coupon {
  id: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  usageCount: number;
  usageLimit?: number;
  enabled: boolean;
  expiresAt?: string;
}

// ─── Shared style tokens ─────────────────────────────────────────────────────
const inputCls =
  "w-full border border-[#E6E3DD] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#080808] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls =
  "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";

// ─── Helper: copy-to-clipboard button ────────────────────────────────────────
function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handle}
      title="Copy code"
      className="ml-1.5 p-1 rounded text-[#aaa] hover:text-[#203A2B] hover:bg-[#EEF3EF] transition-all"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
    </button>
  );
}

// ─── Coupon card ──────────────────────────────────────────────────────────────
function CouponCard({
  c,
  onToggle,
  onDelete,
}: {
  c: Coupon;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (c: Coupon) => void;
}) {
  const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
  const statusLabel = !c.enabled ? "Disabled" : isExpired ? "Expired" : "Active";
  const statusCls = !c.enabled || isExpired
    ? "bg-slate-100 text-slate-500 border-slate-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const usagePct =
    c.usageLimit && c.usageLimit > 0
      ? Math.min(100, Math.round((c.usageCount / c.usageLimit) * 100))
      : null;

  return (
    <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">

      {/* ── Header band ─────────────────────────────────────────────────── */}
      <div className="bg-[#F8F6F2] border-b border-[#E6E3DD] px-5 py-4 flex items-start justify-between gap-3">
        {/* Code + copy */}
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-[#b0aca6]">
            Coupon Code
          </p>
          <div className="flex items-center gap-0.5">
            <span className="font-mono text-[17px] font-bold text-[#080808] tracking-widest truncate">
              {c.code}
            </span>
            <CopyCode code={c.code} />
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`shrink-0 mt-0.5 px-2.5 py-1 text-[10px] font-body font-bold uppercase tracking-[0.08em] rounded-full border ${statusCls}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* ── Discount value ───────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-[#F2F0EC] flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-[#EEF3EF] flex items-center justify-center shrink-0">
          {c.discountType === "percent"
            ? <Percent size={16} strokeWidth={1.8} className="text-[#203A2B]" />
            : <IndianRupee size={16} strokeWidth={1.8} className="text-[#203A2B]" />}
        </span>
        <div>
          <p className="font-heading text-[22px] font-bold text-[#080808] leading-none">
            {c.discountType === "percent"
              ? `${c.discountValue}% off`
              : `₹${c.discountValue} off`}
          </p>
          <p className="text-[11px] font-body text-[#9e9a94] mt-0.5">
            {c.discountType === "percent" ? "Percentage discount" : "Flat amount discount"}
          </p>
        </div>
      </div>

      {/* ── Meta rows ────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 flex flex-col gap-3 flex-1">

        {/* Usage */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#777]">
            <Users size={13} strokeWidth={1.7} className="shrink-0" />
            <span className="text-[12px] font-body">Usage</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[12px] font-body font-semibold text-[#080808]">
              {c.usageCount}
              {c.usageLimit ? (
                <span className="font-normal text-[#aaa]"> / {c.usageLimit}</span>
              ) : (
                <span className="font-normal text-[#aaa]"> uses</span>
              )}
            </span>
            {usagePct !== null && (
              <div className="w-20 h-1.5 bg-[#F0EEE9] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usagePct >= 90 ? "bg-red-400" : usagePct >= 60 ? "bg-amber-400" : "bg-emerald-500"}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Expiry */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#777]">
            <Calendar size={13} strokeWidth={1.7} className="shrink-0" />
            <span className="text-[12px] font-body">Expires</span>
          </div>
          <span className={`text-[12px] font-body font-semibold ${isExpired ? "text-red-500" : "text-[#080808]"}`}>
            {c.expiresAt
              ? new Date(c.expiresAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : <span className="font-normal text-[#aaa]">No expiry</span>}
          </span>
        </div>
      </div>

      {/* ── Actions footer ───────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-t border-[#F2F0EC] bg-[#FAFAF8] flex items-center justify-between gap-2">
        <button
          onClick={() => onToggle(c.id, c.enabled)}
          className="inline-flex items-center gap-1.5 text-[11px] font-body font-semibold text-[#555] hover:text-[#080808] transition-colors"
        >
          {c.enabled
            ? <><ToggleRight size={16} className="text-emerald-600" /> Enabled</>
            : <><ToggleLeft size={16} className="text-slate-400" /> Disabled</>}
        </button>

        <div className="flex items-center gap-1.5">
          <AdminButton
            variant={c.enabled ? "danger" : "inline"}
            onClick={() => onToggle(c.id, c.enabled)}
          >
            {c.enabled ? "Disable" : "Enable"}
          </AdminButton>
          <button
            onClick={() => onDelete(c)}
            title="Delete coupon"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#ccc] hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          discountType,
          discountValue: parseFloat(discountValue),
          usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
          expiresAt: expiresAt || undefined,
          enabled: true,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create coupon");
      setCode(""); setDiscountValue(""); setUsageLimit(""); setExpiresAt("");
      setOpen(false);
      fetchCoupons();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const toggleEnabled = async (id: string, enabled: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
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

  const activeCount   = coupons.filter((c) => c.enabled && (!c.expiresAt || new Date(c.expiresAt) >= new Date())).length;
  const disabledCount = coupons.filter((c) => !c.enabled).length;

  return (
    <AdminShell
      title="Coupons"
      subtitle={`${coupons.length} coupon${coupons.length !== 1 ? "s" : ""} · ${activeCount} active`}
      action={
        <AdminButton onClick={() => setOpen(true)} icon={<PlusCircle />}>
          Create Coupon
        </AdminButton>
      }
    >
      {/* ── Summary bar ─────────────────────────────────────────────────── */}
      {coupons.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total",    value: coupons.length,  color: "text-[#080808]" },
            { label: "Active",   value: activeCount,     color: "text-emerald-700" },
            { label: "Disabled", value: disabledCount,   color: "text-slate-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-[#E6E3DD] rounded-xl px-5 py-4">
              <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#b0aca6] mb-1">{label}</p>
              <p className={`font-heading text-[26px] font-bold leading-none ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Coupon grid ──────────────────────────────────────────────────── */}
      {coupons.length === 0 ? (
        <div className="bg-white border border-[#E6E3DD] rounded-xl py-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F2F0EC] flex items-center justify-center">
            <Tag size={22} className="text-[#c0bdb8]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[15px] font-body font-semibold text-[#080808]">No coupons yet</p>
            <p className="text-[13px] font-body text-[#b0aca6] mt-1">Create your first coupon to offer discounts.</p>
          </div>
          <AdminButton onClick={() => setOpen(true)} icon={<PlusCircle />}>
            Create Coupon
          </AdminButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <CouponCard
              key={c.id}
              c={c}
              onToggle={toggleEnabled}
              onDelete={(target) => { setDeleteTarget(target); setDeleteError(null); }}
            />
          ))}
        </div>
      )}

      {/* ── Create modal ─────────────────────────────────────────────────── */}
      <AdminModal open={open} onClose={() => setOpen(false)} title="Create Coupon" subtitle="Fill in the details to create a new discount code">
        <form onSubmit={handleAdd} className="p-6 flex flex-col gap-5">

          {/* Code */}
          <div>
            <label className={labelCls}>Coupon Code <span className="text-red-400">*</span></label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              autoFocus
              placeholder="e.g. SAVE20"
              className={`${inputCls} uppercase font-mono tracking-widest`}
            />
            <p className="text-[11px] font-body text-[#b0aca6] mt-1.5">
              Customers will enter this code at checkout.
            </p>
          </div>

          {/* Type + Value */}
          <div>
            <label className={labelCls}>Discount <span className="text-red-400">*</span></label>
            <div className="flex gap-2">
              {/* Type toggle */}
              <div className="flex rounded-lg border border-[#E6E3DD] overflow-hidden shrink-0">
                {(["percent", "flat"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDiscountType(t)}
                    className={`px-3.5 py-2.5 text-[12px] font-body font-semibold transition-colors flex items-center gap-1.5 ${
                      discountType === t
                        ? "bg-[#203A2B] text-white"
                        : "bg-white text-[#555] hover:bg-[#F2F0EC]"
                    }`}
                  >
                    {t === "percent"
                      ? <><Percent size={12} /> %</>
                      : <><IndianRupee size={12} /> ₹</>}
                  </button>
                ))}
              </div>
              {/* Value */}
              <input
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                type="number"
                min="1"
                max={discountType === "percent" ? "100" : undefined}
                placeholder={discountType === "percent" ? "20" : "100"}
                className={inputCls}
              />
            </div>
            <p className="text-[11px] font-body text-[#b0aca6] mt-1.5">
              {discountType === "percent"
                ? "Enter a value between 1 and 100."
                : "Enter a flat rupee amount to deduct."}
            </p>
          </div>

          {/* Usage limit + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Usage Limit</label>
              <input
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                type="number"
                min="1"
                placeholder="Unlimited"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Expiry Date</label>
              <input
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                type="date"
                className={inputCls}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[12px] font-body text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1 border-t border-[#F0EEE9]">
            <AdminButton
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              className="flex-1"
              loading={loading}
              loadingText="Creating…"
            >
              Create Coupon
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      <AdminModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Coupon"
        subtitle="This action cannot be undone"
      >
        <div className="p-6 flex flex-col gap-5">

          {/* Info row */}
          <div className="flex items-center gap-4 p-4 bg-[#F8F6F2] border border-[#E6E3DD] rounded-xl">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Trash2 size={16} className="text-red-500" strokeWidth={1.7} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-body font-semibold text-[#080808]">
                Deleting coupon
              </p>
              <p className="font-mono text-[15px] font-bold text-[#203A2B] tracking-widest mt-0.5">
                {deleteTarget?.code}
              </p>
            </div>
          </div>

          <p className="text-[13px] font-body text-[#555] leading-relaxed">
            This coupon will be permanently removed. Any active sessions
            using this code will no longer receive a discount.
          </p>

          {deleteError && (
            <p className="text-[12px] font-body text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {deleteError}
            </p>
          )}

          <div className="flex gap-3 pt-1 border-t border-[#F0EEE9]">
            <AdminButton
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
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
