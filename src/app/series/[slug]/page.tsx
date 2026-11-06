import { getSeriesBySlug, getBooksBySeries } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Layers, SlidersHorizontal, X } from "lucide-react";
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

export async function generateStaticParams() { return []; }

export default async function SeriesDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const series = await getSeriesBySlug(slug);
  if (!series || !series.visible) notFound();

  let books = await getBooksBySeries(series.id);
  if (sort === "price-asc")  books = [...books].sort((a, b) => a.priceRupees - b.priceRupees);
  if (sort === "price-desc") books = [...books].sort((a, b) => b.priceRupees - a.priceRupees);

  return (
    <div className="bg-[#FAFAF7] min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-[#ECEAE5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs crumbs={[
            { label: "Home",   href: "/"       },
            { label: "Series", href: "/series" },
            { label: series.name               },
          ]} />
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-[#ECEAE5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">

          {/* Top row: back link */}
          <Link
            href="/series"
            className="inline-flex items-center gap-1.5 font-body text-[11px] text-[#999]
              hover:text-[#203A2B] transition-colors mb-5"
          >
            ← All Series
          </Link>

          {/* Main header row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

            {/* Left: icon + title + description */}
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-11 h-11 bg-[#0D1F17]/6 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Layers size={18} className="text-[#203A2B]" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A66B] mb-1">
                  Book Series
                </p>
                <h1 className="font-heading text-[22px] sm:text-[28px] font-bold text-[#111] leading-tight">
                  {series.name}
                </h1>
                {series.description && (
                  <p className="font-body text-[12px] sm:text-[13px] text-[#888] mt-2 leading-relaxed">
                    {series.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: book count pill */}
            <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
              <div className="inline-flex items-center gap-2 bg-[#F5F3F0] border border-[#ECEAE5]
                px-4 py-2.5 rounded-xl">
                <BookOpen size={13} className="text-[#203A2B]" strokeWidth={1.5} />
                <div>
                  <p className="font-heading text-[18px] font-bold text-[#203A2B] leading-none">
                    {books.length}
                  </p>
                  <p className="font-body text-[9px] text-[#B8B3AB] uppercase tracking-wider leading-none mt-0.5">
                    {books.length === 1 ? "Book" : "Books"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Books grid ── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-7">
            <p className="font-body text-[11px] text-[#B8B3AB] uppercase tracking-[0.15em]">
              {books.length} {books.length === 1 ? "book" : "books"}
            </p>
            <form method="GET" className="flex items-center gap-2">
              <select
                name="sort"
                defaultValue={sort ?? ""}
                className="border border-[#E8E4DF] bg-white px-3 py-2 text-[11px] font-body text-[#333]
                  focus:outline-none focus:border-[#203A2B] transition-colors rounded-xl cursor-pointer"
              >
                <option value="">Series Order</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-[#0D1F17] text-white
                  font-body text-[10px] font-bold uppercase tracking-[0.12em]
                  px-4 py-2 rounded-xl hover:bg-[#203A2B] transition-colors"
              >
                <SlidersHorizontal size={10} /> Apply
              </button>
              {sort && (
                <Link
                  href={`/series/${slug}`}
                  className="inline-flex items-center gap-1 border border-[#E8E4DF] text-[#888]
                    font-body text-[10px] px-3 py-2 rounded-xl hover:border-[#203A2B] hover:text-[#203A2B] transition-colors"
                >
                  <X size={10} /> Clear
                </Link>
              )}
            </form>
          </div>

          {books.length === 0 ? (
            <EmptyState
              title="No books in this series yet"
              description="Check back soon or browse all books."
              actionLabel="View All Books"
              actionHref="/books"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {books.map((book) => (
                <div key={book.id} className="relative">
                  {book.seriesOrder != null && (
                    <span className="absolute top-2 right-2 z-20 bg-[#0D1F17] text-white
                      text-[9px] font-body font-bold px-2 py-0.5 rounded-full leading-none shadow-sm">
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

      {/* ── CTA ── */}
      <section className="bg-white border-t border-[#ECEAE5] py-12 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[#0D1F17] px-8 sm:px-12 py-10
            flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#203A2B] rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-px bg-[#C6A66B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#C6A66B]">Full Collection</p>
              </div>
              <h2 className="font-heading text-[24px] sm:text-[30px] font-bold text-white leading-tight">
                Explore more series
              </h2>
              <p className="font-body text-[12px] text-white/50 mt-1">Discover all themed collections.</p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/series"
                className="inline-flex items-center gap-2 border border-white/20 text-white
                  font-body text-[11px] font-bold uppercase tracking-[0.12em]
                  px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                All Series <ArrowRight size={12} />
              </Link>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 bg-[#C6A66B] text-[#0D1F17]
                  font-body text-[11px] font-bold uppercase tracking-[0.12em]
                  px-6 py-3 rounded-xl hover:bg-[#d4b77e] transition-colors"
              >
                All eBooks <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
