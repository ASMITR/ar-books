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
  const [mounted, setMounted]   = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mount guard for portal (SSR safe)
  useEffect(() => { setMounted(true); }, []);

  // Focus + body scroll lock
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
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

  if (!mounted || !open) return null;

  const modal = (
    <div className="fixed inset-0 z-[999] flex flex-col">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#242824]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full bg-[#FFFCF7] border-b border-[#E6DFD5] shadow-2xl">
        <div className="h-[3px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]" />

        <div className="max-w-[860px] mx-auto px-4 sm:px-6">

          {/* Input row */}
          <div className="flex items-center gap-3 py-4">
            <Search size={18} className="shrink-0 text-[#A8B5A0]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search books by title, topic, or keyword…"
              className="flex-1 bg-transparent font-body text-[15px] text-[#242824] placeholder:text-[#A8B5A0] focus:outline-none"
            />
            {loading
              ? <Loader2 size={16} className="shrink-0 text-[#A8B5A0] animate-spin" />
              : query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                  className="p-1.5 text-[#A8B5A0] hover:text-[#242824] hover:bg-[#F5EFE6] rounded-sm transition-colors"
                  aria-label="Clear"
                >
                  <X size={15} />
                </button>
              )
            }
            <button
              onClick={onClose}
              className="p-1.5 text-[#A8B5A0] hover:text-[#242824] hover:bg-[#F5EFE6] rounded-sm transition-colors ml-1"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>

          <div className="h-px bg-[#E6DFD5]" />

          {/* Results */}
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {!query.trim() && (
              <p className="font-body text-[12px] text-[#A8B5A0] text-center py-6">
                Start typing to search the collection…
              </p>
            )}
            {query.trim().length === 1 && (
              <p className="font-body text-[12px] text-[#A8B5A0] text-center py-6">Keep typing…</p>
            )}
            {searched && results.length === 0 && query.trim().length >= 2 && (
              <div className="text-center py-8">
                <BookOpen size={32} className="text-[#E6DFD5] mx-auto mb-3" />
                <p className="font-heading text-[15px] font-bold text-[#242824] mb-1">No books found</p>
                <p className="font-body text-[12px] text-[#A8B5A0]">
                  No results for &ldquo;{query}&rdquo;. Try a different keyword.
                </p>
              </div>
            )}
            {results.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="font-body text-[10px] text-[#A8B5A0] uppercase tracking-[0.15em] mb-2">
                  {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                </p>
                {results.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 px-3 py-3 rounded-sm hover:bg-[#F5EFE6] transition-colors"
                  >
                    <div className="shrink-0 w-10 h-14 bg-[#F5EFE6] border border-[#E6DFD5] rounded-sm overflow-hidden flex items-center justify-center">
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
                      <p className="font-body text-[13px] font-bold text-[#203A2B]">{formatINR(book.pricePaise)}</p>
                      {book.originalPricePaise && (
                        <p className="font-body text-[10px] text-[#A8B5A0] line-through">{formatINR(book.originalPricePaise)}</p>
                      )}
                    </div>
                    <ArrowRight size={13} className="shrink-0 text-[#A8B5A0] group-hover:text-[#203A2B] transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#E6DFD5] py-3 flex items-center justify-between">
            <p className="font-body text-[10px] text-[#A8B5A0]">
              Press <kbd className="bg-[#F5EFE6] border border-[#E6DFD5] px-1.5 py-0.5 rounded text-[9px] font-mono">Esc</kbd> to close
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
    </div>
  );

  return createPortal(modal, document.body);
}
