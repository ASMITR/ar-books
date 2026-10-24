import { Suspense } from "react";
import { getPublishedBooks } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { BookCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Books",
  description: "Search eBooks by Asmit Rajaramkar.",
};

interface Props { searchParams: Promise<{ q?: string }>; }

async function SearchResults({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) return null;

  let books = await getPublishedBooks();
  const lower = query.toLowerCase();
  books = books.filter(
    (b) =>
      b.title.toLowerCase().includes(lower) ||
      b.description.toLowerCase().includes(lower) ||
      (b.subtitle ?? "").toLowerCase().includes(lower)
  );

  return (
    <div className="mt-10">
      <p className="text-xs font-body uppercase tracking-[0.15em] text-[#777777] mb-8">
        {books.length} result{books.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
      </p>
      {books.length === 0 ? (
        <EmptyState
          title="No results found"
          description={`No books matched "${query}". Try a different search term.`}
          actionLabel="Browse All Books"
          actionHref="/books"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <>
      {/* ── Hero + Search Bar ────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E9E7E2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Find a Book</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#080808] mb-8">Search</h1>

          <form method="GET" className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search books by title or description…"
                autoFocus
                className="w-full border border-[#E9E7E2] bg-white pl-11 pr-4 py-3.5 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-7 py-3.5 hover:bg-[#789185] transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {!query && (
            <p className="font-body text-sm text-[#777777] mt-4">
              Enter a title, keyword, or topic to find books.
            </p>
          )}
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] py-10 lg:py-14 min-h-[40vh]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6 mt-10">
                {Array.from({ length: 5 }).map((_, i) => <BookCardSkeleton key={i} />)}
              </div>
            }
          >
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {!query && (
        <section className="bg-white border-t border-[#E9E7E2] py-14">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">The Collection</p>
              <h2 className="font-heading text-3xl font-bold text-[#080808]">Not sure what to search?</h2>
              <p className="font-body text-[#777777] mt-1">Browse the full catalog instead.</p>
            </div>
            <Link
              href="/books"
              className="shrink-0 inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#789185] transition-colors"
            >
              Browse All Books <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
