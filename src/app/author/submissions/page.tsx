"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle, CheckCircle2, XCircle, Eye, ArrowRight } from "lucide-react";
import type { Book, Series } from "@/types";
import Link from "next/link";
import { AuthorShell } from "@/components/author/AuthorShell";

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  pending_approval:  { label: "Pending Review",    cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",   dot: "bg-amber-400"   },
  changes_requested: { label: "Changes Needed",    cls: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",dot: "bg-orange-400"  },
  approved:          { label: "Approved",           cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",      dot: "bg-blue-500"    },
  published:         { label: "Published",          cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  rejected:          { label: "Rejected",           cls: "bg-red-50 text-red-700 ring-1 ring-red-200",         dot: "bg-red-500"     },
  unpublished:       { label: "Unpublished",        cls: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",   dot: "bg-slate-400"   },
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

export default function SubmissionsPage() {
  const [books, setBooks]   = useState<Book[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"books" | "series">("books");

  useEffect(() => {
    Promise.all([
      fetch("/api/author/books").then((r) => r.json()),
      fetch("/api/author/series").then((r) => r.json()),
    ]).then(([bJson, sJson]) => {
      if (bJson.success) setBooks(bJson.data.filter((b: Book) => b.submissionStatus !== "draft"));
      if (sJson.success) setSeries(sJson.data.filter((s: Series) => s.submissionStatus !== "draft"));
    }).finally(() => setLoading(false));
  }, []);

  const items = tab === "books" ? books : series;

  return (
    <AuthorShell
      title="Submissions"
      subtitle="Track the review status of your books and series"
    >
      <div className="space-y-5">

        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {(["books", "series"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`inline-flex items-center text-[12px] font-body font-semibold px-3.5 py-2 rounded-lg border transition-all capitalize ${
                tab === t
                  ? "bg-[#FFC928] text-[#080808] border-[#FFC928] shadow-sm"
                  : "border-[#E6E3DD] text-[#888] hover:border-[#bbb] hover:text-[#444] bg-white"
              }`}
            >
              {t} ({t === "books" ? books.length : series.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E8E4DE] rounded-2xl p-5 animate-pulse">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F2F0EC] rounded w-48" />
                    <div className="h-3 bg-[#F2F0EC] rounded w-32" />
                  </div>
                  <div className="w-24 h-5 bg-[#F2F0EC] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-[#E6E3DD] rounded-2xl py-20 text-center shadow-sm">
            <Clock size={28} className="text-[#ddd] mx-auto mb-3" />
            <p className="text-[14px] font-body text-[#bbb]">No {tab} submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const title    = "title" in item ? item.title : (item as Series).name;
              const status   = item.submissionStatus ?? "draft";
              const feedback = item.ownerFeedback;
              const href     = tab === "books" ? `/author/books/${item.id}` : `/author/series/${item.id}`;
              const isNeedsAction = status === "changes_requested" || status === "rejected";
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition-colors ${isNeedsAction ? "border-orange-200 bg-orange-50/30" : "border-[#E8E4DE] hover:border-[#D0CCC6]"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="font-heading font-bold text-[14.5px] text-[#0a0a0a] truncate">{title}</p>
                        <StatusPill status={status} />
                      </div>

                      {feedback && (
                        <div className={`px-3.5 py-2.5 rounded-xl text-[12.5px] font-body leading-relaxed ${
                          status === "changes_requested" ? "bg-orange-100/70 text-orange-800 border border-orange-200" :
                          status === "rejected"          ? "bg-red-50 text-red-700 border border-red-200" :
                          "bg-[#F7F5F2] text-[#666] border border-[#E8E4DE]"
                        }`}>
                          <span className="font-semibold">Owner feedback: </span>{feedback}
                        </div>
                      )}

                      <p className="text-[11.5px] font-body text-[#aaa]">
                        Updated {new Date(item.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>

                    <Link
                      href={href}
                      className="shrink-0 inline-flex items-center gap-1 bg-[#F5F2EE] text-[#555] hover:bg-[#EAE6E0] hover:text-[#0a0a0a] transition-all rounded-lg text-xs px-2.5 py-1.5 font-semibold font-body"
                    >
                      View <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AuthorShell>
  );
}
