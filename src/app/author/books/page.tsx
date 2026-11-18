"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, BookOpen, Eye, Edit2, Send, Trash2 } from "lucide-react";
import type { Book } from "@/types";
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

const filters = [
  { key: "all",               label: "All"           },
  { key: "draft",             label: "Drafts"        },
  { key: "pending_approval",  label: "Pending"       },
  { key: "changes_requested", label: "Changes Needed"},
  { key: "approved",          label: "Approved"      },
  { key: "published",         label: "Published"     },
];

export default function AuthorBooksPage() {
  const [books, setBooks]       = useState<Book[]>([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState("all");

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/author/books");
    const json = await res.json();
    if (json.success) setBooks(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleSubmit = async (bookId: string) => {
    setSubmitting(bookId); setError(null);
    try {
      const res  = await fetch(`/api/author/books/${bookId}/submit`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Submission failed");
      await fetchBooks();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setSubmitting(null); }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("Delete this draft book? This cannot be undone.")) return;
    setDeleting(bookId);
    try {
      const res  = await fetch(`/api/author/books/${bookId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      await fetchBooks();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setDeleting(null); }
  };

  const filtered = filter === "all" ? books : books.filter((b) => b.submissionStatus === filter);
  const published = books.filter((b) => b.submissionStatus === "published").length;

  return (
    <AuthorShell
      title="My Books"
      subtitle={`${books.length} total · ${published} published`}
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
      <div className="space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center text-[12px] font-body font-semibold px-3.5 py-2 rounded-lg border transition-all outline-none ${
                filter === f.key
                  ? "bg-[#FFC928] text-[#080808] border-[#FFC928] shadow-sm"
                  : "border-[#E6E3DD] text-[#888] hover:border-[#bbb] hover:text-[#444] bg-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E6E3DD] rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="divide-y divide-[#F2F0EC]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-5 sm:px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-[#F2F0EC] rounded w-48" />
                    <div className="h-3 bg-[#F2F0EC] rounded w-28" />
                  </div>
                  <div className="w-20 h-5 bg-[#F2F0EC] rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-xl bg-[#F2F0EC] flex items-center justify-center mx-auto mb-4">
                <BookOpen size={24} className="text-[#ccc]" />
              </div>
              <p className="text-[15px] font-body text-[#bbb] mb-3">
                {filter === "all" ? "No books yet." : `No books in "${statusLabels[filter] ?? filter}".`}
              </p>
              {filter === "all" && (
                <Link
                  href="/author/books/new"
                  className="inline-flex items-center gap-1.5 bg-[#FFC928] text-[#0D1F17] font-body font-semibold text-[12.5px] px-4 py-2.5 rounded-xl hover:bg-[#FFD54F] transition-colors"
                >
                  <PlusCircle size={13} /> Add your first book
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-body min-w-[560px]">
                <thead>
                  <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                    <th className="text-left px-5 sm:px-6 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Title</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold hidden sm:table-cell">Status</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold hidden md:table-cell">Suggested Price</th>
                    <th className="text-right px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F0EC]">
                  {filtered.map((book) => {
                    const editable   = book.submissionStatus === "draft" || book.submissionStatus === "changes_requested";
                    const submittable = editable;
                    return (
                      <tr key={book.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="px-5 sm:px-6 py-4">
                          <p className="font-semibold text-[14px] text-[#0a0a0a] truncate max-w-[200px]">{book.title}</p>
                          {book.ownerFeedback && (
                            <p className="text-[11.5px] text-orange-600 mt-0.5 truncate max-w-[200px]">↳ {book.ownerFeedback}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <StatusPill status={book.submissionStatus ?? "draft"} />
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#777] hidden md:table-cell">
                          {book.suggestedPriceRupees ? formatINR(book.suggestedPriceRupees) : <span className="text-[#ddd]">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 justify-end">
                            <Link href={`/author/books/${book.id}`} title="View"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-[#203A2B] hover:bg-[#F5F2EE] transition-all">
                              <Eye size={13} />
                            </Link>
                            {editable && (
                              <Link href={`/author/books/${book.id}/edit`} title="Edit"
                                className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-[#203A2B] hover:bg-[#F5F2EE] transition-all">
                                <Edit2 size={13} />
                              </Link>
                            )}
                            {submittable && (
                              <button onClick={() => handleSubmit(book.id)} disabled={submitting === book.id} title="Submit for approval"
                                className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40 transition-all">
                                <Send size={13} className={submitting === book.id ? "animate-pulse" : ""} />
                              </button>
                            )}
                            {book.submissionStatus === "draft" && (
                              <button onClick={() => handleDelete(book.id)} disabled={deleting === book.id} title="Delete draft"
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
