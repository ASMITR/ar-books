"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Layers, Edit2, Send, Trash2, Eye } from "lucide-react";
import type { Series } from "@/types";
import Link from "next/link";
import { AuthorShell } from "@/components/author/AuthorShell";

const statusStyles: Record<string, string> = {
  draft:            "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
  pending_approval: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  changes_requested:"bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  approved:         "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  published:        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rejected:         "bg-red-50 text-red-700 ring-1 ring-red-200",
};
const statusLabels: Record<string, string> = {
  draft: "Draft", pending_approval: "Pending Review", changes_requested: "Changes Needed",
  approved: "Approved", published: "Published", rejected: "Rejected",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold font-body ${statusStyles[status] ?? "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

export default function AuthorSeriesPage() {
  const [series, setSeries]     = useState<Series[]>([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/author/series");
    const json = await res.json();
    if (json.success) setSeries(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  const handleSubmit = async (id: string) => {
    setSubmitting(id); setError(null);
    try {
      const res  = await fetch(`/api/author/series/${id}/submit`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Submission failed");
      await fetchSeries();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setSubmitting(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this draft series? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/author/series/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      await fetchSeries();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setDeleting(null); }
  };

  return (
    <AuthorShell
      title="My Series"
      subtitle={`${series.length} series total`}
      action={
        <Link
          href="/author/series/new"
          className="inline-flex items-center gap-1.5 bg-[#FFC928] text-[#0D1F17] font-body font-semibold text-[12.5px] px-4 py-2.5 rounded-xl hover:bg-[#FFD54F] transition-colors shadow-sm"
        >
          <PlusCircle size={14} />
          New Series
        </Link>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#E6E3DD] rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="divide-y divide-[#F2F0EC]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-5 sm:px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="flex-1 h-4 bg-[#F2F0EC] rounded w-40" />
                  <div className="w-20 h-5 bg-[#F2F0EC] rounded-full" />
                </div>
              ))}
            </div>
          ) : series.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-xl bg-[#F2F0EC] flex items-center justify-center mx-auto mb-4">
                <Layers size={24} className="text-[#ccc]" />
              </div>
              <p className="text-[15px] font-body text-[#bbb] mb-3">No series yet.</p>
              <Link
                href="/author/series/new"
                className="inline-flex items-center gap-1.5 bg-[#FFC928] text-[#0D1F17] font-body font-semibold text-[12.5px] px-4 py-2.5 rounded-xl hover:bg-[#FFD54F] transition-colors"
              >
                <PlusCircle size={13} /> Create your first series
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-body min-w-[460px]">
                <thead>
                  <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                    <th className="text-left px-5 sm:px-6 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Name</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold hidden sm:table-cell">Status</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold hidden md:table-cell">Genre</th>
                    <th className="text-right px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F0EC]">
                  {series.map((s) => {
                    const editable = s.submissionStatus === "draft" || s.submissionStatus === "changes_requested";
                    return (
                      <tr key={s.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="px-5 sm:px-6 py-4">
                          <p className="font-semibold text-[14px] text-[#0a0a0a] truncate max-w-[200px]">{s.name}</p>
                          {s.ownerFeedback && (
                            <p className="text-[11.5px] text-orange-600 mt-0.5 truncate max-w-[200px]">↳ {s.ownerFeedback}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <StatusPill status={s.submissionStatus ?? "draft"} />
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#777] hidden md:table-cell">
                          {s.genre ?? <span className="text-[#ddd]">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 justify-end">
                            <Link href={`/author/series/${s.id}`} title="View"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-[#203A2B] hover:bg-[#F5F2EE] transition-all">
                              <Eye size={13} />
                            </Link>
                            {editable && (
                              <>
                                <Link href={`/author/series/${s.id}/edit`} title="Edit"
                                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-[#203A2B] hover:bg-[#F5F2EE] transition-all">
                                  <Edit2 size={13} />
                                </Link>
                                <button onClick={() => handleSubmit(s.id)} disabled={submitting === s.id} title="Submit"
                                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40 transition-all">
                                  <Send size={13} className={submitting === s.id ? "animate-pulse" : ""} />
                                </button>
                              </>
                            )}
                            {s.submissionStatus === "draft" && (
                              <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} title="Delete"
                                className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-all">
                                <Trash2 size={13} />
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
      </div>
    </AuthorShell>
  );
}
