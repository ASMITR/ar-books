export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { getFeaturedBooks, getVisibleCategories, getStoreSettings } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { BookCover } from "@/components/book/BookCover";
import { formatINR } from "@/lib/currency";
import { BookOpen, Star, Download, ArrowRight, Sparkles } from "lucide-react";
import { TestimonialsCarousel } from "@/components/shared/TestimonialsCarousel";

export default async function HomePage() {
  const [featuredBooks, categories, settings] = await Promise.all([
    getFeaturedBooks(),
    getVisibleCategories(),
    getStoreSettings(),
  ]);

  const heroBook = featuredBooks[0];
  const secondBook = featuredBooks[1];
  const thirdBook = featuredBooks[2];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#FAF9F6]">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#789185]/8 -skew-x-6 translate-x-20 hidden lg:block" />
        <div className="absolute top-20 right-40 w-72 h-72 rounded-full bg-[#FFC928]/10 blur-3xl hidden lg:block" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#789185]/10 blur-2xl hidden lg:block" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left */}
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-[#FFC928]/20 border border-[#FFC928]/40 px-4 py-2 w-fit">
                <Sparkles size={14} className="text-[#F2B916]" />
                <span className="text-xs font-body font-semibold uppercase tracking-widest text-[#080808]">
                  Asmit Rajaramkar — Author
                </span>
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-[#080808] leading-[0.95]">
                {settings?.homepageSettings?.heroHeadline ?? (
                  <>
                    WHAT WILL<br />
                    <span className="text-[#789185]">YOU DISCOVER</span><br />
                    NEXT?
                  </>
                )}
              </h1>

              <p className="font-body text-[#777777] text-lg leading-relaxed max-w-lg">
                {settings?.homepageSettings?.heroSubtext ??
                  "Explore new ideas, build useful skills, and discover fresh perspectives through carefully crafted books."}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#789185] transition-colors"
                >
                  Explore Books <ArrowRight size={14} />
                </Link>
                <Link
                  href="/about"
                  className="inline-block border-2 border-[#080808] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#080808] hover:text-white transition-colors"
                >
                  About the Author
                </Link>
              </div>

              {/* Mini stats */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-[#E9E7E2]">
                <div>
                  <p className="font-heading text-3xl font-bold text-[#080808]">{featuredBooks.length}+</p>
                  <p className="text-xs font-body text-[#777777] uppercase tracking-wide">Books Published</p>
                </div>
                <div className="w-px bg-[#E9E7E2]" />
                <div>
                  <p className="font-heading text-3xl font-bold text-[#080808]">{categories.length}+</p>
                  <p className="text-xs font-body text-[#777777] uppercase tracking-wide">Subjects Covered</p>
                </div>
                <div className="w-px bg-[#E9E7E2]" />
                <div>
                  <p className="font-heading text-3xl font-bold text-[#080808]">100%</p>
                  <p className="text-xs font-body text-[#777777] uppercase tracking-wide">Digital & Instant</p>
                </div>
              </div>
            </div>

            {/* Right — stacked books */}
            <div className="relative flex items-center justify-center order-1 lg:order-2 min-h-[280px] sm:min-h-[360px] lg:min-h-[480px]">
              {thirdBook && (
                <div className="absolute left-4 sm:left-8 top-8 opacity-50 rotate-[-8deg] scale-90">
                  <BookCover src={thirdBook.coverImageUrl} title={thirdBook.title} size="lg" />
                </div>
              )}
              {secondBook && (
                <div className="absolute right-4 sm:right-8 top-4 opacity-70 rotate-[6deg] scale-95">
                  <BookCover src={secondBook.coverImageUrl} title={secondBook.title} size="lg" />
                </div>
              )}
              {heroBook && (
                <div className="relative z-10 drop-shadow-2xl">
                  <BookCover src={heroBook.coverImageUrl} title={heroBook.title} size="xl" perspective />
                  <div className="absolute -bottom-4 -right-4 bg-[#FFC928] text-[#080808] font-body text-sm font-bold px-4 py-2 shadow-lg">
                    {formatINR(heroBook.pricePaise)}
                  </div>
                </div>
              )}
              {!heroBook && (
                <div className="text-[#E9E7E2] font-heading text-xl text-center px-8">
                  Add books in the admin dashboard.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────────── */}
      <section className="relative bg-[#080808] py-12 overflow-hidden">
        {/* animated gradient orbs */}
        <div className="absolute -top-10 left-1/4 w-64 h-64 rounded-full bg-[#789185]/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 right-1/4 w-64 h-64 rounded-full bg-[#FFC928]/10 blur-3xl animate-pulse [animation-delay:1s]" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {[
              { icon: <BookOpen size={18} />, label: "eBooks Available", value: `${featuredBooks.length}+` },
              { icon: <Star size={18} />, label: "Happy Readers", value: "500+" },
              { icon: <Download size={18} />, label: "Instant Download", value: "Always" },
              { icon: <Sparkles size={18} />, label: "New Titles", value: "Monthly" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="group flex flex-col items-center gap-2 bg-[#080808] px-4 py-6 sm:px-6 sm:py-8 hover:bg-[#111] transition-colors duration-300 cursor-default"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFC928]/10 border border-[#FFC928]/30 flex items-center justify-center text-[#FFC928] group-hover:bg-[#FFC928]/20 group-hover:scale-110 transition-all duration-300">
                  {s.icon}
                </div>
                <p className="font-heading text-2xl sm:text-3xl font-bold text-white group-hover:text-[#FFC928] transition-colors duration-300">{s.value}</p>
                <p className="text-[10px] sm:text-[11px] font-body text-white/40 uppercase tracking-[0.15em] text-center">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About the Author ─────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Photo */}
            <div className="relative order-1">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#FFC928] hidden sm:block" />
              <div className="relative bg-[#FAF9F6] flex items-center justify-center min-h-[320px] sm:min-h-[400px] overflow-hidden">
                {settings?.authorPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.authorPhotoUrl}
                    alt="Asmit Rajaramkar"
                    className="w-full h-full object-cover max-h-[400px]"
                  />
                ) : (
                  <div className="text-[#E9E7E2] font-heading text-lg text-center px-8">
                    Author photo can be added via the admin dashboard.
                  </div>
                )}
              </div>
            </div>

            {/* Text */}
            <div className="order-2 flex flex-col gap-6">
              <div>
                <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Meet the Author</p>
                <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808]">
                  Asmit Rajaramkar
                </h2>
              </div>
              <p className="font-body text-[#777777] leading-relaxed text-lg">
                {settings?.authorBio ??
                  "I write books that help people think clearly, build skills, and explore new ideas. From business and finance to fiction and technology — every book is crafted with care and purpose."}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#789185] transition-colors"
                >
                  Read My Story <ArrowRight size={12} />
                </Link>
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 border-2 border-[#080808] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#080808] hover:text-white transition-colors"
                >
                  My Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Books ───────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">The Collection</p>
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808]">
                Books by Asmit Rajaramkar
              </h2>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-xs font-body font-bold uppercase tracking-wider text-[#080808] border-b-2 border-[#FFC928] pb-1 hover:text-[#789185] transition-colors shrink-0"
            >
              View All Books <ArrowRight size={12} />
            </Link>
          </div>

          {featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {featuredBooks.slice(0, 5).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <p className="text-[#777777] font-body text-sm py-12 text-center">
              No featured books yet. Add books in the admin dashboard.
            </p>
          )}
        </div>
      </section>

      {/* ── Why Read My Books ────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 sm:mb-12">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Why Choose</p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#080808]">
                Books Written with Purpose
              </h2>
            </div>
            <p className="text-[11px] font-body text-[#777777] uppercase tracking-wider hidden sm:block">6 reasons</p>
          </div>

          {/* mobile: horizontal scroll snap — tablet+: 2-col — desktop: 3-col */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 scrollbar-none">
            {[
              { n: "01", title: "Practical Knowledge", desc: "Every book is packed with actionable insights you can apply immediately — no fluff, no filler." },
              { n: "02", title: "Direct from Author", desc: "No publishers, no middlemen. Buy directly and get the best price with instant delivery." },
              { n: "03", title: "Instant Digital Access", desc: "Download your eBook the moment you pay. Read on any device, anywhere, anytime." },
              { n: "04", title: "Diverse Subjects", desc: "From business and finance to personal growth and technology — there's something for everyone." },
              { n: "05", title: "Carefully Crafted", desc: "Each book is thoroughly researched, edited, and designed to give you the best reading experience." },
              { n: "06", title: "Secure Payments", desc: "Pay safely via UPI, cards, or net banking through Razorpay — India's most trusted payment gateway." },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-white border border-[#E9E7E2] p-5 sm:p-6 hover:border-[#789185] hover:shadow-md transition-all duration-200 flex flex-col gap-3 snap-start shrink-0 w-[72vw] sm:w-auto"
              >
                <span className="font-heading text-3xl sm:text-4xl font-bold text-[#E9E7E2] group-hover:text-[#FFC928]/60 transition-colors duration-200 leading-none">{f.n}</span>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#080808] group-hover:text-[#789185] transition-colors">{f.title}</h3>
                <p className="font-body text-[#777777] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* mobile scroll hint */}
          <p className="text-center text-[11px] font-body text-[#777777] mt-4 sm:hidden">← swipe to see more →</p>
        </div>
      </section>

      {/* ── Browse by Category ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-white py-14 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* header row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Browse</p>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#080808]">
                  Explore by Subject
                </h2>
              </div>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 shrink-0 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-5 py-3 hover:bg-[#789185] transition-colors self-start sm:self-auto"
              >
                All Books <ArrowRight size={12} />
              </Link>
            </div>

            {/* category pills — wrapping grid */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group inline-flex items-center gap-1.5 border border-[#E9E7E2] bg-[#FAF9F6] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-body font-semibold text-[#080808] hover:bg-[#080808] hover:text-white hover:border-[#080808] transition-all duration-200"
                >
                  <span className="w-1 h-1 rounded-full bg-[#789185] group-hover:bg-[#FFC928] transition-colors shrink-0" />
                  {cat.name}
                </Link>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#080808] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#789185_0%,transparent_50%)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#FFC928_0%,transparent_50%)] opacity-10" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-body uppercase tracking-[0.25em] text-[#789185] mb-3">Reader Reviews</p>
            <h2 className="font-heading text-4xl lg:text-6xl font-bold text-white">What Readers Say</h2>
            <div className="flex justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-[#FFC928] text-[#FFC928]" />
              ))}
            </div>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ── Promotional Banner ───────────────────────────────────────────── */}
      <section className="bg-[#FFC928] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.2em] text-[#080808]/60 mb-3">Limited Time</p>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#080808] leading-none mb-4">
                YOUR NEXT GREAT READ STARTS HERE
              </h2>
              <p className="font-body text-[#080808]/70 text-lg mb-8 max-w-md">
                Every book is written, edited, and published by me — direct to you, no middlemen.
              </p>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#789185] transition-colors"
              >
                Browse All Books <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex gap-4 sm:gap-6 justify-center lg:justify-end items-end">
              {featuredBooks.slice(0, 3).map((book, i) => (
                <div
                  key={book.id}
                  className="shrink-0 transition-transform hover:-translate-y-2 duration-200"
                  style={{ transform: `rotate(${[-5, 0, 5][i] ?? 0}deg)` }}
                >
                  <BookCover src={book.coverImageUrl} title={book.title} size={i === 1 ? "lg" : "md"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ───────────────────────────────────────────────── */}
      <section className="bg-[#080808] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
            <p className="text-xs font-body uppercase tracking-[0.2em] text-[#FFC928]">Stay Updated</p>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white">
              Never Miss a New Book
            </h2>
            <p className="font-body text-white/60 leading-relaxed">
              Get notified when new books drop, receive exclusive discounts, and stay connected with the latest from Asmit Rajaramkar.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-10 py-4 hover:bg-[#F2B916] transition-colors mx-auto"
            >
              Create Free Account <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
