"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Layers, Eye, Edit2, Send, Trash2 } from "lucide-react";
import type { Series } from "@/types";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:            { label: "Draft",          className: "bg-gray-100 text-gray-600"     },
    pending_approval: { label: "Pending Review", className: "bg-yellow-100 text-yellow-700" },
    changes_requested:{ label: "Changes Needed", className: "bg-orange-100 text-orange-700" },
    approved:         { label: "Approved",       className: "bg-blue-100 text-blue-700"     },
    published:        { label: "Published",      className: "bg-green-100 text-green-700"   },
    rejected:         { label: "Rejected",       className: "bg-red-100 text-red-700"       },
  };
  const cfg = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
}

export default function AuthorSeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/author/series");
    const json = await res.json();
    if (json.success) setSeries(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  const handleSubmit = async (seriesId: string) => {
    setSubmitting(seriesId);
    setError(null);
    try {
      const res = await fetch(`/api/author/series/${seriesId}/submit`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Submission failed");
      await fetchSeries();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDelete = async (seriesId: string) => {
    if (!confirm("Delete this draft series? This cannot be undone.")) return;
    setDeleting(seriesId);
    try {
      const res = await fetch(`/api/author/series/${seriesId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      await fetchSeries();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#080808]">My Series</h1>
          <p className="text-sm text-[#888] mt-1">{series.length} series total</p>
        </div>
        <Link href="/author/series/new" className="flex items-center gap-2 bg-[#080808] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#111] transition-colors shrink-0">
          <PlusCircle size={15} /> New Series
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : series.length === 0 ? (
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-12 text-center">
          <Layers size={28} className="text-[#CCC] mx-auto mb-3" />
          <p className="font-semibold text-[#080808]">No series yet</p>
          <p className="text-sm text-[#888] mt-1 mb-4">Create your first book series.</p>
          <Link href="/author/series/new" className="inline-flex items-center gap-2 bg-[#FFC928] text-[#080808] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-colors">
            <PlusCircle size={14} /> New Series
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0EDE7]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase hidden sm:table-cell">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#888] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE7]">
              {series.map((s) => {
                const isEditable = s.submissionStatus === "draft" || s.submissionStatus === "changes_requested";
                return (
                  <tr key={s.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#080808]">{s.name}</div>
                      {s.ownerFeedback && <div className="text-xs text-orange-600 mt-0.5">Feedback: {s.ownerFeedback}</div>}
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <StatusBadge status={s.submissionStatus ?? "draft"} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {isEditable && (
                          <>
                            <Link href={`/author/series/${s.id}/edit`} className="p-1.5 rounded-lg text-[#789185] hover:bg-[#F0EDE7] hover:text-[#080808] transition-colors" title="Edit">
                              <Edit2 size={14} />
                            </Link>
                            <button onClick={() => handleSubmit(s.id)} disabled={submitting === s.id} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 disabled:opacity-50 transition-colors" title="Submit for approval">
                              <Send size={14} className={submitting === s.id ? "animate-pulse" : ""} />
                            </button>
                          </>
                        )}
                        {s.submissionStatus === "draft" && (
                          <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-50 transition-colors" title="Delete draft">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
