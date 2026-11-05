"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { BookCover } from "@/components/book/BookCover";
import { formatINR } from "@/lib/currency";
import type { Book } from "@/types";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<Book[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus + body scroll lock
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setSearched(false);
      setLoading(false);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        setResults(data.books ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 300);
  };

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[999] flex items-start justify-center px-4 pt-[12vh]">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#242824]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup card */}
      <div
        className="relative z-10 w-full max-w-[640px] bg-[#FFFCF7] rounded-xl shadow-2xl border border-[#E6DFD5] overflow-hidden"
        style={{ animation: "searchPopIn 0.18s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Gold accent line */}
        <div className="h-[3px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]" />

        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Search size={17} className="shrink-0 text-[#A8B5A0]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search books by title, topic, or keyword…"
            className="flex-1 bg-transparent font-body text-[15px] text-[#242824] placeholder:text-[#A8B5A0] focus:outline-none"
          />
          {loading
            ? <Loader2 size={15} className="shrink-0 text-[#A8B5A0] animate-spin" />
            : query && (
              <button
                onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                className="p-1.5 text-[#A8B5A0] hover:text-[#242824] hover:bg-[#F5EFE6] rounded-md transition-colors"
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            )
          }
          <button
            onClick={onClose}
            className="p-1.5 text-[#A8B5A0] hover:text-[#242824] hover:bg-[#F5EFE6] rounded-md transition-colors ml-0.5"
            aria-label="Close search"
          >
            <X size={17} />
          </button>
        </div>

        <div className="h-px bg-[#E6DFD5]" />

        {/* Body */}
        <div className="max-h-[52vh] overflow-y-auto">

          {/* Empty / hint states */}
          {!query.trim() && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Search size={28} className="text-[#E6DFD5]" />
              <p className="font-body text-[13px] text-[#A8B5A0]">
                Start typing to search the collection…
              </p>
            </div>
          )}
          {query.trim().length === 1 && (
            <p className="font-body text-[12px] text-[#A8B5A0] text-center py-8">Keep typing…</p>
          )}

          {/* No results */}
          {searched && results.length === 0 && query.trim().length >= 2 && (
            <div className="text-center py-10">
              <BookOpen size={30} className="text-[#E6DFD5] mx-auto mb-3" />
              <p className="font-heading text-[15px] font-bold text-[#242824] mb-1">No books found</p>
              <p className="font-body text-[12px] text-[#A8B5A0]">
                No results for &ldquo;{query}&rdquo;. Try a different keyword.
              </p>
            </div>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <div className="p-2">
              <p className="font-body text-[10px] text-[#A8B5A0] uppercase tracking-[0.15em] px-3 pt-2 pb-1.5">
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
              {results.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.slug}`}
                  onClick={onClose}
                  className="group flex items-center gap-3.5 px-3 py-2.5 rounded-lg hover:bg-[#F5EFE6] transition-colors"
                >
                  <div className="shrink-0 w-10 h-14 bg-[#F5EFE6] border border-[#E6DFD5] rounded-md overflow-hidden flex items-center justify-center">
                    <BookCover src={book.coverImageUrl} title={book.title} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-[14px] font-bold text-[#242824] group-hover:text-[#203A2B] transition-colors leading-snug line-clamp-1">
                      {book.title}
                    </p>
                    {book.subtitle && (
                      <p className="font-body text-[11px] text-[#A8B5A0] line-clamp-1 mt-0.5">{book.subtitle}</p>
                    )}
                    <p className="font-body text-[11px] text-[#A8B5A0] mt-0.5">{book.author}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-body text-[13px] font-bold text-[#203A2B]">{formatINR(book.priceRupees)}</p>
                    {book.originalPriceRupees && (
                      <p className="font-body text-[10px] text-[#A8B5A0] line-through">{formatINR(book.originalPriceRupees)}</p>
                    )}
                  </div>
                  <ArrowRight size={13} className="shrink-0 text-[#A8B5A0] group-hover:text-[#203A2B] transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E6DFD5] px-4 py-2.5 flex items-center justify-between bg-[#FDFAF5]">
          <p className="font-body text-[10px] text-[#A8B5A0]">
            Press{" "}
            <kbd className="bg-[#F5EFE6] border border-[#E6DFD5] px-1.5 py-0.5 rounded text-[9px] font-mono">
              Esc
            </kbd>{" "}
            to close
          </p>
          <Link
            href="/books"
            onClick={onClose}
            className="font-body text-[11px] text-[#203A2B] hover:underline inline-flex items-center gap-1"
          >
            Browse all books <ArrowRight size={11} />
          </Link>
        </div>
      </div>

    </div>
  );

  return createPortal(modal, document.body);
}
