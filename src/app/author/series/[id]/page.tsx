"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Edit2, Send, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Series } from "@/types";
import Link from "next/link";

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  draft:            { label: "Draft",          cls: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",      dot: "bg-slate-400"   },
  pending_approval: { label: "Pending Review", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       dot: "bg-amber-400"   },
  changes_requested:{ label: "Changes Needed", cls: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",    dot: "bg-orange-400"  },
  approved:         { label: "Approved",        cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",          dot: "bg-blue-500"    },
  published:        { label: "Published",       cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  rejected:         { label: "Rejected",        cls: "bg-red-50 text-red-700 ring-1 ring-red-200",             dot: "bg-red-500"     },
};

function StatusPill({ status }: { status: string }) {
  const cfg = statusConfig[status];
  if (!cfg) return <span className="inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold font-body bg-gray-100 text-gray-600 ring-1 ring-gray-200">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full font-semibold font-body ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function AuthorSeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }         = use(params);
  const [series, setSeries]         = useState<Series | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchSeries = async () => {
    const res  = await fetch(`/api/author/series/${id}`);
    const json = await res.json();
    if (json.success) setSeries(json.data);
    else setNotFound(true);
  };

  useEffect(() => { fetchSeries().finally(() => setLoading(false)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitError(null);
    try {
      const res  = await fetch(`/api/author/series/${id}/submit`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Submission failed");
      setSubmitSuccess(true);
      await fetchSeries();
    } catch (e) { setSubmitError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      <div className="shrink-0 bg-white border-b border-[#E8E4DE] h-16 animate-pulse" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-2xl mx-auto w-full">
        {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-[#E8E4DE]" />)}
      </div>
    </div>
  );

  if (notFound || !series) return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      <div className="p-8 text-center"><p className="font-body text-[#bbb]">Series not found or you don&apos;t have access.</p></div>
    </div>
  );

  const status   = series.submissionStatus ?? "draft";
  const editable = status === "draft" || status === "changes_requested";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      <div className="shrink-0 bg-white border-b border-[#E8E4DE] px-5 sm:px-7 lg:px-8" style={{ minHeight: 64 }}>
        <div className="flex items-center justify-between gap-4 h-full py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/author/series" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#999] hover:text-[#0a0a0a] hover:bg-[#F0EEE9] transition-all shrink-0">
              <ArrowLeft size={15} />
            </Link>
            <h1 className="font-heading text-[18px] sm:text-[21px] font-bold text-[#0a0a0a] leading-tight tracking-tight truncate">{series.name}</h1>
          </div>
          <div className="shrink-0"><StatusPill status={status} /></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-5">

          {series.ownerFeedback && (
            <div className={`rounded-2xl p-5 border flex gap-4 ${status === "changes_requested" ? "bg-orange-50 border-orange-200" : status === "rejected" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${status === "changes_requested" ? "bg-orange-100" : status === "rejected" ? "bg-red-100" : "bg-blue-100"}`}>
                <AlertCircle size={16} className={status === "changes_requested" ? "text-orange-500" : status === "rejected" ? "text-red-500" : "text-blue-500"} />
              </div>
              <div>
                <p className={`text-[13px] font-body font-semibold ${status === "changes_requested" ? "text-orange-800" : status === "rejected" ? "text-red-800" : "text-blue-800"}`}>
                  {status === "rejected" ? "Rejection reason" : "Owner feedback"}
                </p>
                <p className={`text-[13px] font-body mt-1 leading-relaxed ${status === "changes_requested" ? "text-orange-700" : status === "rejected" ? "text-red-700" : "text-blue-700"}`}>
                  {series.ownerFeedback}
                </p>
              </div>
            </div>
          )}

          {submitError  && <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">{submitError}</div>}
          {submitSuccess && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <p className="text-[13px] font-body text-emerald-700">Series submitted for owner review.</p>
            </div>
          )}

          <div className="bg-white border border-[#E8E4DE] rounded-2xl overflow-hidden shadow-sm">
            <div className="flex gap-5 p-5 sm:p-6 border-b border-[#EDE9E3]">
              {series.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={series.coverImageUrl} alt={series.name} className="w-24 h-32 object-cover rounded-xl border border-[#E8E4DE] shadow-sm shrink-0" />
              ) : (
                <div className="w-24 h-32 rounded-xl bg-[#F7F5F2] border-2 border-dashed border-[#E2DDD8] flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-body text-[#C4BFB9] uppercase tracking-wider">No cover</span>
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-2 pt-1">
                <h2 className="font-heading font-bold text-[#0a0a0a] text-[16px]">{series.name}</h2>
                {series.genre && <p className="text-[12.5px] font-body text-[#777]">Genre: {series.genre}</p>}
                {series.plannedBooks && <p className="text-[12.5px] font-body text-[#777]">{series.plannedBooks} planned books</p>}
              </div>
            </div>
            {series.description && (
              <div className="px-5 sm:px-6 py-4">
                <p className="text-[10.5px] font-body font-semibold uppercase tracking-[0.09em] text-[#b5b0a9] mb-2">Description</p>
                <p className="text-[13px] font-body text-[#555] leading-relaxed">{series.description}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {editable && (
              <Link href={`/author/series/${id}/edit`}
                className="inline-flex items-center gap-2 bg-white border border-[#E8E4DE] text-[#0a0a0a] font-body font-semibold text-[12.5px] px-4 py-2.5 rounded-xl hover:border-[#203A2B] transition-colors shadow-sm">
                <Edit2 size={13} /> Edit Series
              </Link>
            )}
            {editable && !submitSuccess && (
              <button onClick={handleSubmit} disabled={submitting}
                className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body font-bold text-[12.5px] uppercase tracking-[0.09em] px-5 py-2.5 rounded-xl hover:bg-[#203A2B] disabled:opacity-50 transition-colors shadow-sm">
                {submitting ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Send size={13} />}
                {submitting ? "Submitting…" : "Submit for Approval"}
              </button>
            )}
            {status === "published" && series.slug && (
              <Link href={`/series/${series.slug}`} target="_blank"
                className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-body font-semibold text-[12.5px] px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm">
                <Eye size={13} /> View Live
              </Link>
            )}
          </div>

          <p className="text-[11.5px] font-body text-[#aaa]">
            Last updated {new Date(series.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>

        </div>
      </div>
    </div>
  );
}
