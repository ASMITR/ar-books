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
import { MobileCartBar } from "@/components/book/MobileCartBar";
import { formatINR } from "@/lib/currency";
import {
  BookOpen, FileText, Globe, CheckCircle, Star,
  ShieldCheck, Download, ArrowRight, Zap,
  Users, List, Eye, Clock, Award, Layers, Tag,
} from "lucide-react";
import Link from "next/link";

interface Props { params: Promise<{ slug: string }>; }

export const revalidate = 300;

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

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E6DFD5] bg-[#F5EFE6]">
        <Icon size={15} className="text-[#203A2B] shrink-0" strokeWidth={1.5} />
        <h2 className="font-heading text-[19px] font-bold text-[#242824] flex-1">{title}</h2>
        {badge && (
          <span className="text-[9px] font-body font-bold uppercase tracking-[0.15em] text-[#A8B5A0] bg-[#FFFCF7] border border-[#E6DFD5] px-2 py-0.5 rounded-sm">
            {badge}
          </span>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
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
  const savings = book.originalPricePaise
    ? book.originalPricePaise - book.pricePaise
    : 0;
  const relatedBooks = featuredBooks.filter((b) => b.id !== book.id).slice(0, 4);
  const readTime = book.pageCount ? `${Math.round(book.pageCount * 2.5)} min` : null;

  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs crumbs={[
            { label: "Home",  href: "/" },
            { label: "Books", href: "/books" },
            { label: book.title },
          ]} />
        </div>
      </div>

      {/* ── Category + rating bar ────────────────────────────────────── */}
      <div className="bg-[#1C3325] border-b border-[#2E5040]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Tag size={10} className="text-[#A8B5A0] shrink-0" strokeWidth={1.8} />
            {bookCategories.length > 0
              ? bookCategories.map((c) => (
                  <Link key={c.id} href={`/categories/${c.slug}`}
                    className="shrink-0 text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[#A8B5A0] hover:text-[#C6A66B] transition-colors">
                    {c.name}
                  </Link>
                ))
              : <span className="text-[10px] font-body text-[#A8B5A0]/60">Uncategorised</span>
            }
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="fill-[#C6A66B] text-[#C6A66B]" />
            ))}
            <span className="text-[10px] font-body text-[#A8B5A0] ml-1.5">5.0</span>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ────────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[370px_1fr] gap-8 lg:gap-12 items-start">

            {/* ════════════════ LEFT SIDEBAR (sticky) ══════════════════ */}
            <div className="flex flex-col gap-5 lg:sticky lg:top-[88px]">

              {/* ── Cover card ─────────────────────────────────────── */}
              <div className="relative bg-gradient-to-b from-[#E5D9CC] to-[#CDBEAF] rounded-sm overflow-hidden border border-[#D8CFBF] shadow-lg">
                {discount && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#203A2B] text-[#FFFCF7] text-[9px] font-body font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm shadow">
                      Save {discount}%
                    </span>
                  </div>
                )}
                {/* Ambient glows */}
                <div className="absolute top-6 right-6 w-28 h-28 rounded-full bg-[#C6A66B]/12 blur-2xl pointer-events-none" />
                <div className="absolute bottom-6 left-6 w-20 h-20 rounded-full bg-[#203A2B]/12 blur-2xl pointer-events-none" />
                <div className="flex items-center justify-center py-10 px-8 relative z-10">
                  <div className="drop-shadow-2xl hover:-translate-y-1 transition-transform duration-300">
                    <BookCover src={book.coverImageUrl} title={book.title} size="xl" perspective />
                  </div>
                </div>
              </div>

              {/* ── Price + CTA card ────────────────────────────────── */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden shadow-sm">

                {/* Price block */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-end gap-3 flex-wrap">
                    <span className="font-heading text-[36px] font-bold text-[#203A2B] leading-none">
                      {formatINR(book.pricePaise)}
                    </span>
                    {book.originalPricePaise && (
                      <span className="font-body text-[16px] text-[#C0BAB2] line-through leading-none mb-0.5">
                        {formatINR(book.originalPricePaise)}
                      </span>
                    )}
                  </div>
                  {discount && savings > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center font-body text-[10px] font-bold uppercase tracking-[0.12em]
                        bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-sm">
                        {discount}% off
                      </span>
                      <span className="text-[11px] font-body text-[#777970]">
                        You save {formatINR(savings)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="mx-5 h-px bg-[#E6DFD5]" />

                {/* CTA buttons */}
                <div className="px-5 py-4">
                  <AddToCartButton book={book} />
                </div>

                {/* Divider */}
                <div className="mx-5 h-px bg-[#E6DFD5]" />

                {/* Trust signals */}
                <div className="px-5 py-4 flex flex-col gap-2.5">
                  {[
                    { Icon: Zap,         text: "Instant digital delivery after payment" },
                    { Icon: Download,    text: "Download your PDF anytime, forever"     },
                    { Icon: ShieldCheck, text: "Secure checkout via Razorpay"           },
                    { Icon: Award,       text: "100% satisfaction guaranteed"           },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 bg-[#203A2B]/8 rounded-sm flex items-center justify-center shrink-0">
                        <Icon size={11} className="text-[#203A2B]" strokeWidth={1.8} />
                      </div>
                      <span className="text-[11px] font-body text-[#777970] leading-snug">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Free sample CTA ─────────────────────────────────── */}
              {book.previewPdfPath ? (
                <a
                  href={`/api/downloads/preview?bookId=${book.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex items-center gap-3 border-2 border-[#203A2B]/30 bg-[#FFFCF7]
                    text-[#203A2B] font-body text-[11px] font-bold uppercase tracking-[0.15em]
                    px-5 py-3.5 rounded-sm hover:border-[#203A2B] hover:bg-[#203A2B] hover:text-[#FFFCF7]
                    transition-all duration-200"
                >
                  <Eye size={14} className="shrink-0" />
                  <span className="flex-1">Read Free Sample Chapter</span>
                  <ArrowRight size={12} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                </a>
              ) : (
                <div className="flex items-center gap-3 border-2 border-dashed border-[#E6DFD5] bg-[#F5EFE6]
                  text-[#A8B5A0] font-body text-[11px] font-bold uppercase tracking-[0.15em]
                  px-5 py-3.5 rounded-sm cursor-not-allowed">
                  <Eye size={14} className="shrink-0" />
                  <span>Sample Preview Coming Soon</span>
                </div>
              )}

              {/* ── Book details mini-table ──────────────────────────── */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E6DFD5] bg-[#F5EFE6]">
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[#777970]">Quick Details</p>
                </div>
                <div className="divide-y divide-[#EDEBE6]">
                  {[
                    { Icon: FileText, label: "Format",    value: "PDF eBook"          },
                    { Icon: Globe,    label: "Language",  value: book.language         },
                    ...(book.pageCount ? [{ Icon: BookOpen, label: "Pages",  value: `${book.pageCount}` }] : []),
                    ...(readTime       ? [{ Icon: Clock,    label: "Read Time", value: `~${readTime}` }] : []),
                    { Icon: Download, label: "Delivery",  value: "Instant Download"   },
                    { Icon: Award,    label: "Author",    value: book.author           },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Icon size={11} className="text-[#203A2B] shrink-0" strokeWidth={1.5} />
                        <span className="text-[11px] font-body text-[#A8B5A0]">{label}</span>
                      </div>
                      <span className="text-[11px] font-body font-semibold text-[#242824] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ════════════════ RIGHT CONTENT ═══════════════════════════ */}
            <div className="flex flex-col gap-6">

              {/* ── Title block ────────────────────────────────────────── */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-6 py-6">
                {/* Category pills */}
                {bookCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {bookCategories.map((c) => (
                      <Link key={c.id} href={`/categories/${c.slug}`}
                        className="text-[9px] font-body font-bold uppercase tracking-[0.15em]
                          bg-[#203A2B]/8 text-[#203A2B] border border-[#203A2B]/15
                          px-2.5 py-1 rounded-sm hover:bg-[#203A2B] hover:text-[#FFFCF7] transition-colors">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}

                <h1 className="font-heading text-[34px] sm:text-[44px] lg:text-[50px] font-bold text-[#1a1a1a] leading-[1.04] mb-2">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="font-heading text-[18px] text-[#777970] italic mb-4">{book.subtitle}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 pt-3 border-t border-[#EDEBE6]">
                  <p className="text-[12px] font-body text-[#777970] uppercase tracking-[0.12em]">
                    by <span className="text-[#242824] font-bold">{book.author}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-[#C6A66B] text-[#C6A66B]" />
                    ))}
                    <span className="text-[11px] font-body text-[#A8B5A0] ml-1.5">5.0 · Verified readers</span>
                  </div>
                </div>
              </div>

              {/* ── Quick-stat chips ───────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { Icon: BookOpen, label: "Pages",    value: book.pageCount ? `${book.pageCount}` : "—" },
                  { Icon: FileText, label: "Format",   value: "PDF"           },
                  { Icon: Zap,      label: "Delivery", value: "Instant"       },
                  { Icon: Globe,    label: "Language", value: book.language   },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm py-4 px-3">
                    <div className="w-8 h-8 bg-[#203A2B]/8 rounded-sm flex items-center justify-center">
                      <Icon size={14} className="text-[#203A2B]" strokeWidth={1.5} />
                    </div>
                    <span className="font-heading text-[15px] font-bold text-[#242824] leading-none">{value}</span>
                    <span className="font-body text-[9px] uppercase tracking-[0.14em] text-[#A8B5A0]">{label}</span>
                  </div>
                ))}
              </div>

              {/* ── About this Book ────────────────────────────────────── */}
              <Section icon={BookOpen} title="About this Book">
                <RichText content={book.description} />
              </Section>

              {/* ── What You'll Learn ──────────────────────────────────── */}
              {book.whatYouLearn && book.whatYouLearn.length > 0 && (
                <Section icon={CheckCircle} title="What You'll Learn" badge={`${book.whatYouLearn.length} topics`}>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {book.whatYouLearn.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#203A2B]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle size={11} className="text-[#203A2B]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[12px] font-body text-[#555] leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* ── Table of Contents ──────────────────────────────────── */}
              {book.tableOfContents && book.tableOfContents.length > 0 && (
                <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E6DFD5] bg-[#F5EFE6]">
                    <List size={15} className="text-[#203A2B] shrink-0" strokeWidth={1.5} />
                    <h2 className="font-heading text-[19px] font-bold text-[#242824] flex-1">Table of Contents</h2>
                    <span className="text-[9px] font-body font-bold uppercase tracking-[0.15em] text-[#A8B5A0] bg-[#FFFCF7] border border-[#E6DFD5] px-2 py-0.5 rounded-sm">
                      {book.tableOfContents.length} chapters
                    </span>
                  </div>
                  <div className="divide-y divide-[#EDEBE6]">
                    {book.tableOfContents.map((chapter, i) => (
                      <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-[#F9F7F4] transition-colors">
                        <span className="w-6 h-6 rounded-full bg-[#203A2B]/8 flex items-center justify-center shrink-0
                          text-[10px] font-body font-bold text-[#203A2B]">
                          {i + 1}
                        </span>
                        <span className="text-[13px] font-body text-[#242824] flex-1">{chapter}</span>
                        <Layers size={11} className="text-[#C0BAB2] shrink-0" strokeWidth={1.5} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Who Is This For ────────────────────────────────────── */}
              {book.targetAudience && (
                <Section icon={Users} title="Who Is This Book For?">
                  <RichText content={book.targetAudience} />
                </Section>
              )}

              {/* ── Free sample inline banner ──────────────────────────── */}
              {book.previewPdfPath ? (
                <div className="relative overflow-hidden rounded-sm border border-[#2E5040] bg-[#1C3325]">
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#C6A66B]/10 blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-6 py-6">
                    <div>
                      <p className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0] mb-1.5">Free Preview</p>
                      <h3 className="font-heading text-[20px] font-bold text-[#FFFCF7] leading-tight mb-1">
                        Not sure yet? Read a free sample.
                      </h3>
                      <p className="font-body text-[12px] text-[#A8B5A0] leading-relaxed">
                        Get a taste of the writing before you buy — no sign-up required.
                      </p>
                    </div>
                    <a
                      href={`/api/downloads/preview?bookId=${book.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-2 bg-[#C6A66B] text-[#1a1a1a]
                        font-body text-[11px] font-bold uppercase tracking-[0.15em]
                        px-6 py-3 rounded-sm hover:bg-[#d4b77e] transition-colors shadow-sm whitespace-nowrap"
                    >
                      <Eye size={13} /> Read Sample
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                  border border-dashed border-[#D5CFCA] bg-[#F9F7F4] rounded-sm px-6 py-5">
                  <div>
                    <p className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0] mb-1">Coming Soon</p>
                    <p className="font-heading text-[16px] font-bold text-[#242824]">Sample chapter preview coming soon.</p>
                    <p className="font-body text-[12px] text-[#777970] mt-0.5">Check back shortly for a free preview.</p>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-2 border border-dashed border-[#C0BAB2]
                    text-[#A8B5A0] font-body text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-sm cursor-not-allowed">
                    <Eye size={12} /> Coming Soon
                  </div>
                </div>
              )}

              {/* ── Full specifications ────────────────────────────────── */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E6DFD5] bg-[#F5EFE6]">
                  <FileText size={15} className="text-[#203A2B] shrink-0" strokeWidth={1.5} />
                  <h2 className="font-heading text-[19px] font-bold text-[#242824]">Book Specifications</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {[
                    ["Title",         book.title             ],
                    ["Author",        book.author            ],
                    ["Format",        "PDF eBook"            ],
                    ["Language",      book.language          ],
                    ...(book.pageCount ? [["Pages", `${book.pageCount} pages`]] : []),
                    ...(readTime       ? [["Est. Read Time", `~${readTime}`]]   : []),
                    ["Delivery",      "Instant Download"     ],
                    ["DRM",           "No DRM — read anywhere"],
                  ].map(([label, value], i) => (
                    <div key={`${label}-${i}`}
                      className="flex flex-col px-5 py-3.5 border-b border-r-0 sm:odd:border-r border-[#EDEBE6] last:border-b-0">
                      <span className="text-[9px] font-body font-bold uppercase tracking-[0.15em] text-[#A8B5A0] mb-0.5">{label}</span>
                      <span className="text-[13px] font-body text-[#242824]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky mobile purchase bar ───────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#FFFCF7] border-t border-[#E6DFD5]
        shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
        <div className="max-w-[1440px] mx-auto px-4 py-3">
          <MobileCartBar book={book} />
        </div>
      </div>
      <div className="h-20 lg:hidden" />

      {/* ── You may also like ────────────────────────────────────────── */}
      {relatedBooks.length > 0 && (
        <section className="bg-[#FFFCF7] border-t border-[#E6DFD5] py-12 lg:py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-px bg-[#C6A66B]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#C6A66B]">More Books</p>
                </div>
                <h2 className="font-heading text-[28px] sm:text-[34px] font-bold text-[#242824]">
                  You May Also Like
                </h2>
              </div>
              <Link href="/books"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B]/40 pb-0.5 hover:border-[#203A2B] transition-colors">
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
