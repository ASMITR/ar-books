"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  PlusCircle, Pencil, Trash2, Copy, Pause, Play,
  BarChart2, Tag, Calendar, Users, ShoppingCart,
} from "lucide-react";
import { formatINR } from "@/lib/currency";
import type { Offer, OfferType, OfferStatus, OfferEligibility } from "@/types";

// ─── Form field helpers ───────────────────────────────────────────────────────
const inputCls =
  "w-full border border-[#E6E3DD] rounded-lg px-3.5 py-2.5 text-sm font-body text-[#080808] placeholder:text-[#c0bdb8] bg-white focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-all";
const labelCls =
  "block text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#9e9a94] mb-1.5";
const sectionHeading = "text-[11px] font-body font-bold uppercase tracking-[0.1em] text-[#789185] mb-3 mt-5 flex items-center gap-2";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OfferStatus }) {
  const styles: Record<OfferStatus, string> = {
    active:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
    draft:     "bg-slate-50 text-slate-500 ring-slate-200",
    scheduled: "bg-blue-50 text-blue-600 ring-blue-200",
    paused:    "bg-amber-50 text-amber-600 ring-amber-200",
    expired:   "bg-rose-50 text-rose-500 ring-rose-200",
  };
  return (
    <span className={`px-2.5 py-1 text-[10px] rounded-full font-semibold ring-1 capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

// ─── Offer type label ─────────────────────────────────────────────────────────
function offerTypeLabel(t: OfferType): string {
  const map: Record<OfferType, string> = {
    percent: "% Discount",
    flat: "₹ Discount",
    buy_x_get_y: "Buy X Get Y",
    bundle: "Bundle",
    first_order: "First Order",
    combo: "Combo",
    category: "Category",
    product_specific: "Product",
  };
  return map[t] ?? t;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
type Tab = "all" | "active" | "scheduled" | "expired" | "coupons";
const TABS: { id: Tab; label: string }[] = [
  { id: "all",       label: "All Offers" },
  { id: "active",    label: "Active" },
  { id: "scheduled", label: "Scheduled" },
  { id: "expired",   label: "Expired / Paused" },
  { id: "coupons",   label: "Coupon Codes" },
];

// ─── Empty form state ─────────────────────────────────────────────────────────
function emptyForm(): Partial<Offer> {
  return {
    internalName: "",
    title: "",
    description: "",
    bannerImageUrl: "",
    offerType: "percent",
    couponCode: "",
    startAt: new Date().toISOString().slice(0, 16),
    endAt: "",
    status: "draft",
    priority: 0,
    discountType: "percent",
    discountValue: 10,
    maxDiscountPaise: undefined,
    buyX: undefined,
    getY: undefined,
    minCartValuePaise: undefined,
    minItemCount: undefined,
    applicableBookIds: [],
    applicableCategoryIds: [],
    customerEligibility: "all",
    usageLimitTotal: undefined,
    usageLimitPerCustomer: undefined,
    stackable: false,
    showOnHomepage: true,
    showOnProductPages: true,
    showInCart: true,
    showOnCheckout: true,
    showInAnnouncementBar: false,
    displayCouponPublicly: true,
    ctaText: "",
    badgeLabel: "",
  };
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminOffersPage() {
  const [offers, setOffers]   = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<Tab>("all");
  const [search, setSearch]   = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]       = useState<Partial<Offer>>(emptyForm());
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/offers");
      const json = await res.json();
      if (json.success) setOffers(json.data as Offer[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  // ─── Filter ─────────────────────────────────────────────────────────────────
  const filtered = offers.filter((o) => {
    const matchSearch =
      !search ||
      o.internalName.toLowerCase().includes(search.toLowerCase()) ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.couponCode?.toLowerCase().includes(search.toLowerCase());

    const now = new Date().toISOString();
    const matchTab =
      tab === "all"       ? true :
      tab === "active"    ? o.status === "active" :
      tab === "scheduled" ? o.status === "scheduled" || (o.status === "active" && o.startAt > now) :
      tab === "expired"   ? o.status === "expired" || o.status === "paused" :
      tab === "coupons"   ? !!o.couponCode :
      true;

    return matchSearch && matchTab;
  });

  // ─── Open create / edit modal ────────────────────────────────────────────────
  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setModalOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditingId(offer.id);
    setForm({
      ...offer,
      startAt: offer.startAt ? offer.startAt.slice(0, 16) : "",
      endAt:   offer.endAt   ? offer.endAt.slice(0, 16)   : "",
    });
    setError(null);
    setModalOpen(true);
  }

  // ─── Save ────────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        couponCode:       form.couponCode?.toUpperCase().trim() || undefined,
        startAt:          form.startAt ? new Date(form.startAt).toISOString() : undefined,
        endAt:            form.endAt   ? new Date(form.endAt).toISOString()   : undefined,
        maxDiscountPaise: form.maxDiscountPaise ? Number(form.maxDiscountPaise) : undefined,
        minCartValuePaise: form.minCartValuePaise ? Number(form.minCartValuePaise) : undefined,
      };

      const url    = editingId ? `/api/admin/offers/${editingId}` : "/api/admin/offers";
      const method = editingId ? "PATCH" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success && !res.ok) throw new Error(json.error ?? "Failed to save");

      setModalOpen(false);
      fetchOffers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving offer");
    } finally {
      setSaving(false);
    }
  }

  // ─── Toggle status ───────────────────────────────────────────────────────────
  async function toggleStatus(offer: Offer) {
    const newStatus: OfferStatus = offer.status === "active" ? "paused" : "active";
    await fetch(`/api/admin/offers/${offer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOffers();
  }

  // ─── Duplicate ───────────────────────────────────────────────────────────────
  async function duplicate(offer: Offer) {
    const { id: _id, createdAt: _ca, updatedAt: _ua, usageCount: _uc, ...rest } = offer;
    void _id; void _ca; void _ua; void _uc;
    await fetch("/api/admin/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...rest,
        internalName: `${rest.internalName} (Copy)`,
        status: "draft",
        couponCode: rest.couponCode ? `${rest.couponCode}2` : undefined,
      }),
    });
    fetchOffers();
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchOffers();
  }

  // ─── Form helper ─────────────────────────────────────────────────────────────
  function set<K extends keyof Offer>(key: K, value: Offer[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ─── Stats row ───────────────────────────────────────────────────────────────
  const activeCount    = offers.filter((o) => o.status === "active").length;
  const scheduledCount = offers.filter((o) => o.status === "scheduled").length;
  const totalUsage     = offers.reduce((s, o) => s + (o.usageCount ?? 0), 0);

  return (
    <AdminShell
      title="Offers & Coupons"
      subtitle={`${offers.length} offer${offers.length !== 1 ? "s" : ""}`}
      action={
        <AdminButton onClick={openCreate} icon={<PlusCircle />}>
          Create New Offer
        </AdminButton>
      }
    >
      {/* ── Stats cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Offers",     value: offers.length,  icon: Tag,          color: "#203A2B" },
          { label: "Active Now",       value: activeCount,    icon: Play,         color: "#315B55" },
          { label: "Scheduled",        value: scheduledCount, icon: Calendar,     color: "#C6A66B" },
          { label: "Total Redemptions",value: totalUsage,     icon: BarChart2,    color: "#203A2B" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#E6E3DD] rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-[#080808] leading-none">{value}</p>
              <p className="text-[11px] font-body text-[#9e9a94] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs + search ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">
        <div className="flex gap-1 bg-white border border-[#E6E3DD] rounded-xl p-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-[#203A2B] text-white shadow-sm"
                  : "text-[#888] hover:text-[#080808]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          placeholder="Search offers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:ml-auto border border-[#E6E3DD] rounded-lg px-3.5 py-2 text-sm font-body focus:outline-none focus:border-[#789185] bg-white w-full sm:w-56"
        />
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-sm font-body text-[#bbb]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-body text-[#bbb] mb-3">No offers found.</p>
            <AdminButton variant="inline" onClick={openCreate}>Create your first offer →</AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[860px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  {["Offer","Type","Discount","Coupon","Period","Redemptions","Status",""].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {filtered.map((offer) => (
                  <tr key={offer.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <p className="font-medium text-[#080808] truncate">{offer.title}</p>
                      <p className="text-[11px] text-[#aaa] truncate">{offer.internalName}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#666]">
                      {offerTypeLabel(offer.offerType)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#203A2B]">
                      {offer.discountType === "percent"
                        ? `${offer.discountValue}%`
                        : formatINR(offer.discountValue * 100)}
                    </td>
                    <td className="px-4 py-3.5">
                      {offer.couponCode ? (
                        <span className="font-mono text-xs bg-[#F5EFE6] text-[#203A2B] px-2 py-0.5 rounded border border-[#E6DFD5]">
                          {offer.couponCode}
                        </span>
                      ) : (
                        <span className="text-[#ccc] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#888]">
                      <div>{new Date(offer.startAt).toLocaleDateString("en-IN")}</div>
                      {offer.endAt && (
                        <div className="text-[#bbb]">→ {new Date(offer.endAt).toLocaleDateString("en-IN")}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#555]">
                      {offer.usageCount ?? 0}
                      {offer.usageLimitTotal ? ` / ${offer.usageLimitTotal}` : ""}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={offer.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <AdminButton
                          variant="inline"
                          onClick={() => openEdit(offer)}
                          icon={<Pencil size={12} />}
                        >
                          Edit
                        </AdminButton>
                        <button
                          onClick={() => toggleStatus(offer)}
                          title={offer.status === "active" ? "Pause" : "Activate"}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-[#080808] hover:bg-[#F2F0EC] transition-all"
                        >
                          {offer.status === "active" ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                        <button
                          onClick={() => duplicate(offer)}
                          title="Duplicate"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-[#080808] hover:bg-[#F2F0EC] transition-all"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteId(offer.id)}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={12} />
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

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Offer" : "Create New Offer"}
        subtitle="Configure all promotion details below."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">

          {/* ── Basic Details ───────────────────────────────────────────── */}
          <p className={sectionHeading}><Tag size={12} /> Basic Details</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Internal Name *</label>
              <input
                value={form.internalName ?? ""}
                onChange={(e) => set("internalName", e.target.value)}
                required placeholder="e.g. Summer Welcome Campaign"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Public Title *</label>
              <input
                value={form.title ?? ""}
                onChange={(e) => set("title", e.target.value)}
                required placeholder="e.g. A Special Welcome"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Short Description *</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              required rows={2} placeholder="Customer-facing description"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Offer Type *</label>
              <select value={form.offerType} onChange={(e) => set("offerType", e.target.value as OfferType)} className={inputCls}>
                <option value="percent">Percentage Discount</option>
                <option value="flat">Fixed ₹ Discount</option>
                <option value="first_order">First Order Discount</option>
                <option value="bundle">Bundle / Buy X</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
                <option value="combo">Combo Offer</option>
                <option value="category">Category Discount</option>
                <option value="product_specific">Product Specific</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status *</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as OfferStatus)} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority (higher = first)</label>
              <input
                type="number" value={form.priority ?? 0}
                onChange={(e) => set("priority", parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Date & Time *</label>
              <input type="datetime-local" value={form.startAt ?? ""} onChange={(e) => set("startAt", e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date & Time (blank = no expiry)</label>
              <input type="datetime-local" value={form.endAt ?? ""} onChange={(e) => set("endAt", e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Coupon Code (optional)</label>
              <input
                value={form.couponCode ?? ""}
                onChange={(e) => set("couponCode", e.target.value.toUpperCase().trim())}
                placeholder="e.g. WELCOME10"
                className={`${inputCls} uppercase font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Badge Label (optional)</label>
              <input
                value={form.badgeLabel ?? ""}
                onChange={(e) => set("badgeLabel", e.target.value)}
                placeholder="e.g. FIRST ORDER"
                className={inputCls}
              />
            </div>
          </div>

          {/* ── Discount Configuration ──────────────────────────────────── */}
          <p className={sectionHeading}><BarChart2 size={12} /> Discount Configuration</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Discount Type *</label>
              <select value={form.discountType} onChange={(e) => set("discountType", e.target.value as "percent" | "flat")} className={inputCls}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Discount Value *</label>
              <input
                type="number" min="0" step="0.01"
                value={form.discountValue ?? ""}
                onChange={(e) => set("discountValue", parseFloat(e.target.value) || 0)}
                required placeholder={form.discountType === "percent" ? "20" : "100"}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Max Discount (₹, optional)</label>
              <input
                type="number" min="0"
                value={form.maxDiscountPaise ? form.maxDiscountPaise / 100 : ""}
                onChange={(e) => set("maxDiscountPaise", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined)}
                placeholder="Cap in rupees"
                className={inputCls}
              />
            </div>
          </div>

          {(form.offerType === "buy_x_get_y" || form.offerType === "bundle") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Buy X (quantity)</label>
                <input type="number" min="1" value={form.buyX ?? ""} onChange={(e) => set("buyX", parseInt(e.target.value) || undefined)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Get Y (quantity)</label>
                <input type="number" min="1" value={form.getY ?? ""} onChange={(e) => set("getY", parseInt(e.target.value) || undefined)} className={inputCls} />
              </div>
            </div>
          )}

          {/* ── Eligibility Rules ───────────────────────────────────────── */}
          <p className={sectionHeading}><Users size={12} /> Eligibility Rules</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Customer Eligibility</label>
              <select value={form.customerEligibility ?? "all"} onChange={(e) => set("customerEligibility", e.target.value as OfferEligibility)} className={inputCls}>
                <option value="all">All Customers</option>
                <option value="new_customers">New Customers Only</option>
                <option value="existing_customers">Existing Customers Only</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Min Cart Value (₹)</label>
              <input
                type="number" min="0"
                value={form.minCartValuePaise ? form.minCartValuePaise / 100 : ""}
                onChange={(e) => set("minCartValuePaise", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined)}
                placeholder="e.g. 499"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Min Items in Cart</label>
              <input
                type="number" min="1"
                value={form.minItemCount ?? ""}
                onChange={(e) => set("minItemCount", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g. 2"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Total Usage Limit</label>
              <input
                type="number" min="1"
                value={form.usageLimitTotal ?? ""}
                onChange={(e) => set("usageLimitTotal", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Usage Limit Per Customer</label>
              <input
                type="number" min="1"
                value={form.usageLimitPerCustomer ?? ""}
                onChange={(e) => set("usageLimitPerCustomer", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox" id="stackable"
              checked={form.stackable ?? false}
              onChange={(e) => set("stackable", e.target.checked)}
              className="rounded"
            />
            <label htmlFor="stackable" className="text-sm font-body text-[#555]">
              Can be combined with another offer
            </label>
          </div>

          {/* ── Display Settings ────────────────────────────────────────── */}
          <p className={sectionHeading}><ShoppingCart size={12} /> Display Settings</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                ["showOnHomepage",         "Homepage"],
                ["showOnProductPages",     "Product Pages"],
                ["showInCart",             "Cart"],
                ["showOnCheckout",         "Checkout"],
                ["showInAnnouncementBar",  "Announcement Bar"],
                ["displayCouponPublicly",  "Show Code Publicly"],
              ] as [keyof Offer, string][]
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm font-body text-[#555] cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form[key] as boolean) ?? false}
                  onChange={(e) => set(key, e.target.checked as never)}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>CTA Button Text</label>
              <input
                value={form.ctaText ?? ""}
                onChange={(e) => set("ctaText", e.target.value)}
                placeholder="e.g. Shop Now"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Banner Image URL (optional)</label>
              <input
                value={form.bannerImageUrl ?? ""}
                onChange={(e) => set("bannerImageUrl", e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-body bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <AdminButton type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              variant="dark"
              className="flex-1"
              loading={saving}
              loadingText={editingId ? "Saving…" : "Creating…"}
            >
              {editingId ? "Save Changes" : "Create Offer"}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* ── Delete confirmation ─────────────────────────────────────────────── */}
      <AdminModal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Offer">
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm font-body text-[#555]">
            Are you sure you want to delete this offer? If it has been used in orders, it will be archived instead to preserve order history.
          </p>
          <div className="flex gap-3">
            <AdminButton variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</AdminButton>
            <AdminButton variant="danger" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)}>Delete</AdminButton>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
