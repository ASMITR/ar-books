import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookBySlug, getAllCategories, getFeaturedBooks } from "@/lib/firebase/firestore";
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

export async function generateStaticParams() { return []; }

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const [book, allCategories, featuredBooks] = await Promise.all([
    getBookBySlug(slug),
    getAllCategories(),
    getFeaturedBooks(),
  ]);

  if (!book) notFound();

  const bookCategories = allCategories.filter((c) => book.categoryIds.includes(c.id));
  const discount = book.originalPriceRupees
    ? Math.round((1 - book.priceRupees / book.originalPriceRupees) * 100)
    : null;
  const savings = book.originalPriceRupees ? book.originalPriceRupees - book.priceRupees : 0;
  const relatedBooks = featuredBooks.filter((b) => b.id !== book.id).slice(0, 4);
  const readTime = book.pageCount ? `${Math.round(book.pageCount * 2.5)} min` : null;

  return (
    <div className="bg-[#FAFAF7] min-h-screen">

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#ECEAE5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs crumbs={[
            { label: "Home",  href: "/" },
            { label: "Books", href: "/books" },
            { label: book.title },
          ]} />
        </div>
      </div>

      {/* ── Hero band ──────────────────────────────────────────────────── */}
      <div className="bg-[#0D1F17] border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Tag size={10} className="text-white/30 shrink-0" strokeWidth={1.8} />
            {bookCategories.length > 0
              ? bookCategories.map((c) => (
                  <Link key={c.id} href={`/categories/${c.slug}`}
                    className="shrink-0 text-[10px] font-body font-bold uppercase tracking-[0.15em] text-white/40 hover:text-[#FFC928] transition-colors">
                    {c.name}
                  </Link>
                ))
              : <span className="text-[10px] font-body text-white/20">Uncategorised</span>
            }
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="fill-[#FFC928] text-[#FFC928]" />
            ))}
            <span className="text-[10px] font-body text-white/30 ml-1.5">5.0</span>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] gap-8 lg:gap-12 items-start">

            {/* ══════════════ LEFT SIDEBAR ══════════════════════════════ */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-[88px]">

              {/* Cover card */}
              <div className="relative bg-[#0D1F17] rounded-2xl overflow-hidden border border-white/[0.06] shadow-xl">
                {discount && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#FFC928] text-[#0D1F17] text-[9px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full shadow">
                      -{discount}% off
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: "radial-gradient(ellipse at 80% 20%, rgba(255,201,40,0.3) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(120,145,133,0.3) 0%, transparent 60%)" }} />
                <div className="flex items-center justify-center py-10 px-8 relative z-10">
                  <div className="hover:-translate-y-1 transition-transform duration-300"
                    style={{ filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.5))" }}>
                    <BookCover src={book.coverImageUrl} title={book.title} size="xl" perspective />
                  </div>
                </div>
              </div>

              {/* Price + CTA card */}
              <div className="bg-white rounded-2xl border border-[#ECEAE5] overflow-hidden">
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-end gap-3 flex-wrap">
                    <span className="font-heading text-[38px] font-bold text-[#111] leading-none">
                      {formatINR(book.priceRupees)}
                    </span>
                    {book.originalPriceRupees && (
                      <span className="font-body text-[16px] text-[#C4BFB9] line-through leading-none mb-1">
                        {formatINR(book.originalPriceRupees)}
                      </span>
                    )}
                  </div>
                  {discount && savings > 0 && (
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="inline-flex items-center font-body text-[10px] font-bold uppercase tracking-[0.1em]
                        bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                        {discount}% off
                      </span>
                      <span className="text-[12px] font-body text-[#888]">
                        You save {formatINR(savings)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-[#F0EDE8] mx-5" />

                <div className="px-5 py-4">
                  <AddToCartButton book={book} />
                </div>

                <div className="h-px bg-[#F0EDE8] mx-5" />

                {/* Trust signals */}
                <div className="px-5 py-4 flex flex-col gap-2.5">
                  {[
                    { Icon: Zap,         text: "Instant digital delivery after payment" },
                    { Icon: Download,    text: "Download your PDF anytime, forever"     },
                    { Icon: ShieldCheck, text: "Secure checkout via Razorpay"           },
                    { Icon: Award,       text: "100% satisfaction guaranteed"           },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <div className="w-6 h-6 bg-[#F2F0EC] rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={12} className="text-[#203A2B]" strokeWidth={1.8} />
                      </div>
                      <span className="text-[11px] font-body text-[#888] leading-snug">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free sample */}
              {(book.previewPdfPath || book.previewPdfUrl) ? (
                <a
                  href={`/api/downloads/preview?bookId=${book.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex items-center gap-3 bg-white border border-[#ECEAE5] rounded-2xl
                    text-[#444] font-body text-[11px] font-bold uppercase tracking-[0.12em]
                    px-5 py-3.5 hover:border-[#203A2B] hover:bg-[#0D1F17] hover:text-white
                    transition-all duration-200 shadow-sm"
                >
                  <Eye size={14} className="shrink-0" />
                  <span className="flex-1">Read Free Sample Chapter</span>
                  <ArrowRight size={12} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                </a>
              ) : (
                <div className="flex items-center gap-3 border border-dashed border-[#E2DDD8] bg-[#F7F5F2]
                  text-[#C4BFB9] font-body text-[11px] font-bold uppercase tracking-[0.12em]
                  px-5 py-3.5 rounded-2xl cursor-not-allowed">
                  <Eye size={14} className="shrink-0" />
                  <span>Sample Preview Coming Soon</span>
                </div>
              )}

              {/* Quick details */}
              <div className="bg-white rounded-2xl border border-[#ECEAE5] overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-[#F0EDE8]">
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[#BDB8B0]">Quick Details</p>
                </div>
                <div className="divide-y divide-[#F0EDE8]">
                  {[
                    { Icon: FileText, label: "Format",    value: "PDF eBook"         },
                    { Icon: Globe,    label: "Language",  value: book.language        },
                    ...(book.pageCount ? [{ Icon: BookOpen, label: "Pages",     value: `${book.pageCount}` }] : []),
                    ...(readTime       ? [{ Icon: Clock,    label: "Read Time", value: `~${readTime}` }]     : []),
                    { Icon: Download, label: "Delivery",  value: "Instant Download"  },
                    { Icon: Award,    label: "Author",    value: book.author          },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Icon size={11} className="text-[#203A2B] shrink-0" strokeWidth={1.5} />
                        <span className="text-[11px] font-body text-[#BDB8B0]">{label}</span>
                      </div>
                      <span className="text-[11px] font-body font-semibold text-[#111] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ══════════════ RIGHT CONTENT ═════════════════════════════ */}
            <div className="flex flex-col gap-5">

              {/* Title block */}
              <div className="bg-white rounded-2xl border border-[#ECEAE5] px-6 py-6 shadow-sm">
                {bookCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {bookCategories.map((c) => (
                      <Link key={c.id} href={`/categories/${c.slug}`}
                        className="text-[9px] font-body font-bold uppercase tracking-[0.15em]
                          bg-[#F2F0EC] text-[#555] border border-[#E8E4DF]
                          px-2.5 py-1 rounded-full hover:bg-[#0D1F17] hover:text-white hover:border-[#0D1F17] transition-colors">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}

                <h1 className="font-heading text-[32px] sm:text-[42px] lg:text-[48px] font-bold text-[#0D1F17] leading-[1.05] mb-2">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="font-heading text-[18px] text-[#888] italic mb-4">{book.subtitle}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-[#F0EDE8]">
                  <p className="text-[12px] font-body text-[#888] uppercase tracking-[0.12em]">
                    by <span className="text-[#111] font-bold">{book.author}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-[#FFC928] text-[#FFC928]" />
                    ))}
                    <span className="text-[11px] font-body text-[#BDB8B0] ml-1.5">5.0 · Verified readers</span>
                  </div>
                </div>
              </div>

              {/* Quick-stat chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { Icon: BookOpen, label: "Pages",    value: book.pageCount ? `${book.pageCount}` : "—" },
                  { Icon: FileText, label: "Format",   value: "PDF"         },
                  { Icon: Zap,      label: "Delivery", value: "Instant"     },
                  { Icon: Globe,    label: "Language", value: book.language  },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-2 bg-white border border-[#ECEAE5] rounded-2xl py-4 px-3 shadow-sm">
                    <div className="w-9 h-9 bg-[#F2F0EC] rounded-xl flex items-center justify-center">
                      <Icon size={15} className="text-[#203A2B]" strokeWidth={1.5} />
                    </div>
                    <span className="font-heading text-[15px] font-bold text-[#111] leading-none">{value}</span>
                    <span className="font-body text-[9px] uppercase tracking-[0.14em] text-[#BDB8B0]">{label}</span>
                  </div>
                ))}
              </div>

              {/* About */}
              <ContentSection icon={BookOpen} title="About this Book">
                <RichText content={book.description} />
              </ContentSection>

              {/* What You'll Learn */}
              {book.whatYouLearn && book.whatYouLearn.length > 0 && (
                <ContentSection icon={CheckCircle} title="What You'll Learn" badge={`${book.whatYouLearn.length} topics`}>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {book.whatYouLearn.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle size={11} className="text-emerald-600" strokeWidth={2.5} />
                        </div>
                        <span className="text-[13px] font-body text-[#555] leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </ContentSection>
              )}

              {/* Table of Contents */}
              {book.tableOfContents && book.tableOfContents.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#ECEAE5] overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0EDE8]">
                    <List size={15} className="text-[#203A2B] shrink-0" strokeWidth={1.5} />
                    <h2 className="font-heading text-[18px] font-bold text-[#111] flex-1">Table of Contents</h2>
                    <span className="text-[9px] font-body font-bold uppercase tracking-[0.12em] text-[#BDB8B0] bg-[#F7F5F2] border border-[#E8E4DF] px-2.5 py-1 rounded-full">
                      {book.tableOfContents.length} chapters
                    </span>
                  </div>
                  <div className="divide-y divide-[#F7F5F2]">
                    {book.tableOfContents.map((chapter, i) => (
                      <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#FAFAF8] transition-colors">
                        <span className="w-6 h-6 rounded-full bg-[#F2F0EC] flex items-center justify-center shrink-0
                          text-[10px] font-body font-bold text-[#888]">
                          {i + 1}
                        </span>
                        <span className="text-[13px] font-body text-[#333] flex-1">{chapter}</span>
                        <Layers size={11} className="text-[#D0CCC6] shrink-0" strokeWidth={1.5} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Who is this for */}
              {book.targetAudience && (
                <ContentSection icon={Users} title="Who Is This Book For?">
                  <RichText content={book.targetAudience} />
                </ContentSection>
              )}

              {/* Free sample banner */}
              {(book.previewPdfPath || book.previewPdfUrl) ? (
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0D1F17]">
                  <div className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: "radial-gradient(ellipse at 90% 10%, rgba(255,201,40,0.25) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(120,145,133,0.2) 0%, transparent 55%)" }} />
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-6 py-6">
                    <div>
                      <p className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-white/30 mb-1.5">Free Preview</p>
                      <h3 className="font-heading text-[20px] font-bold text-white leading-tight mb-1">
                        Not sure yet? Read a free sample.
                      </h3>
                      <p className="font-body text-[12px] text-white/40 leading-relaxed">
                        Get a taste of the writing before you buy — no sign-up required.
                      </p>
                    </div>
                    <a
                      href={`/api/downloads/preview?bookId=${book.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-2 bg-[#FFC928] text-[#0D1F17]
                        font-body text-[11px] font-bold uppercase tracking-[0.15em]
                        px-6 py-3 rounded-xl hover:bg-[#FFD54F] transition-colors shadow-sm whitespace-nowrap"
                    >
                      <Eye size={13} /> Read Sample
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                  border border-dashed border-[#E2DDD8] bg-[#F7F5F2] rounded-2xl px-6 py-5">
                  <div>
                    <p className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-[#BDB8B0] mb-1">Coming Soon</p>
                    <p className="font-heading text-[16px] font-bold text-[#111]">Sample chapter preview coming soon.</p>
                    <p className="font-body text-[12px] text-[#888] mt-0.5">Check back shortly for a free preview.</p>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-2 border border-dashed border-[#E2DDD8]
                    text-[#C4BFB9] font-body text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-xl cursor-not-allowed">
                    <Eye size={12} /> Coming Soon
                  </div>
                </div>
              )}

              {/* Specifications */}
              <div className="bg-white rounded-2xl border border-[#ECEAE5] overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0EDE8]">
                  <FileText size={15} className="text-[#203A2B] shrink-0" strokeWidth={1.5} />
                  <h2 className="font-heading text-[18px] font-bold text-[#111]">Book Specifications</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {[
                    ["Title",         book.title              ],
                    ["Author",        book.author             ],
                    ["Format",        "PDF eBook"             ],
                    ["Language",      book.language           ],
                    ...(book.pageCount ? [["Pages",          `${book.pageCount} pages`]] : []),
                    ...(readTime       ? [["Est. Read Time", `~${readTime}`]]            : []),
                    ["Delivery",      "Instant Download"      ],
                    ["DRM",           "No DRM — read anywhere"],
                  ].map(([label, value], i) => (
                    <div key={`${label}-${i}`}
                      className="flex flex-col px-5 py-3.5 border-b border-r-0 sm:odd:border-r border-[#F0EDE8] last:border-b-0">
                      <span className="text-[9px] font-body font-bold uppercase tracking-[0.15em] text-[#BDB8B0] mb-0.5">{label}</span>
                      <span className="text-[13px] font-body text-[#333]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky mobile bar ──────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-[#ECEAE5]
        shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-4 py-3">
          <MobileCartBar book={book} />
        </div>
      </div>
      <div className="h-20 lg:hidden" />

      {/* ── Related books ──────────────────────────────────────────────── */}
      {relatedBooks.length > 0 && (
        <section className="bg-white border-t border-[#ECEAE5] py-12 lg:py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-px bg-[#FFC928]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#FFC928]">More Books</p>
                </div>
                <h2 className="font-heading text-[28px] sm:text-[34px] font-bold text-[#0D1F17]">
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

function ContentSection({
  icon: Icon, title, badge, children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#ECEAE5] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0EDE8]">
        <div className="w-7 h-7 bg-[#F2F0EC] rounded-lg flex items-center justify-center shrink-0">
          <Icon size={14} className="text-[#203A2B]" strokeWidth={1.5} />
        </div>
        <h2 className="font-heading text-[18px] font-bold text-[#111] flex-1">{title}</h2>
        {badge && (
          <span className="text-[9px] font-body font-bold uppercase tracking-[0.12em] text-[#BDB8B0] bg-[#F7F5F2] border border-[#E8E4DF] px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
