"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminModal } from "@/components/admin/AdminModal";
import { Clock, CheckCircle2, XCircle, MessageSquare, Eye, DollarSign, Send, RefreshCw } from "lucide-react";
import type { Book, Series } from "@/types";
import Link from "next/link";
import { formatINR } from "@/lib/currency";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending_approval:  { label: "Pending Review",   className: "bg-yellow-100 text-yellow-700" },
    changes_requested: { label: "Changes Requested", className: "bg-orange-100 text-orange-700" },
    approved:          { label: "Approved",          className: "bg-blue-100 text-blue-700"     },
  };
  const cfg = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
}

type ResourceType = "book" | "series";

interface ActionModalState {
  open: boolean;
  resourceId: string;
  resourceType: ResourceType;
  resourceTitle: string;
  currentStatus: string;
  action: "approve" | "reject" | "request_changes" | "publish" | null;
}

export default function AdminApprovalsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"books" | "series">("books");
  const [actionModal, setActionModal] = useState<ActionModalState>({
    open: false, resourceId: "", resourceType: "book", resourceTitle: "", currentStatus: "", action: null,
  });
  const [comment, setComment] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/approvals");
    const json = await res.json();
    if (json.success) {
      setBooks(json.data.books);
      setSeries(json.data.series);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAction = (
    id: string,
    type: ResourceType,
    title: string,
    status: string,
    action: ActionModalState["action"]
  ) => {
    setComment("");
    setPriceRupees("");
    setOriginalPrice("");
    setActionError(null);
    setActionModal({ open: true, resourceId: id, resourceType: type, resourceTitle: title, currentStatus: status, action });
  };

  const handleAction = async () => {
    if (!actionModal.action) return;
    setActing(true);
    setActionError(null);
    try {
      const payload: Record<string, unknown> = {
        action: actionModal.action,
        resourceType: actionModal.resourceType,
      };
      if (actionModal.action === "reject") payload.reason = comment;
      if (actionModal.action === "request_changes") payload.comment = comment;
      if (actionModal.action === "publish" && priceRupees) {
        payload.priceRupees = parseFloat(priceRupees);
        if (originalPrice) payload.originalPriceRupees = parseFloat(originalPrice);
      }

      const res = await fetch(`/api/admin/approvals/${actionModal.resourceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(typeof json.error === "string" ? json.error : JSON.stringify(json.error));

      setActionModal((p) => ({ ...p, open: false }));
      await fetchData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(false);
    }
  };

  const items = tab === "books" ? books : series;

  return (
    <AdminShell
      title="Approvals"
      subtitle={`${books.length + series.length} submissions awaiting review`}
      action={
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E6E3DD] text-sm text-[#555] hover:border-[#080808] transition-colors">
          <RefreshCw size={14} />
          Refresh
        </button>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0EDE7] p-1 rounded-xl w-fit mb-6">
        {(["books", "series"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-white text-[#080808] shadow-sm" : "text-[#666] hover:text-[#080808]"}`}>
            {t} ({t === "books" ? books.length : series.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-10 text-center">
          <CheckCircle2 size={28} className="text-green-400 mx-auto mb-3" />
          <p className="text-[#888] text-sm">No pending {tab}. All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const title = "title" in item ? item.title : (item as Series).name;
            const status = item.submissionStatus ?? "";
            return (
              <div key={item.id} className="bg-white border border-[#E6E3DD] rounded-xl p-5 hover:border-[#CCC] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-[#080808] truncate">{title}</p>
                      <StatusBadge status={status} />
                    </div>
                    {"author" in item && <p className="text-xs text-[#888]">by {item.author}</p>}
                    {item.ownerFeedback && (
                      <p className="text-xs text-orange-600 mt-1">Previous feedback: {item.ownerFeedback}</p>
                    )}
                    {tab === "books" && (item as Book).suggestedPriceRupees && (
                      <p className="text-xs text-[#888] mt-1">
                        Suggested price: {formatINR((item as Book).suggestedPriceRupees!)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                    {/* Approve */}
                    {status === "pending_approval" && (
                      <button
                        onClick={() => openAction(item.id, tab === "books" ? "book" : "series", title, status, "approve")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <CheckCircle2 size={12} /> Approve
                      </button>
                    )}
                    {/* Request changes */}
                    {status === "pending_approval" && (
                      <button
                        onClick={() => openAction(item.id, tab === "books" ? "book" : "series", title, status, "request_changes")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                      >
                        <MessageSquare size={12} /> Request Changes
                      </button>
                    )}
                    {/* Reject */}
                    {["pending_approval", "changes_requested"].includes(status) && (
                      <button
                        onClick={() => openAction(item.id, tab === "books" ? "book" : "series", title, status, "reject")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    )}
                    {/* Publish (approved books/series) */}
                    {status === "approved" && (
                      <button
                        onClick={() => openAction(item.id, tab === "books" ? "book" : "series", title, status, "publish")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        <Send size={12} /> Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal */}
      <AdminModal
        open={actionModal.open}
        onClose={() => setActionModal((p) => ({ ...p, open: false }))}
        title={
          actionModal.action === "approve" ? "Approve Submission" :
          actionModal.action === "reject" ? "Reject Submission" :
          actionModal.action === "request_changes" ? "Request Changes" :
          "Publish"
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[#555]">
            {actionModal.action === "approve" && <>Approve <strong>"{actionModal.resourceTitle}"</strong>? The author will be notified. The {actionModal.resourceType} won't be live until you publish it.</>}
            {actionModal.action === "reject" && <>Reject <strong>"{actionModal.resourceTitle}"</strong>? Please provide a reason.</>}
            {actionModal.action === "request_changes" && <>Request changes for <strong>"{actionModal.resourceTitle}"</strong>? The author will see your comment.</>}
            {actionModal.action === "publish" && <>Publish <strong>"{actionModal.resourceTitle}"</strong>? This will make it live on the website.</>}
          </p>

          {(actionModal.action === "reject" || actionModal.action === "request_changes") && (
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">
                {actionModal.action === "reject" ? "Rejection reason *" : "Comments for author *"}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30"
                placeholder="Be specific to help the author improve…"
              />
            </div>
          )}

          {actionModal.action === "publish" && actionModal.resourceType === "book" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#555] mb-1.5">Final Selling Price (₹) *</label>
                <input
                  value={priceRupees}
                  onChange={(e) => setPriceRupees(e.target.value)}
                  type="number"
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30"
                  placeholder="e.g. 299"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#555] mb-1.5">Original Price / MRP (₹) — optional</label>
                <input
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  type="number"
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30"
                  placeholder="e.g. 399"
                />
              </div>
            </div>
          )}

          {actionError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{actionError}</div>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleAction}
              disabled={
                acting ||
                ((actionModal.action === "reject" || actionModal.action === "request_changes") && !comment) ||
                (actionModal.action === "publish" && actionModal.resourceType === "book" && !priceRupees)
              }
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors ${
                actionModal.action === "reject" ? "bg-red-600 text-white hover:bg-red-700" :
                actionModal.action === "request_changes" ? "bg-orange-500 text-white hover:bg-orange-600" :
                "bg-[#080808] text-white hover:bg-[#111]"
              }`}
            >
              {acting ? "Processing…" : (
                actionModal.action === "approve" ? "Confirm Approval" :
                actionModal.action === "reject" ? "Confirm Rejection" :
                actionModal.action === "request_changes" ? "Send Feedback" :
                "Publish Now"
              )}
            </button>
            <button onClick={() => setActionModal((p) => ({ ...p, open: false }))} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#666] hover:bg-[#F0EDE7] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
