"use client";

import { useState, useEffect } from "react";
import { BookOpen, Layers, Clock, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import type { Book, Series } from "@/types";
import Link from "next/link";
import { formatINR } from "@/lib/currency";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:            { label: "Draft",            className: "bg-gray-100 text-gray-600"  },
    pending_approval: { label: "Pending Review",   className: "bg-yellow-100 text-yellow-700" },
    changes_requested:{ label: "Changes Needed",   className: "bg-orange-100 text-orange-700" },
    approved:         { label: "Approved",         className: "bg-blue-100 text-blue-700"  },
    published:        { label: "Published",        className: "bg-green-100 text-green-700" },
    rejected:         { label: "Rejected",         className: "bg-red-100 text-red-700"   },
    unpublished:      { label: "Unpublished",      className: "bg-gray-100 text-gray-500"  },
  };
  const cfg = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
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
    total: books.length,
    draft: books.filter((b) => b.submissionStatus === "draft").length,
    pending: books.filter((b) => b.submissionStatus === "pending_approval").length,
    changesNeeded: books.filter((b) => b.submissionStatus === "changes_requested").length,
    published: books.filter((b) => b.submissionStatus === "published").length,
  };

  const stats = [
    { label: "Total Books",     value: counts.total,        icon: BookOpen,       color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Published",       value: counts.published,    icon: CheckCircle2,   color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Pending Review",  value: counts.pending,      icon: Clock,          color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Changes Needed",  value: counts.changesNeeded,icon: AlertCircle,    color: "text-orange-600", bg: "bg-orange-50" },
    { label: "My Series",       value: series.length,       icon: Layers,         color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#080808]">Author Dashboard</h1>
        <p className="text-sm text-[#888] mt-1">Manage your books and series submissions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[#E6E3DD] rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-[#080808]">{s.value}</p>
            <p className="text-xs text-[#888] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/author/books/new" className="flex items-center gap-4 bg-[#080808] text-white rounded-xl p-5 hover:bg-[#111] transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-[#FFC928] flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-[#080808]" />
          </div>
          <div>
            <p className="font-semibold text-sm">Add New Book</p>
            <p className="text-xs text-white/50 mt-0.5">Start a new draft</p>
          </div>
        </Link>
        <Link href="/author/series/new" className="flex items-center gap-4 bg-white border border-[#E6E3DD] rounded-xl p-5 hover:border-[#080808] transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-[#F4F2EE] flex items-center justify-center shrink-0">
            <Layers size={18} className="text-[#080808]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#080808]">New Series</p>
            <p className="text-xs text-[#888] mt-0.5">Create a book series</p>
          </div>
        </Link>
      </div>

      {/* Recent books */}
      {books.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#080808]">Recent Books</h2>
            <Link href="/author/books" className="text-sm text-[#789185] hover:underline">View all</Link>
          </div>
          <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE7]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider hidden md:table-cell">Suggested Price</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE7]">
                {books.slice(0, 8).map((book) => (
                  <tr key={book.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#080808] max-w-[200px] truncate">{book.title}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <StatusBadge status={book.submissionStatus ?? "draft"} />
                    </td>
                    <td className="px-5 py-3.5 text-[#555] hidden md:table-cell">
                      {book.suggestedPriceRupees ? formatINR(book.suggestedPriceRupees) : <span className="text-[#bbb]">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/author/books/${book.id}`} className="text-xs text-[#789185] hover:text-[#080808] font-medium flex items-center gap-1 justify-end">
                        <Eye size={13} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Changes requested callout */}
      {counts.changesNeeded > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-start gap-4">
          <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800">
              {counts.changesNeeded} book{counts.changesNeeded > 1 ? "s" : ""} need{counts.changesNeeded === 1 ? "s" : ""} your attention
            </p>
            <p className="text-sm text-orange-700 mt-1">The owner has requested changes. Review the feedback and resubmit.</p>
            <Link href="/author/submissions" className="mt-2 inline-block text-sm font-semibold text-orange-700 hover:underline">
              View submissions →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
