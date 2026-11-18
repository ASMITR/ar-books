"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, Layers, Clock, CheckCircle2,
  AlertCircle, TrendingUp, ArrowRight, PlusCircle,
} from "lucide-react";
import type { Book, Series } from "@/types";
import Link from "next/link";
import { formatINR } from "@/lib/currency";
import { AuthorShell } from "@/components/author/AuthorShell";

const statusStyles: Record<string, string> = {
  draft:            "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
  pending_approval: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  changes_requested:"bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  approved:         "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  published:        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rejected:         "bg-red-50 text-red-700 ring-1 ring-red-200",
  unpublished:      "bg-slate-50 text-slate-400 ring-1 ring-slate-200",
};
const statusLabels: Record<string, string> = {
  draft: "Draft", pending_approval: "Pending Review", changes_requested: "Changes Needed",
  approved: "Approved", published: "Published", rejected: "Rejected", unpublished: "Unpublished",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold font-body ${statusStyles[status] ?? "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

export default function AuthorDashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/author/books").then((r) => r.json()),
      fetch("/api/author/series").then((r) => r.json()),
    ]).then(([bJson, sJson]) => {
      if (bJson.success) setBooks(bJson.data);
      if (sJson.success) setSeries(sJson.data);
    }).finally(() => setLoading(false));
  }, []);

  const counts = {
    total:        books.length,
    draft:        books.filter((b) => b.submissionStatus === "draft").length,
    pending:      books.filter((b) => b.submissionStatus === "pending_approval").length,
    changes:      books.filter((b) => b.submissionStatus === "changes_requested").length,
    published:    books.filter((b) => b.submissionStatus === "published").length,
  };

  const primaryStats = [
    { label: "Total Books",    value: counts.total,     icon: BookOpen,    accent: "#203A2B", bg: "#203A2B" },
    { label: "Published",      value: counts.published, icon: CheckCircle2,accent: "#16a34a", bg: "#16a34a" },
    { label: "Pending Review", value: counts.pending,   icon: Clock,       accent: "#d97706", bg: "#d97706" },
    { label: "Changes Needed", value: counts.changes,   icon: AlertCircle, accent: "#ea580c", bg: "#ea580c" },
    { label: "My Series",      value: series.length,    icon: Layers,      accent: "#6366f1", bg: "#6366f1" },
  ];

  const skeletonCard = (
    <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4 sm:p-5 flex items-center gap-3.5 shadow-sm animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-[#F2F0EC] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[#F2F0EC] rounded w-16" />
        <div className="h-5 bg-[#F2F0EC] rounded w-10" />
      </div>
    </div>
  );

  return (
    <AuthorShell
      title="Dashboard"
      subtitle="Overview of your books and series"
      action={
        <Link
          href="/author/books/new"
          className="inline-flex items-center gap-1.5 bg-[#FFC928] text-[#0D1F17] font-body font-semibold text-[12.5px] px-4 py-2.5 rounded-xl hover:bg-[#FFD54F] transition-colors shadow-sm"
        >
          <PlusCircle size={14} />
          Add Book
        </Link>
      }
    >
      <div className="space-y-5">

        {/* Primary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {loading
            ? [...Array(5)].map((_, i) => <div key={i}>{skeletonCard}</div>)
            : primaryStats.map(({ label, value, icon: Icon, accent, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-[#E8E4DE] p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg + "15" }}>
                  <Icon size={17} style={{ color: accent }} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-body font-semibold uppercase tracking-[0.09em] text-[#b5b0a9] leading-none mb-1.5">{label}</p>
                  <p className="font-heading text-[22px] font-bold text-[#0a0a0a] leading-none">{value}</p>
                </div>
              </div>
            ))
          }
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent books */}
          <div className="lg:col-span-2 bg-white border border-[#E8E4DE] rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#EDE9E3]">
              <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a] tracking-tight">Recent Books</h2>
              <Link href="/author/books" className="inline-flex items-center gap-1 text-[12px] font-body text-[#999] hover:text-[#0a0a0a] font-semibold transition-colors">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div className="divide-y divide-[#F4F1EC]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-5 sm:px-6 py-3.5 flex items-center gap-4 animate-pulse">
                    <div className="flex-1 h-3.5 bg-[#F2F0EC] rounded" />
                    <div className="w-20 h-5 bg-[#F2F0EC] rounded-full" />
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <BookOpen size={26} className="text-[#ddd] mx-auto mb-3" />
                <p className="text-[13px] font-body text-[#bbb]">No books yet. Add your first book.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-body min-w-[460px]">
                  <thead>
                    <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                      <th className="text-left px-5 sm:px-6 py-3 text-[10.5px] uppercase tracking-[0.09em] text-[#b5b0a9] font-semibold">Title</th>
                      <th className="text-left px-4 py-3 text-[10.5px] uppercase tracking-[0.09em] text-[#b5b0a9] font-semibold hidden sm:table-cell">Status</th>
                      <th className="text-left px-4 py-3 text-[10.5px] uppercase tracking-[0.09em] text-[#b5b0a9] font-semibold hidden md:table-cell">Suggested</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F1EC]">
                    {books.slice(0, 6).map((book) => (
                      <tr key={book.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="px-5 sm:px-6 py-3.5">
                          <p className="font-semibold text-[13.5px] text-[#0a0a0a] truncate max-w-[180px]">{book.title}</p>
                          {book.ownerFeedback && (
                            <p className="text-[11px] text-orange-600 mt-0.5 truncate max-w-[180px]">↳ {book.ownerFeedback}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <StatusPill status={book.submissionStatus ?? "draft"} />
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[#777] hidden md:table-cell">
                          {book.suggestedPriceRupees ? formatINR(book.suggestedPriceRupees) : <span className="text-[#ddd]">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link href={`/author/books/${book.id}`} className="inline-flex items-center gap-1 bg-[#F5F2EE] text-[#555] hover:bg-[#EAE6E0] hover:text-[#0a0a0a] transition-all rounded-md text-xs px-2.5 py-1.5 font-semibold font-body">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Quick actions */}
            <div className="bg-white border border-[#E8E4DE] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#EDE9E3]">
                <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a] tracking-tight">Quick Actions</h2>
              </div>
              <div className="p-2">
                {[
                  { href: "/author/books/new",   label: "Add New Book",  icon: PlusCircle, color: "#203A2B" },
                  { href: "/author/series/new",   label: "New Series",    icon: Layers,     color: "#6366f1" },
                  { href: "/author/submissions",  label: "My Submissions",icon: Clock,      color: "#d97706" },
                ].map(({ href, label, icon: Icon, color }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#FAF9F6] transition-colors group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "15" }}>
                      <Icon size={14} style={{ color }} strokeWidth={2} />
                    </div>
                    <span className="text-[13px] font-body text-[#666] group-hover:text-[#0a0a0a] font-medium transition-colors">{label}</span>
                    <ArrowRight size={11} className="ml-auto text-[#D0CCC6] group-hover:text-[#999] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 shadow-sm">
              <p className="text-[10.5px] font-body font-semibold text-[#b5b0a9] uppercase tracking-[0.09em] mb-4">Summary</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Draft books",   value: counts.draft    },
                  { label: "Total series",  value: series.length   },
                  { label: "In review",     value: counts.pending  },
                  { label: "Published",     value: counts.published},
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[12.5px] font-body text-[#999]">{label}</span>
                    <span className="text-[15px] font-heading font-bold text-[#0a0a0a]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Changes needed callout */}
        {!loading && counts.changes > 0 && (
          <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle size={17} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-[14px] text-orange-800">
                {counts.changes} book{counts.changes > 1 ? "s" : ""} need{counts.changes === 1 ? "s" : ""} your attention
              </p>
              <p className="text-[13px] font-body text-orange-700 mt-1 leading-relaxed">
                The owner has requested changes. Review the feedback and resubmit.
              </p>
              <Link href="/author/submissions" className="mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-body font-semibold text-orange-700 hover:text-orange-900 transition-colors">
                View submissions <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        )}

      </div>
    </AuthorShell>
  );
}
