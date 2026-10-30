import { getPublishedBooks, getVisibleCategories } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Books",
  description: "Browse all eBooks by Asmit Rajaramkar.",
};

interface FilterParams { category?: string; q?: string; sort?: string; }

// ── Filter sidebar / bar ─────────────────────────────────────────────────────
function FilterBar({
  params,
  categories,
}: {
  params: FilterParams;
  categories: import("@/types").Category[];
}) {
  const hasFilters = !!(params.q || params.category || params.sort);

  const inputCls = "w-full border border-[#E6DFD5] bg-[#FFFCF7] px-3.5 py-2.5 text-[12px] font-body text-[#242824] placeholder:text-[#A8B5A0] focus:outline-none focus:border-[#203A2B] focus:ring-2 focus:ring-[#203A2B]/10 transition-colors rounded-sm";
  const selectCls = `${inputCls} cursor-pointer`;

  return (
    <form method="GET" className="w-full">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8B5A0] pointer-events-none" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search by title or keyword…"
            className={`${inputCls} pl-9`}
          />
        </div>

        {/* Category */}
        <select name="category" defaultValue={params.category ?? ""} className={`${selectCls} sm:w-44`}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>

        {/* Sort */}
        <select name="sort" defaultValue={params.sort ?? ""} className={`${selectCls} sm:w-36`}>
          <option value="">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-[#315B55] transition-colors rounded-sm"
          >
            <SlidersHorizontal size={12} /> Apply
          </button>
          {hasFilters && (
            <Link
              href="/books"
              className="inline-flex items-center justify-center gap-1.5 border border-[#E6DFD5] text-[#777970] font-body text-[11px] px-4 py-2.5 hover:border-[#203A2B] hover:text-[#203A2B] transition-colors rounded-sm"
            >
              <X size={12} /> Clear
            </Link>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {params.q && (
            <span className="inline-flex items-center gap-1.5 bg-[#203A2B]/8 border border-[#203A2B]/20 text-[#203A2B] text-[10px] font-body font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Search: &ldquo;{params.q}&rdquo;
            </span>
          )}
          {params.category && (
            <span className="inline-flex items-center gap-1.5 bg-[#203A2B]/8 border border-[#203A2B]/20 text-[#203A2B] text-[10px] font-body font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
              {params.category.replace(/-/g, " ")}
            </span>
          )}
          {params.sort && (
            <span className="inline-flex items-center gap-1.5 bg-[#203A2B]/8 border border-[#203A2B]/20 text-[#203A2B] text-[10px] font-body font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Sort: {params.sort === "price-asc" ? "Price ↑" : "Price ↓"}
            </span>
          )}
        </div>
      )}
    </form>
  );
}

// ── Book results grid ────────────────────────────────────────────────────────
function BookResults({
  params,
  allBooks,
  categories,
}: {
  params: FilterParams;
  allBooks: import("@/types").Book[];
  categories: import("@/types").Category[];
}) {
  let books = allBooks;
  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    if (cat) books = books.filter((b) => b.categoryIds.includes(cat.id));
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    books = books.filter((b) => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  }
  if (params.sort === "price-asc")  books = [...books].sort((a, b) => a.pricePaise - b.pricePaise);
  if (params.sort === "price-desc") books = [...books].sort((a, b) => b.pricePaise - a.pricePaise);

  return (
    <>
      <p className="text-[11px] font-body text-[#A8B5A0] uppercase tracking-[0.15em] mb-6">
        {books.length} book{books.length !== 1 ? "s" : ""} found
      </p>
      {books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      ) : (
        <EmptyState
          title="No books found"
          description="Try adjusting your search or filters."
          actionLabel="View All Books"
          actionHref="/books"
        />
      )}
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
interface Props { searchParams: Promise<FilterParams>; }

export default async function BooksPage({ searchParams }: Props) {
  // Single fetch — data is passed down to both FilterBar and BookResults
  // so neither sub-component needs to hit Firestore again.
  const [allBooks, categories, params] = await Promise.all([
    getPublishedBooks(),
    getVisibleCategories(),
    searchParams,
  ]);

  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <section className="border-b border-[#E6DFD5] bg-[#FFFCF7]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1 h-7 rounded-full bg-[#203A2B]" />
              <div>
                <h1 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#242824] leading-none">
                  All Books
                </h1>
                <p className="font-body text-[11px] text-[#A8B5A0] mt-1 tracking-wide">
                  Browse the full collection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">{allBooks.length}</p>
                <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">Books</p>
              </div>
              <div className="w-px h-8 bg-[#E6DFD5]" />
              <div className="text-right">
                <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">{categories.length}</p>
                <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">Subjects</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter + Grid ───────────────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filter bar */}
          <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-5 py-4 mb-8 shadow-sm">
            <FilterBar params={params} categories={categories} />
          </div>

          {/* Results */}
          <BookResults params={params} allBooks={allBooks} categories={categories} />
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] py-12 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-sm bg-[#203A2B] px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#315B55] rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-px bg-[#C6A66B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">Direct from Author</p>
              </div>
              <h2 className="font-heading text-[28px] sm:text-[34px] font-bold text-[#FFFCF7] leading-tight mb-1">
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="font-body text-[13px] text-[#A8B5A0]">Reach out — new titles drop every month.</p>
            </div>

            <Link
              href="/contact"
              className="relative z-10 shrink-0 inline-flex items-center gap-2.5 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-[#d4b77e] transition-colors rounded-sm shadow-sm"
            >
              Contact Me <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
