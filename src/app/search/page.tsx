import { Suspense } from "react";
import { getPublishedBooks } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { BookCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Books",
  description: "Search eBooks by Asmit Rajaramkar.",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

async function SearchForm({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  return (
    <form method="GET" className="flex gap-2 mb-10 max-w-xl">
      <input
        name="q"
        defaultValue={query}
        placeholder="Search books by title or description…"
        autoFocus
        className="flex-1 border border-[#E9E7E2] bg-white px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
      />
      <button
        type="submit"
        className="bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#789185] transition-colors"
      >
        Search
      </button>
    </form>
  );
}

async function SearchResults({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let books = await getPublishedBooks();

  if (query) {
    const lower = query.toLowerCase();
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        b.description.toLowerCase().includes(lower) ||
        (b.subtitle ?? "").toLowerCase().includes(lower)
    );
  }

  if (!query) {
    return <p className="font-body text-[#777777] text-sm">Enter a search term above to find books.</p>;
  }

  return (
    <>
      <p className="text-sm font-body text-[#777777] mb-6">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchPage({ searchParams }: Props) {
  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="bg-[#789185] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-bold text-white">Search</h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<div className="h-14 max-w-xl bg-[#E9E7E2] animate-pulse mb-10" />}>
          <SearchForm searchParams={searchParams} />
        </Suspense>

        <Suspense
          fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          }
        >
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
