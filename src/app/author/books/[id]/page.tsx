"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Send, Eye, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Book } from "@/types";
import Link from "next/link";
import { formatINR } from "@/lib/currency";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    draft:            { label: "Draft",            icon: Clock,        className: "bg-gray-100 text-gray-600"     },
    pending_approval: { label: "Pending Review",   icon: Clock,        className: "bg-yellow-100 text-yellow-700" },
    changes_requested:{ label: "Changes Needed",   icon: AlertCircle,  className: "bg-orange-100 text-orange-700" },
    approved:         { label: "Approved",         icon: CheckCircle2, className: "bg-blue-100 text-blue-700"     },
    published:        { label: "Published",        icon: CheckCircle2, className: "bg-green-100 text-green-700"   },
    rejected:         { label: "Rejected",         icon: XCircle,      className: "bg-red-100 text-red-700"       },
    unpublished:      { label: "Unpublished",      icon: Clock,        className: "bg-gray-100 text-gray-500"     },
  };
  const cfg = map[status] ?? { label: status, icon: Clock, className: "bg-gray-100 text-gray-600" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.className}`}>
      <Icon size={13} />
      {cfg.label}
    </span>
  );
}

export default function AuthorBookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/author/books/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBook(json.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/author/books/${id}/submit`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Submission failed");
      setSubmitSuccess(true);
      // Refresh book data
      const refreshed = await fetch(`/api/author/books/${id}`).then((r) => r.json());
      if (refreshed.success) setBook(refreshed.data);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-[#888]">Book not found or you don&apos;t have permission to view it.</p>
        <Link href="/author/books" className="mt-4 inline-block text-sm text-[#789185] hover:underline">← Back to My Books</Link>
      </div>
    );
  }

  const status = book.submissionStatus ?? "draft";
  const isEditable = status === "draft" || status === "changes_requested";
  const isSubmittable = isEditable;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/author/books" className="p-2 rounded-lg hover:bg-[#F0EDE7] transition-colors">
          <ArrowLeft size={16} className="text-[#666]" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-heading font-bold text-[#080808] truncate">{book.title}</h1>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Owner feedback callout */}
      {book.ownerFeedback && (
        <div className={`rounded-xl p-4 border flex gap-3 ${
          status === "changes_requested"
            ? "bg-orange-50 border-orange-200"
            : status === "rejected"
            ? "bg-red-50 border-red-200"
            : "bg-blue-50 border-blue-200"
        }`}>
          <AlertCircle size={18} className={`shrink-0 mt-0.5 ${
            status === "changes_requested" ? "text-orange-500" :
            status === "rejected" ? "text-red-500" : "text-blue-500"
          }`} />
          <div>
            <p className={`text-sm font-semibold ${
              status === "changes_requested" ? "text-orange-800" :
              status === "rejected" ? "text-red-800" : "text-blue-800"
            }`}>
              {status === "rejected" ? "Rejection reason" : "Owner feedback"}
            </p>
            <p className={`text-sm mt-0.5 ${
              status === "changes_requested" ? "text-orange-700" :
              status === "rejected" ? "text-red-700" : "text-blue-700"
            }`}>{book.ownerFeedback}</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{submitError}</div>
      )}

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Book submitted for owner review. You&apos;ll be notified when there&apos;s a decision.
        </div>
      )}

      {/* Book details */}
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        <div className="flex gap-4 p-5">
          {book.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverImageUrl} alt={book.title} className="w-24 h-32 object-cover rounded-lg border border-[#E6E3DD] shrink-0" />
          ) : (
            <div className="w-24 h-32 rounded-lg bg-[#F4F2EE] border-2 border-dashed border-[#DDD] shrink-0 flex items-center justify-center">
              <span className="text-xs text-[#CCC]">No cover</span>
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-1.5">
            <h2 className="font-bold text-[#080808]">{book.title}</h2>
            {book.subtitle && <p className="text-sm text-[#666]">{book.subtitle}</p>}
            <p className="text-xs text-[#888]">{book.language} · {book.pageCount ? `${book.pageCount} pages` : "Pages not set"}</p>
            {book.suggestedPriceRupees && (
              <p className="text-xs text-[#888]">Suggested price: <span className="font-medium text-[#080808]">{formatINR(book.suggestedPriceRupees)}</span></p>
            )}
            {book.published && book.priceRupees > 0 && (
              <p className="text-xs text-green-700">Final price: <span className="font-medium">{formatINR(book.priceRupees)}</span></p>
            )}
          </div>
        </div>

        {book.description && (
          <div className="border-t border-[#F0EDE7] px-5 py-4">
            <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-[#555] leading-relaxed">{book.description}</p>
          </div>
        )}

        <div className="border-t border-[#F0EDE7] px-5 py-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[#888]">Manuscript PDF</p>
            <p className={`text-xs font-medium mt-0.5 ${book.privatePdfUrl ? "text-green-600" : "text-red-500"}`}>
              {book.privatePdfUrl ? "✓ Uploaded" : "✗ Not uploaded"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#888]">Preview PDF</p>
            <p className={`text-xs font-medium mt-0.5 ${book.previewPdfUrl ? "text-green-600" : "text-[#999]"}`}>
              {book.previewPdfUrl ? "✓ Uploaded" : "— Not uploaded"}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {isEditable && (
          <Link
            href={`/author/books/${id}/edit`}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E6E3DD] rounded-xl text-sm font-semibold text-[#080808] hover:border-[#080808] transition-colors"
          >
            <Edit2 size={14} />
            Edit Book
          </Link>
        )}

        {isSubmittable && !submitSuccess && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#080808] text-white rounded-xl text-sm font-semibold hover:bg-[#111] disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {submitting ? "Submitting…" : "Submit for Approval"}
          </button>
        )}

        {status === "published" && (
          <Link
            href={`/books/${book.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-5 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
          >
            <Eye size={14} />
            View Live
          </Link>
        )}
      </div>

      <div className="text-xs text-[#999]">
        Last updated {new Date(book.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}
