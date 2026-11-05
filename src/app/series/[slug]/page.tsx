import { getSeriesBySlug, getBooksBySeries, getVisibleSeries } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { notFound } from "next/navigation";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) return { title: "Series Not Found" };
  return {
    title: `${series.name} — Book Series`,
    description: series.description ?? `All books in the ${series.name} series by Asmit Rajaramkar.`,
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function SeriesDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const series = await getSeriesBySlug(slug);
  if (!series || !series.visible) notFound();

  let books = await getBooksBySeries(series.id);

  if (sort === "price-asc")  books = [...books].sort((a, b) => a.priceRupees - b.priceRupees);
  if (sort === "price-desc") books = [...books].sort((a, b) => b.priceRupees - a.priceRupees);

  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Breadcrumb bar ─────────────────────────────────────────────── */}
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs crumbs={[
            { label: "Home",   href: "/"       },
            { label: "Series", href: "/series" },
            { label: series.name               },
          ]} />
        </div>
      </div>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1 h-7 rounded-full bg-[#203A2B]" />
              <div>
                <h1 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#242824] leading-none">
                  {series.name}
                </h1>
                <p className="font-body text-[11px] text-[#A8B5A0] mt-1 tracking-wide">
                  {series.description ?? `All books in the ${series.name} series`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">{books.length}</p>
                <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">
                  {books.length === 1 ? "Book" : "Books"}
                </p>
              </div>
              <div className="w-px h-8 bg-[#E6DFD5]" />
              <Link
                href="/series"
                className="text-[11px] font-body font-semibold text-[#777970] hover:text-[#203A2B] transition-colors hidden sm:block"
              >
                ← All Series
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter bar + grid ───────────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Sort bar */}
          <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-5 py-4 mb-8 shadow-sm">
            <form method="GET" className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-1">
                <SlidersHorizontal size={13} className="text-[#A8B5A0] shrink-0" strokeWidth={1.5} />
                <span className="font-body text-[11px] text-[#A8B5A0] uppercase tracking-[0.15em]">Sort</span>
              </div>
              <select
                name="sort"
                defaultValue={sort ?? ""}
                className="border border-[#E6DFD5] bg-[#FFFCF7] px-3.5 py-2 text-[12px] font-body text-[#242824]
                  focus:outline-none focus:border-[#203A2B] transition-colors rounded-sm cursor-pointer"
              >
                <option value="">Series Order</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[#203A2B] text-[#FFFCF7]
                  font-body text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-2 hover:bg-[#315B55]
                  transition-colors rounded-sm"
              >
                <SlidersHorizontal size={11} /> Apply
              </button>
              {sort && (
                <Link
                  href={`/series/${slug}`}
                  className="inline-flex items-center gap-1.5 border border-[#E6DFD5] text-[#777970]
                    font-body text-[11px] px-4 py-2 hover:border-[#203A2B] hover:text-[#203A2B]
                    transition-colors rounded-sm"
                >
                  <X size={11} /> Clear
                </Link>
              )}
            </form>
          </div>

          {/* Results count */}
          <p className="text-[11px] font-body text-[#A8B5A0] uppercase tracking-[0.15em] mb-6">
            {books.length} {books.length === 1 ? "book" : "books"} in this series
          </p>

          {/* Book grid */}
          {books.length === 0 ? (
            <EmptyState
              title="No books in this series yet"
              description="Check back soon or browse all books."
              actionLabel="View All Books"
              actionHref="/books"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
              {books.map((book) => (
                <div key={book.id} className="relative">
                  {book.seriesOrder != null && (
                    <span className="absolute top-2 left-2 z-10 bg-[#0D1F17] text-white text-[10px] font-body font-bold px-2 py-0.5 rounded-full leading-none">
                      #{book.seriesOrder}
                    </span>
                  )}
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-t border-[#E6DFD5] py-12 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-sm bg-[#203A2B] px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#315B55] rounded-full blur-3xl opacity-25 -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-px bg-[#C6A66B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">Full Collection</p>
              </div>
              <h2 className="font-heading text-[26px] sm:text-[32px] font-bold text-[#FFFCF7] leading-tight">
                Explore more series
              </h2>
              <p className="font-body text-[13px] text-[#A8B5A0] mt-1">Discover all themed collections.</p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/series"
                className="inline-flex items-center gap-2.5 border border-[#FFFCF7]/30 text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-6 py-3.5 hover:bg-[#FFFCF7]/10 transition-colors rounded-sm"
              >
                All Series <ArrowRight size={13} />
              </Link>
              <Link
                href="/books"
                className="inline-flex items-center gap-2.5 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-[#d4b77e] transition-colors rounded-sm shadow-sm"
              >
                All eBooks <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
