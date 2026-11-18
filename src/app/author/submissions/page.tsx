"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle, CheckCircle2, XCircle, Eye } from "lucide-react";
import type { Book, Series } from "@/types";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    draft:            { label: "Draft",            icon: Clock,         className: "bg-gray-100 text-gray-600"     },
    pending_approval: { label: "Pending Review",   icon: Clock,         className: "bg-yellow-100 text-yellow-700" },
    changes_requested:{ label: "Changes Needed",   icon: AlertCircle,   className: "bg-orange-100 text-orange-700" },
    approved:         { label: "Approved",         icon: CheckCircle2,  className: "bg-blue-100 text-blue-700"     },
    published:        { label: "Published",        icon: CheckCircle2,  className: "bg-green-100 text-green-700"   },
    rejected:         { label: "Rejected",         icon: XCircle,       className: "bg-red-100 text-red-700"       },
    unpublished:      { label: "Unpublished",      icon: Clock,         className: "bg-gray-100 text-gray-500"     },
  };
  const cfg = map[status] ?? { label: status, icon: Clock, className: "bg-gray-100 text-gray-600" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

export default function SubmissionsPage() {
  const [books, setBooks] = useState<Book[]>([]);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#080808]">Submissions</h1>
        <p className="text-sm text-[#888] mt-1">Track the status of your submitted books and series.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0EDE7] p-1 rounded-xl w-fit">
        {(["books", "series"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? "bg-white text-[#080808] shadow-sm" : "text-[#666] hover:text-[#080808]"
            }`}
          >
            {t} ({t === "books" ? books.length : series.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-10 text-center">
          <p className="text-[#888] text-sm">No {tab} submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const title = "title" in item ? item.title : (item as Series).name;
            const status = item.submissionStatus ?? "draft";
            const feedback = item.ownerFeedback;
            const href = tab === "books" ? `/author/books/${item.id}` : `/author/series/${item.id}`;
            return (
              <div key={item.id} className="bg-white border border-[#E6E3DD] rounded-xl p-4 hover:border-[#CCC] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-[#080808] truncate">{title}</p>
                      <StatusBadge status={status} />
                    </div>
                    {feedback && (
                      <div className={`mt-2 p-3 rounded-lg text-xs ${
                        status === "changes_requested" ? "bg-orange-50 text-orange-700 border border-orange-100" :
                        status === "rejected" ? "bg-red-50 text-red-700 border border-red-100" :
                        "bg-gray-50 text-gray-600 border border-gray-100"
                      }`}>
                        <span className="font-semibold">Owner feedback: </span>
                        {feedback}
                      </div>
                    )}
                    <p className="text-xs text-[#999] mt-2">
                      Updated {new Date(item.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <Link href={href} className="shrink-0 p-2 rounded-lg hover:bg-[#F0EDE7] text-[#789185] hover:text-[#080808] transition-colors">
                    <Eye size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
