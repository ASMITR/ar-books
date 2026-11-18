"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, BookOpen, Eye, Edit2, Send, Trash2 } from "lucide-react";
import type { Book } from "@/types";
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

export default function AuthorBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/author/books");
    const json = await res.json();
    if (json.success) setBooks(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleSubmit = async (bookId: string) => {
    setSubmitting(bookId);
    setError(null);
    try {
      const res = await fetch(`/api/author/books/${bookId}/submit`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Submission failed");
      await fetchBooks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("Delete this draft book? This cannot be undone.")) return;
    setDeleting(bookId);
    try {
      const res = await fetch(`/api/author/books/${bookId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      await fetchBooks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setDeleting(null);
    }
  };

  const filters = [
    { key: "all",              label: "All" },
    { key: "draft",            label: "Drafts" },
    { key: "pending_approval", label: "Pending" },
    { key: "changes_requested",label: "Changes Needed" },
    { key: "approved",         label: "Approved" },
    { key: "published",        label: "Published" },
  ];

  const filtered = filter === "all" ? books : books.filter((b) => b.submissionStatus === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#080808]">My Books</h1>
          <p className="text-sm text-[#888] mt-1">{books.length} book{books.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/author/books/new"
          className="flex items-center gap-2 bg-[#080808] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#111] transition-colors shrink-0"
        >
          <PlusCircle size={15} />
          Add Book
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-[#080808] text-white"
                : "bg-white border border-[#E6E3DD] text-[#666] hover:border-[#080808]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E6E3DD] rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-[#F4F2EE] flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-[#ccc]" />
          </div>
          <p className="font-semibold text-[#080808]">No books yet</p>
          <p className="text-sm text-[#888] mt-1 mb-4">Start by creating your first book draft.</p>
          <Link href="/author/books/new" className="inline-flex items-center gap-2 bg-[#FFC928] text-[#080808] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-colors">
            <PlusCircle size={14} /> Add New Book
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0EDE7]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider hidden md:table-cell">Suggested Price</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#888] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE7]">
              {filtered.map((book) => {
                const isEditable = book.submissionStatus === "draft" || book.submissionStatus === "changes_requested";
                const isSubmittable = isEditable;
                return (
                  <tr key={book.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#080808] truncate max-w-[200px]">{book.title}</div>
                      {book.ownerFeedback && (
                        <div className="text-xs text-orange-600 mt-0.5 truncate max-w-[200px]">
                          Feedback: {book.ownerFeedback}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <StatusBadge status={book.submissionStatus ?? "draft"} />
                    </td>
                    <td className="px-5 py-4 text-[#555] hidden md:table-cell">
                      {book.suggestedPriceRupees ? formatINR(book.suggestedPriceRupees) : <span className="text-[#ccc]">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/author/books/${book.id}`}
                          className="p-1.5 rounded-lg text-[#789185] hover:bg-[#F0EDE7] hover:text-[#080808] transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </Link>
                        {isEditable && (
                          <Link
                            href={`/author/books/${book.id}/edit`}
                            className="p-1.5 rounded-lg text-[#789185] hover:bg-[#F0EDE7] hover:text-[#080808] transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </Link>
                        )}
                        {isSubmittable && (
                          <button
                            onClick={() => handleSubmit(book.id)}
                            disabled={submitting === book.id}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                            title="Submit for approval"
                          >
                            <Send size={14} className={submitting === book.id ? "animate-pulse" : ""} />
                          </button>
                        )}
                        {book.submissionStatus === "draft" && (
                          <button
                            onClick={() => handleDelete(book.id)}
                            disabled={deleting === book.id}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            title="Delete draft"
                          >
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
