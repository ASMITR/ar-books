"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, BookOpen, Search, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/currency";
import type { Book } from "@/types";
import type { MembershipBookAccess } from "@/types/subscription";

interface Props {
  books: Book[];
  accessMap: Record<string, MembershipBookAccess>;
  canDownload: boolean;
}

export function MembershipLibraryClient({ books, accessMap, canDownload }: Props) {
  const [query,       setQuery]       = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [dlError,     setDlError]     = useState<string | null>(null);

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.author.toLowerCase().includes(query.toLowerCase())
  );

  const handleDownload = async (book: Book) => {
    setDownloading(book.id);
    setDlError(null);
    try {
      const res = await fetch(`/api/membership/download?bookId=${book.id}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setDlError(json.error ?? "Download failed. Please try again.");
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${book.title.replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setDlError("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8B5A0] pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or author…"
          className="w-full border border-[#E6DFD5] bg-[#FFFCF7] pl-10 pr-4 py-2.5 text-[13px] font-body text-[#242824]
            placeholder:text-[#A8B5A0] focus:outline-none focus:border-[#203A2B] rounded-sm transition-colors"
        />
      </div>

      {dlError && (
        <div className="bg-red-50 border border-red-200 text-red-700 font-body text-[12px] px-4 py-3 rounded-sm">
          {dlError}
        </div>
      )}

      <p className="font-body text-[11px] text-[#A8B5A0] uppercase tracking-[0.15em]">
        {filtered.length} {filtered.length === 1 ? "book" : "books"}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((book) => {
          const access = accessMap[book.id];
          const allowDl = canDownload && access?.allowDownload;

          return (
            <div key={book.id}
              className="group flex flex-col bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden
                hover:border-[#203A2B]/35 hover:shadow-[0_4px_20px_rgba(32,58,43,0.10)] transition-all duration-300">

              {/* Cover */}
              <Link href={`/books/${book.slug}`} className="relative block h-[160px] bg-[#F0E8DC] overflow-hidden">
                {book.coverImageUrl ? (
                  <Image src={book.coverImageUrl} alt={book.title} fill className="object-contain p-3 group-hover:scale-105 transition-transform duration-500" sizes="200px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={28} className="text-[#A8B5A0]" strokeWidth={1} />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-2">
                <Link href={`/books/${book.slug}`}>
                  <h3 className="font-heading text-[13px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 group-hover:text-[#203A2B] transition-colors">
                    {book.title}
                  </h3>
                </Link>
                <p className="font-body text-[10px] text-[#A8B5A0] uppercase tracking-[0.1em] truncate">{book.author}</p>

                {/* Action */}
                <div className="mt-auto pt-2 border-t border-dashed border-[#EDEBE6]">
                  {allowDl ? (
                    <button
                      onClick={() => handleDownload(book)}
                      disabled={downloading === book.id}
                      className="w-full flex items-center justify-center gap-1.5
                        font-body text-[10px] font-bold uppercase tracking-[0.12em]
                        bg-[#203A2B] text-[#FFFCF7] py-2 rounded-sm
                        hover:bg-[#2c5040] disabled:opacity-60 transition-colors"
                    >
                      {downloading === book.id
                        ? <Loader2 size={11} className="animate-spin" />
                        : <Download size={11} />}
                      {downloading === book.id ? "Downloading…" : "Download PDF"}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 font-body text-[10px] text-[#A8B5A0] py-1.5">
                      <BookOpen size={11} />
                      {canDownload ? "Online read only" : "Upgrade for downloads"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
