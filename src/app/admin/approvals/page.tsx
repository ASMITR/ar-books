"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminModal } from "@/components/admin/AdminModal";
import { RefreshCw, CheckCircle2, XCircle, MessageSquare, Send, DollarSign, BookOpen, Layers } from "lucide-react";
import type { Book, Series } from "@/types";
import { formatINR } from "@/lib/currency";

const statusStyles: Record<string, { cls: string; dot: string }> = {
  pending_approval:  { cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",   dot: "bg-amber-400"   },
  changes_requested: { cls: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",dot: "bg-orange-400"  },
  approved:          { cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",       dot: "bg-blue-500"    },
};

function StatusPill({ status }: { status: string }) {
  const s = statusStyles[status];
  const labels: Record<string, string> = { pending_approval: "Pending Review", changes_requested: "Changes Requested", approved: "Approved" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full font-semibold font-body ${s?.cls ?? "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}>
      {s && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
      {labels[status] ?? status}
    </span>
  );
}

type ResourceType = "book" | "series";
type Action = "approve" | "reject" | "request_changes" | "publish" | null;

interface ActionModal {
  open: boolean; resourceId: string; resourceType: ResourceType;
  resourceTitle: string; currentStatus: string; action: Action;
}

const inputCls = "w-full bg-[#F7F5F2] border border-[#E2DDD8] px-4 py-3 text-[13px] font-body text-[#111] placeholder:text-[#C4BFB9] focus:outline-none focus:border-[#203A2B] focus:bg-white transition-all rounded-lg";

export default function AdminApprovalsPage() {
  const [books, setBooks]   = useState<Book[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"books" | "series">("books");

  const [modal, setModal] = useState<ActionModal>({
    open: false, resourceId: "", resourceType: "book", resourceTitle: "", currentStatus: "", action: null,
  });
  const [comment, setComment]       = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [acting, setActing]         = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/admin/approvals");
    const json = await res.json();
    if (json.success) { setBooks(json.data.books); setSeries(json.data.series); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAction = (id: string, type: ResourceType, title: string, status: string, action: Action) => {
    setComment(""); setPriceRupees(""); setOriginalPrice(""); setActionError(null);
    setModal({ open: true, resourceId: id, resourceType: type, resourceTitle: title, currentStatus: status, action });
  };

  const handleAction = async () => {
    if (!modal.action) return;
    setActing(true); setActionError(null);
    try {
      const payload: Record<string, unknown> = { action: modal.action, resourceType: modal.resourceType };
      if (modal.action === "reject")          payload.reason = comment;
      if (modal.action === "request_changes") payload.comment = comment;
      if (modal.action === "publish" && priceRupees) {
        payload.priceRupees = parseFloat(priceRupees);
        if (originalPrice) payload.originalPriceRupees = parseFloat(originalPrice);
      }
      const res  = await fetch(`/api/admin/approvals/${modal.resourceId}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
      setModal((p) => ({ ...p, open: false }));
      await fetchData();
    } catch (err) { setActionError(err instanceof Error ? err.message : "Action failed"); }
    finally { setActing(false); }
  };

  const items = tab === "books" ? books : series;
  const total = books.length + series.length;

  return (
    <AdminShell
      title="Approvals"
      subtitle={`${total} submission${total !== 1 ? "s" : ""} awaiting review`}
      action={
        <AdminButton variant="secondary" onClick={fetchData} icon={<RefreshCw />}>
          Refresh
        </AdminButton>
      }
    >
      <div className="space-y-5">

        {/* Tab filters */}
        <div className="flex gap-1.5 flex-wrap">
          {(["books", "series"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`inline-flex items-center gap-1.5 text-[12px] font-body font-semibold px-3.5 py-2 rounded-lg border transition-all capitalize ${
                tab === t ? "bg-[#FFC928] text-[#080808] border-[#FFC928] shadow-sm" : "border-[#E6E3DD] text-[#888] hover:border-[#bbb] hover:text-[#444] bg-white"
              }`}
            >
              {t === "books" ? <BookOpen size={12} /> : <Layers size={12} />}
              {t} ({t === "books" ? books.length : series.length})
            </button>
          ))}
        </div>

        {/* Submissions list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E8E4DE] rounded-2xl p-5 animate-pulse">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F2F0EC] rounded w-48" />
                    <div className="h-3 bg-[#F2F0EC] rounded w-32" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20 h-7 bg-[#F2F0EC] rounded-lg" />
                    <div className="w-20 h-7 bg-[#F2F0EC] rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-[#E8E4DE] rounded-2xl py-20 text-center shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-[#F2F0EC] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
            <p className="text-[15px] font-body text-[#bbb]">All caught up — no pending {tab}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const title  = "title" in item ? item.title : (item as Series).name;
              const status = item.submissionStatus ?? "";
              const type: ResourceType = tab === "books" ? "book" : "series";
              const suggested = tab === "books" ? (item as Book).suggestedPriceRupees : undefined;
              return (
                <div key={item.id} className="bg-white border border-[#E8E4DE] rounded-2xl p-5 shadow-sm hover:border-[#D0CCC6] transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="font-heading font-bold text-[14.5px] text-[#0a0a0a] truncate">{title}</p>
                        <StatusPill status={status} />
                      </div>
                      {"author" in item && item.author && (
                        <p className="text-[12.5px] font-body text-[#999]">by {item.author}</p>
                      )}
                      {item.ownerFeedback && (
                        <p className="text-[12px] font-body text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-100 inline-block">
                          Previous feedback: {item.ownerFeedback}
                        </p>
                      )}
                      {suggested && (
                        <p className="text-[12px] font-body text-[#999]">
                          Suggested price: <span className="font-semibold text-[#555]">{formatINR(suggested)}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {status === "pending_approval" && (
                        <>
                          <AdminButton variant="inline" icon={<CheckCircle2 />}
                            onClick={() => openAction(item.id, type, title, status, "approve")}>
                            Approve
                          </AdminButton>
                          <AdminButton variant="inline" icon={<MessageSquare />}
                            onClick={() => openAction(item.id, type, title, status, "request_changes")}>
                            Changes
                          </AdminButton>
                          <AdminButton variant="danger" icon={<XCircle />}
                            onClick={() => openAction(item.id, type, title, status, "reject")}>
                            Reject
                          </AdminButton>
                        </>
                      )}
                      {status === "approved" && (
                        <AdminButton variant="primary" icon={<Send />}
                          onClick={() => openAction(item.id, type, title, status, "publish")}>
                          Publish
                        </AdminButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action modal */}
      <AdminModal
        open={modal.open}
        onClose={() => setModal((p) => ({ ...p, open: false }))}
        title={
          modal.action === "approve"          ? "Approve Submission" :
          modal.action === "reject"           ? "Reject Submission"  :
          modal.action === "request_changes"  ? "Request Changes"    : "Publish"
        }
        subtitle={`"${modal.resourceTitle}"`}
      >
        <div className="p-6 space-y-4">
          <p className="text-[13px] font-body text-[#555] leading-relaxed">
            {modal.action === "approve" && <>Approve this {modal.resourceType}? The author will be notified. It won&apos;t go live until you publish it.</>}
            {modal.action === "reject"  && <>Permanently reject this {modal.resourceType}? The author will see your reason.</>}
            {modal.action === "request_changes" && <>Ask the author to revise. They can resubmit after making changes.</>}
            {modal.action === "publish" && <>Publish this {modal.resourceType} and make it live on the website.</>}
          </p>

          {(modal.action === "reject" || modal.action === "request_changes") && (
            <div>
              <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">
                {modal.action === "reject" ? "Rejection reason *" : "Comments for author *"}
              </label>
              <textarea
                value={comment} onChange={(e) => setComment(e.target.value)}
                rows={3} className={`${inputCls} resize-none`}
                placeholder="Be specific to help the author understand what to improve…"
              />
            </div>
          )}

          {modal.action === "publish" && modal.resourceType === "book" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">Final Selling Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999] font-body text-[13px]">₹</span>
                  <input value={priceRupees} onChange={(e) => setPriceRupees(e.target.value)} type="number" min="1" step="0.01" className={`${inputCls} pl-8`} placeholder="e.g. 299" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">MRP / Original Price (₹) <span className="font-normal normal-case text-[#b5b0a9]">— optional, shown as crossed-out</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999] font-body text-[13px]">₹</span>
                  <input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} type="number" min="1" step="0.01" className={`${inputCls} pl-8`} placeholder="e.g. 399" />
                </div>
              </div>
            </div>
          )}

          {actionError && (
            <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">{actionError}</div>
          )}

          <div className="flex gap-3 pt-1">
            <AdminButton
              variant={modal.action === "reject" ? "danger" : modal.action === "request_changes" ? "secondary" : "primary"}
              className="flex-1"
              loading={acting}
              loadingText="Processing…"
              disabled={
                acting ||
                ((modal.action === "reject" || modal.action === "request_changes") && !comment) ||
                (modal.action === "publish" && modal.resourceType === "book" && !priceRupees)
              }
              onClick={handleAction}
            >
              {modal.action === "approve"         ? "Confirm Approval"  :
               modal.action === "reject"          ? "Confirm Rejection" :
               modal.action === "request_changes" ? "Send Feedback"     : "Publish Now"}
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setModal((p) => ({ ...p, open: false }))}>
              Cancel
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
