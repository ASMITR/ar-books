import { getPublishedBooks, getVisibleCategories } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader, CtaBanner } from "@/components/shared/PageHeader";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Books",
  description: "Browse all eBooks by Asmit Rajaramkar.",
};

export const revalidate = 300;

interface FilterParams { category?: string; q?: string; sort?: string; }

function FilterBar({ params, categories }: { params: FilterParams; categories: import("@/types").Category[] }) {
  const hasFilters = !!(params.q || params.category || params.sort);
  const cls = "w-full border border-[#E8E4DF] bg-white px-3.5 py-2.5 text-[12.5px] font-body text-[#222] placeholder:text-[#BBB] focus:outline-none focus:border-[#203A2B] focus:ring-2 focus:ring-[#203A2B]/8 transition-colors rounded-xl";

  return (
    <form method="GET" className="w-full">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BBB] pointer-events-none" />
          <input name="q" defaultValue={params.q} placeholder="Search by title or keyword…" className={`${cls} pl-9`} />
        </div>
        <select name="category" defaultValue={params.category ?? ""} className={`${cls} sm:w-44 cursor-pointer`}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="sort" defaultValue={params.sort ?? ""} className={`${cls} sm:w-36 cursor-pointer`}>
          <option value="">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
        <div className="flex gap-2">
          <button type="submit"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-2.5 rounded-xl hover:bg-[#203A2B] transition-colors">
            <SlidersHorizontal size={12} /> Apply
          </button>
          {hasFilters && (
            <Link href="/books"
              className="inline-flex items-center justify-center gap-1.5 border border-[#E8E4DF] text-[#888] font-body text-[11px] px-4 py-2.5 rounded-xl hover:border-[#203A2B] hover:text-[#203A2B] transition-colors">
              <X size={12} /> Clear
            </Link>
          )}
        </div>
      </div>
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {params.q && (
            <span className="inline-flex items-center gap-1.5 bg-[#0D1F17]/6 border border-[#0D1F17]/15 text-[#203A2B] text-[10px] font-body font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Search: &ldquo;{params.q}&rdquo;
            </span>
          )}
          {params.category && (
            <span className="inline-flex items-center gap-1.5 bg-[#0D1F17]/6 border border-[#0D1F17]/15 text-[#203A2B] text-[10px] font-body font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
              {params.category.replace(/-/g, " ")}
            </span>
          )}
          {params.sort && (
            <span className="inline-flex items-center gap-1.5 bg-[#0D1F17]/6 border border-[#0D1F17]/15 text-[#203A2B] text-[10px] font-body font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Sort: {params.sort === "price-asc" ? "Price ↑" : "Price ↓"}
            </span>
          )}
        </div>
      )}
    </form>
  );
}

function BookResults({ params, allBooks, categories }: { params: FilterParams; allBooks: import("@/types").Book[]; categories: import("@/types").Category[] }) {
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
      <p className="text-[11px] font-body text-[#B8B3AB] uppercase tracking-[0.15em] mb-6">
        {books.length} book{books.length !== 1 ? "s" : ""} found
      </p>
      {books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      ) : (
        <EmptyState title="No books found" description="Try adjusting your search or filters." actionLabel="View All Books" actionHref="/books" />
      )}
    </>
  );
}

interface Props { searchParams: Promise<FilterParams>; }

export default async function BooksPage({ searchParams }: Props) {
  const [allBooks, categories, params] = await Promise.all([
    getPublishedBooks(),
    getVisibleCategories(),
    searchParams,
  ]);

  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      <PageHeader
        eyebrow="The Collection"
        title="All Books"
        subtitle="Browse the full eBook catalog"
        meta={[
          { label: "Books", value: allBooks.length },
          { label: "Subjects", value: categories.length },
        ]}
      />

      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#ECEAE5] rounded-2xl px-5 py-4 mb-8 shadow-sm">
            <FilterBar params={params} categories={categories} />
          </div>
          <BookResults params={params} allBooks={allBooks} categories={categories} />
        </div>
      </section>

      <CtaBanner
        eyebrow="Direct from Author"
        title="Can't find what you're looking for?"
        subtitle="Reach out — new titles drop every month."
        href="/contact"
        label="Contact Me →"
      />
    </div>
  );
}
