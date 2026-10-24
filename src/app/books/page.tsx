import { Suspense } from "react";
import { getPublishedBooks, getVisibleCategories } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { BookCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Books",
  description: "Browse all eBooks by Asmit Rajaramkar.",
};

interface FilterParams {
  category?: string;
  q?: string;
  sort?: string;
}

async function BookResults({ searchParams }: { searchParams: Promise<FilterParams> }) {
  const params = await searchParams;
  const [allBooks, categories] = await Promise.all([
    getPublishedBooks(),
    getVisibleCategories(),
  ]);

  let books = allBooks;

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    if (cat) books = books.filter((b) => b.categoryIds.includes(cat.id));
  }

  if (params.q) {
    const q = params.q.toLowerCase();
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }

  if (params.sort === "price-asc") books = [...books].sort((a, b) => a.pricePaise - b.pricePaise);
  if (params.sort === "price-desc") books = [...books].sort((a, b) => b.pricePaise - a.pricePaise);

  return (
    <>
      <p className="text-sm text-[#777777] font-body mb-8">{books.length} book{books.length !== 1 ? "s" : ""}</p>
      {books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
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

async function FilterForm({ searchParams }: { searchParams: Promise<FilterParams> }) {
  const params = await searchParams;
  const categories = await getVisibleCategories();

  return (
    <form method="GET" className="flex gap-2 flex-wrap flex-1">
      <input
        name="q"
        defaultValue={params.q}
        placeholder="Search books…"
        className="border border-[#E9E7E2] bg-white px-4 py-2 text-sm font-body focus:outline-none focus:border-[#789185] w-48"
      />
      <select
        name="category"
        defaultValue={params.category ?? ""}
        className="border border-[#E9E7E2] bg-white px-4 py-2 text-sm font-body focus:outline-none focus:border-[#789185]"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>{c.name}</option>
        ))}
      </select>
      <select
        name="sort"
        defaultValue={params.sort ?? ""}
        className="border border-[#E9E7E2] bg-white px-4 py-2 text-sm font-body focus:outline-none focus:border-[#789185]"
      >
        <option value="">Sort: Newest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
      <button
        type="submit"
        className="bg-[#080808] text-white font-body text-xs font-medium uppercase tracking-wider px-5 py-2 hover:bg-[#789185] transition-colors"
      >
        Filter
      </button>
    </form>
  );
}

interface Props {
  searchParams: Promise<FilterParams>;
}

export default function BooksPage({ searchParams }: Props) {
  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="bg-[#789185] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-bold text-white">My Books</h1>
          <p className="font-body text-white/70 mt-2">All eBooks by Asmit Rajaramkar</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <Suspense fallback={<div className="h-10 w-full bg-[#E9E7E2] animate-pulse" />}>
            <FilterForm searchParams={searchParams} />
          </Suspense>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          }
        >
          <BookResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
