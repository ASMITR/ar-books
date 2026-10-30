import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getBookBySlug, getPublishedBooks, getAllCategories, getFeaturedBooks,
} from "@/lib/firebase/firestore";
import { BookCover } from "@/components/book/BookCover";
import { BookCard } from "@/components/book/BookCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RichText } from "@/components/shared/RichText";
import { AddToCartButton } from "@/components/book/AddToCartButton";
import { formatINR } from "@/lib/currency";
import {
  BookOpen, FileText, Globe, CheckCircle, Star,
  ShieldCheck, Download, ArrowRight, Zap,
  Users, List, Eye, Clock, Award, Layers,
} from "lucide-react";
import Link from "next/link";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Book Not Found" };
  return {
    title: book.seoTitle ?? book.title,
    description: book.seoDescription ?? book.description.slice(0, 160),
    openGraph: { images: book.coverImageUrl ? [book.coverImageUrl] : [] },
  };
}

export async function generateStaticParams() {
  const books = await getPublishedBooks();
  return books.map((b) => ({ slug: b.slug }));
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const [book, allCategories, featuredBooks] = await Promise.all([
    getBookBySlug(slug),
    getAllCategories(),
    getFeaturedBooks(),
  ]);

  if (!book) notFound();

  const bookCategories = allCategories.filter((c) => book.categoryIds.includes(c.id));
  const discount = book.originalPricePaise
    ? Math.round((1 - book.pricePaise / book.originalPricePaise) * 100)
    : null;
  const relatedBooks = featuredBooks.filter((b) => b.id !== book.id).slice(0, 4);

  // Estimated read time: ~250 words per page
  const readTime = book.pageCount ? `${Math.round(book.pageCount * 2.5)} min` : null;

  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs crumbs={[
            { label: "Home", href: "/" },
            { label: "Books", href: "/books" },
            { label: book.title },
          ]} />
        </div>
      </div>

      {/* ── Hero strip ──────────────────────────────────────────────────── */}
      <div className="bg-[#203A2B]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
            {bookCategories.map((c) => (
              <Link key={c.id} href={`/books?category=${c.slug}`}
                className="shrink-0 text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[#A8B5A0] hover:text-[#C6A66B] transition-colors">
                {c.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} className="fill-[#C6A66B] text-[#C6A66B]" />
            ))}
            <span className="text-[10px] font-body text-[#A8B5A0] ml-1.5">5.0 rating</span>
          </div>
        </div>
      </div>

      {/* ── Main two-column layout ───────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 lg:gap-14 items-start">

            {/* ════════════════════════════════════════════════════════════
                LEFT — sticky sidebar
            ════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-[98px]">

              {/* Cover card */}
              <div className="relative bg-gradient-to-b from-[#E8DDD0] to-[#D0C4B4] rounded-sm overflow-hidden border border-[#E6DFD5] shadow-lg">
                {discount && (
                  <div className="absolute top-3 left-3 z-10 bg-[#203A2B] text-[#FFFCF7] text-[9px] font-body font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow">
                    Save {discount}%
                  </div>
                )}
                {/* Decorative blobs */}
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-[#C6A66B]/10 blur-2xl" />
                <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-[#203A2B]/10 blur-2xl" />
                <div className="flex items-center justify-center py-10 px-8 relative z-10">
                  <div className="drop-shadow-2xl hover:-translate-y-1 transition-transform duration-300">
                    <BookCover src={book.coverImageUrl} title={book.title} size="xl" perspective />
                  </div>
                </div>
              </div>

              {/* Price + CTA card */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden shadow-sm">
                {/* Price row */}
                <div className="px-5 pt-5 pb-4 border-b border-[#E6DFD5]">
                  <div className="flex items-baseline gap-3">
                    <span className="font-heading text-[34px] font-bold text-[#203A2B] leading-none">
                      {formatINR(book.pricePaise)}
                    </span>
                    {book.originalPricePaise && (
                      <span className="font-body text-[16px] text-[#A8B5A0] line-through">
                        {formatINR(book.originalPricePaise)}
                      </span>
                    )}
                    {discount && (
                      <span className="ml-auto text-[10px] font-body font-bold uppercase tracking-wide bg-[#203A2B]/10 text-[#203A2B] px-2 py-0.5 rounded-sm">
                        {discount}% off
                      </span>
                    )}
                  </div>
                  {discount && (
                    <p className="text-[11px] font-body text-[#777970] mt-1">
                      You save {formatINR(book.originalPricePaise! - book.pricePaise)}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="px-5 py-4 flex flex-col gap-2.5">
                  <AddToCartButton book={book} />
                </div>

                {/* Delivery perks */}
                <div className="px-5 pb-5 flex flex-col gap-2">
                  {[
                    { Icon: Zap,          text: "Instant digital delivery" },
                    { Icon: Download,     text: "Download PDF anytime" },
                    { Icon: ShieldCheck,  text: "Secure payment via Razorpay" },
                    { Icon: Award,        text: "100% satisfaction guaranteed" },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-[11px] font-body text-[#777970]">
                      <Icon size={13} className="shrink-0 text-[#203A2B]" strokeWidth={1.5} />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample chapter CTA — always visible */}
              {book.previewPdfPath ? (
                <a
                  href={`/api/downloads/preview?bookId=${book.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex items-center gap-2.5 border-2 border-[#203A2B] bg-transparent text-[#203A2B] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-3.5 rounded-sm hover:bg-[#203A2B] hover:text-[#FFFCF7] transition-all duration-200"
                >
                  <Eye size={14} className="shrink-0" />
                  <span>Read Free Sample Chapter</span>
                  <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ) : (
                <div className="w-full flex items-center gap-2.5 border-2 border-dashed border-[#E6DFD5] bg-[#F5EFE6] text-[#A8B5A0] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-3.5 rounded-sm cursor-not-allowed">
                  <Eye size={14} className="shrink-0" />
                  <span>Sample Coming Soon</span>
                </div>
              )}

              {/* Book specs mini-table */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E6DFD5] bg-[#F5EFE6]">
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[#777970]">Book Details</p>
                </div>
                <div className="divide-y divide-[#E6DFD5]">
                  {[
                    { label: "Format",   value: "PDF eBook",          Icon: FileText },
                    { label: "Language", value: book.language,         Icon: Globe },
                    ...(book.pageCount ? [{ label: "Pages", value: `${book.pageCount} pages`, Icon: BookOpen }] : []),
                    ...(readTime       ? [{ label: "Read Time", value: `~${readTime}`,         Icon: Clock }] : []),
                    { label: "Delivery", value: "Instant Download",   Icon: Download },
                    { label: "Author",   value: book.author,           Icon: Award },
                  ].map(({ label, value, Icon }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5 gap-3">
                      <div className="flex items-center gap-2 text-[11px] font-body text-[#A8B5A0]">
                        <Icon size={12} strokeWidth={1.5} className="text-[#203A2B]" />
                        {label}
                      </div>
                      <span className="text-[11px] font-body font-semibold text-[#242824] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════════
                RIGHT — content
            ════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-8">

              {/* Title block */}
              <div>
                <h1 className="font-heading text-[38px] sm:text-[48px] lg:text-[54px] font-bold text-[#242824] leading-[1.02] mb-3">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="font-heading text-[20px] text-[#777970] italic mb-4">{book.subtitle}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <p className="text-[12px] font-body text-[#777970] uppercase tracking-[0.15em]">
                    by <span className="text-[#242824] font-bold">{book.author}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-[#C6A66B] text-[#C6A66B]" />
                    ))}
                    <span className="text-[11px] font-body text-[#A8B5A0] ml-1.5">5.0 · Verified readers</span>
                  </div>
                </div>
              </div>

              {/* Quick-stat pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { Icon: BookOpen, text: book.pageCount ? `${book.pageCount} Pages` : "eBook" },
                  { Icon: FileText, text: "PDF Format" },
                  { Icon: Globe,    text: book.language },
                  { Icon: Zap,      text: "Instant Access" },
                  ...(book.tableOfContents?.length ? [{ Icon: List, text: `${book.tableOfContents.length} Chapters` }] : []),
                ].map(({ Icon, text }, i) => (
                  <div key={`${text}-${i}`} className="inline-flex items-center gap-1.5 border border-[#E6DFD5] bg-[#FFFCF7] text-[#777970] text-[11px] font-body px-3 py-1.5 rounded-sm">
                    <Icon size={11} strokeWidth={1.5} className="text-[#203A2B]" />
                    {text}
                  </div>
                ))}
              </div>

              {/* ── About this Book ─────────────────────────────────────── */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E6DFD5] bg-[#F5EFE6]">
                  <BookOpen size={15} className="text-[#203A2B]" strokeWidth={1.5} />
                  <h2 className="font-heading text-[20px] font-bold text-[#242824]">About this Book</h2>
                </div>
                <div className="px-6 py-5">
                  <RichText content={book.description} />
                </div>
              </div>

              {/* ── What You'll Learn ───────────────────────────────────── */}
              {book.whatYouLearn && book.whatYouLearn.length > 0 && (
                <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E6DFD5] bg-[#F5EFE6]">
                    <CheckCircle size={15} className="text-[#203A2B]" strokeWidth={1.5} />
                    <h2 className="font-heading text-[20px] font-bold text-[#242824]">What You&apos;ll Learn</h2>
                  </div>
                  <div className="px-6 py-5">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {book.whatYouLearn.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#203A2B]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle size={11} className="text-[#203A2B]" strokeWidth={2.5} />
                          </div>
                          <span className="text-[12px] font-body text-[#777970] leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ── Table of Contents ───────────────────────────────────── */}
              {book.tableOfContents && book.tableOfContents.length > 0 && (
                <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E6DFD5] bg-[#F5EFE6]">
                    <List size={15} className="text-[#203A2B]" strokeWidth={1.5} />
                    <h2 className="font-heading text-[20px] font-bold text-[#242824]">Table of Contents</h2>
                    <span className="ml-auto text-[10px] font-body text-[#A8B5A0] uppercase tracking-wide">
                      {book.tableOfContents.length} chapters
                    </span>
                  </div>
                  <div className="divide-y divide-[#E6DFD5]">
                    {book.tableOfContents.map((chapter, i) => (
                      <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-[#F5EFE6] transition-colors">
                        <span className="w-6 h-6 rounded-full bg-[#203A2B]/8 flex items-center justify-center shrink-0 text-[10px] font-body font-bold text-[#203A2B]">
                          {i + 1}
                        </span>
                        <span className="text-[13px] font-body text-[#242824] flex-1">{chapter}</span>
                        <Layers size={12} className="text-[#A8B5A0] shrink-0" strokeWidth={1.5} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Target Audience ─────────────────────────────────────── */}
              {book.targetAudience && (
                <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E6DFD5] bg-[#F5EFE6]">
                    <Users size={15} className="text-[#203A2B]" strokeWidth={1.5} />
                    <h2 className="font-heading text-[20px] font-bold text-[#242824]">Who Is This Book For?</h2>
                  </div>
                  <div className="px-6 py-5">
                    <RichText content={book.targetAudience} />
                  </div>
                </div>
              )}

              {/* ── Sample chapter inline CTA — always visible ──────────── */}
              {book.previewPdfPath ? (
                <div className="relative overflow-hidden rounded-sm border border-[#203A2B]/20 bg-gradient-to-r from-[#203A2B] to-[#315B55]">
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#C6A66B]/10 blur-3xl -translate-y-1/2 translate-x-1/4" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-6 py-6">
                    <div>
                      <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0] mb-1">Free Preview</p>
                      <h3 className="font-heading text-[22px] font-bold text-[#FFFCF7] leading-tight mb-1">
                        Not sure yet? Read a free sample.
                      </h3>
                      <p className="font-body text-[12px] text-[#A8B5A0]">
                        Get a taste of the writing style and content before you buy.
                      </p>
                    </div>
                    <a
                      href={`/api/downloads/preview?bookId=${book.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-2 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-6 py-3 rounded-sm hover:bg-[#d4b77e] transition-colors shadow-sm"
                    >
                      <Eye size={13} /> Read Sample
                    </a>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-sm border border-[#E6DFD5] bg-[#F5EFE6]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-6">
                    <div>
                      <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0] mb-1">Free Preview</p>
                      <h3 className="font-heading text-[20px] font-bold text-[#242824] leading-tight mb-1">
                        Sample chapter coming soon.
                      </h3>
                      <p className="font-body text-[12px] text-[#777970]">
                        A free preview will be available shortly. Check back soon.
                      </p>
                    </div>
                    <div className="shrink-0 inline-flex items-center gap-2 border border-dashed border-[#A8B5A0] text-[#A8B5A0] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-6 py-3 rounded-sm cursor-not-allowed">
                      <Eye size={13} /> Coming Soon
                    </div>
                  </div>
                </div>
              )}

              {/* ── Full book specs ─────────────────────────────────────── */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E6DFD5] bg-[#F5EFE6]">
                  <FileText size={15} className="text-[#203A2B]" strokeWidth={1.5} />
                  <h2 className="font-heading text-[20px] font-bold text-[#242824]">Book Specifications</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E6DFD5]">
                  {[
                    ["Title",     book.title],
                    ["Author",    book.author],
                    ["Format",    "PDF eBook"],
                    ["Language",  book.language],
                    ...(book.pageCount ? [["Pages", `${book.pageCount} pages`]] : []),
                    ...(readTime       ? [["Est. Read Time", `~${readTime}`]] : []),
                    ["Delivery",  "Instant Download"],
                    ["DRM",       "No DRM — read anywhere"],
                  ].map(([label, value], i) => (
                    <div key={`${label}-${i}`} className="flex flex-col px-5 py-3.5 border-b border-[#E6DFD5] last:border-b-0">
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[#A8B5A0] mb-0.5">{label}</span>
                      <span className="text-[13px] font-body text-[#242824]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky bottom purchase bar (mobile) ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#FFFCF7] border-t border-[#E6DFD5] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-body text-[10px] text-[#A8B5A0] uppercase tracking-wide truncate">{book.title}</p>
            <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-tight">{formatINR(book.pricePaise)}</p>
          </div>
          <AddToCartButton book={book} />
        </div>
      </div>
      {/* Spacer so content isn't hidden behind sticky bar on mobile */}
      <div className="h-20 lg:hidden" />

      {/* ── You may also like ───────────────────────────────────────────── */}
      {relatedBooks.length > 0 && (
        <section className="bg-[#FFFCF7] border-t border-[#E6DFD5] py-12 lg:py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-px bg-[#315B55]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#315B55]">More Books</p>
                </div>
                <h2 className="font-heading text-[28px] sm:text-[34px] font-bold text-[#242824]">
                  You May Also Like
                </h2>
              </div>
              <Link
                href="/books"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B]/40 pb-0.5 hover:border-[#203A2B] transition-colors"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {relatedBooks.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
