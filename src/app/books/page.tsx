import { Suspense } from "react";
import { getPublishedBooks, getVisibleCategories } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { BookCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Books",
  description: "Browse all eBooks by Asmit Rajaramkar.",
};

interface FilterParams { category?: string; q?: string; sort?: string; }

async function BookResults({ searchParams }: { searchParams: Promise<FilterParams> }) {
  const params = await searchParams;
  const [allBooks, categories] = await Promise.all([getPublishedBooks(), getVisibleCategories()]);

  let books = allBooks;

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    if (cat) books = books.filter((b) => b.categoryIds.includes(cat.id));
  }

  if (params.q) {
    const q = params.q.toLowerCase();
    books = books.filter((b) => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  }

  if (params.sort === "price-asc") books = [...books].sort((a, b) => a.pricePaise - b.pricePaise);
  if (params.sort === "price-desc") books = [...books].sort((a, b) => b.pricePaise - a.pricePaise);

  return (
    <>
      <p className="text-xs font-body uppercase tracking-[0.15em] text-[#777777] mb-8">
        {books.length} book{books.length !== 1 ? "s" : ""} found
      </p>
      {books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      ) : (
        <EmptyState title="No books found" description="Try adjusting your search or filters." actionLabel="View All Books" actionHref="/books" />
      )}
    </>
  );
}

async function FilterForm({ searchParams }: { searchParams: Promise<FilterParams> }) {
  const params = await searchParams;
  const categories = await getVisibleCategories();
  const selectCls = "border border-[#E9E7E2] bg-white px-3 py-2.5 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 w-full sm:w-auto";

  return (
    <form method="GET" className="w-full flex flex-col sm:flex-row gap-2">
      {/* search — full width on mobile */}
      <div className="relative flex-1 min-w-0">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search books…"
          className="w-full border border-[#E9E7E2] bg-white pl-9 pr-4 py-2.5 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10"
        />
      </div>

      {/* category + sort side by side on mobile, inline on sm+ */}
      <div className="flex gap-2">
        <select name="category" defaultValue={params.category ?? ""} className={selectCls}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="sort" defaultValue={params.sort ?? ""} className={selectCls}>
          <option value="">Newest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      {/* actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 sm:flex-none bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-[#789185] transition-colors"
        >
          Filter
        </button>
        {(params.q || params.category || params.sort) && (
          <Link
            href="/books"
            className="flex-1 sm:flex-none text-center border border-[#E9E7E2] text-xs font-body text-[#777777] px-4 py-2.5 hover:border-[#080808] hover:text-[#080808] transition-colors"
          >
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}

interface Props { searchParams: Promise<FilterParams>; }

export default async function BooksPage({ searchParams }: Props) {
  const [allBooks, categories] = await Promise.all([getPublishedBooks(), getVisibleCategories()]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E9E7E2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">The Collection</p>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#080808]">All Books</h1>
              <p className="font-body text-[#777777] mt-2 max-w-md">
                Every eBook by Asmit Rajaramkar — browse, filter, and find your next great read.
              </p>
            </div>
            <div className="flex gap-6 shrink-0">
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-[#080808]">{allBooks.length}+</p>
                <p className="text-[10px] font-body text-[#777777] uppercase tracking-wider">Books</p>
              </div>
              <div className="w-px bg-[#E9E7E2]" />
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-[#080808]">{categories.length}+</p>
                <p className="text-[10px] font-body text-[#777777] uppercase tracking-wider">Subjects</p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ── Books Grid ───────────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] py-12 lg:py-16 min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 items-center justify-between mb-10">
            <Suspense fallback={<div className="h-10 w-80 bg-[#E9E7E2] animate-pulse" />}>
              <FilterForm searchParams={searchParams} />
            </Suspense>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {Array.from({ length: 10 }).map((_, i) => <BookCardSkeleton key={i} />)}
              </div>
            }
          >
            <BookResults searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="bg-[#FFC928] py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-body uppercase tracking-[0.2em] text-[#080808]/60 mb-2">Direct from Author</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808]">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="font-body text-[#080808]/70 mt-2">Reach out — new titles drop every month.</p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#789185] transition-colors"
          >
            Contact Me <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
