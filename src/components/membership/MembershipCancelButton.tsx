"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, AlertCircle } from "lucide-react";

export function MembershipCancelButton({ periodEnd }: { periodEnd: string }) {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [reason,  setReason]  = useState("");

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/membership/cancel", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ cancelAtPeriodEnd: true, reason: reason || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Cancellation failed. Please try again.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const accessUntil = new Date(periodEnd).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-body text-[12px] font-semibold text-[#777970] hover:text-red-600 transition-colors underline underline-offset-2 decoration-dashed"
      >
        Cancel membership
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setOpen(false)}>
          <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            <div className="px-6 py-5 border-b border-[#EDEBE6]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle size={18} className="text-red-600" />
                </div>
                <h2 className="font-heading text-[18px] font-bold text-[#1a1a1a]">Cancel Membership</h2>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-200 rounded-sm px-4 py-3">
                <AlertCircle size={14} className="text-orange-600 shrink-0 mt-0.5" />
                <p className="font-body text-[12px] text-orange-800 leading-relaxed">
                  Your membership will be cancelled at the end of your current billing period.
                  You will retain full access until <strong>{accessUntil}</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[#A8B5A0]">
                  Reason (optional)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="border border-[#E6DFD5] bg-[#FFFCF7] px-3 py-2.5 text-[13px] font-body text-[#555] focus:outline-none focus:border-[#203A2B] rounded-sm"
                >
                  <option value="">Select a reason</option>
                  <option value="too_expensive">Too expensive</option>
                  <option value="not_enough_books">Not enough books I want</option>
                  <option value="technical_issues">Technical issues</option>
                  <option value="temporary_pause">Temporary pause</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {error && (
                <p className="font-body text-[12px] text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-sm">{error}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#EDEBE6] flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-[#E6DFD5] text-[#555] font-body text-[11px] font-bold uppercase tracking-[0.14em] py-3 rounded-sm hover:border-[#203A2B] hover:text-[#203A2B] transition-colors"
              >
                Keep Membership
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-red-600 text-white font-body text-[11px] font-bold uppercase tracking-[0.14em] py-3 rounded-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
