import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedBooks, getVisibleCategories, getStoreSettings, getActivePublicOffers } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { BookCover } from "@/components/book/BookCover";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { OffersSection } from "@/components/home/OffersSection";
import { formatINR } from "@/lib/currency";
import {
  ArrowRight, BookOpen, Users, ShieldCheck, Heart,
  Sparkles, CheckCircle, Headphones, Star,
} from "lucide-react";

// Revalidate every 60 s so new books/offers appear quickly without a cold
// Firestore hit on every single page load.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Asmit Rajaramkar Books | Official eBook Store",
};

const CATEGORY_IMAGES: Record<string, string> = {
  // Business — boardroom / city skyline
  "business":            "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=600&q=85",
  // Personal Development — person meditating / journaling
  "personal-development":"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=85",
  // Finance — coins / stock chart
  "finance":             "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=85",
  // Technology — circuit board / keyboard glow
  "technology":          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=85",
  // Productivity — clean desk / planner
  "productivity":        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=85",
  // Fiction — open book / library shelves
  "fiction":             "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=85",
  // Horror — dark foggy forest
  "horror":              "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&q=85",
  // Science Fiction — galaxy / space nebula
  "science-fiction":     "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=85",
};
// Fallback: open book on a wooden desk
const FALLBACK_CAT = "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=85";

// Subtle category sub-labels
const CAT_SUBLABELS: Record<string, string> = {
  "business":             "Lead & Succeed",
  "personal-development": "Grow Every Day",
  "finance":              "Build Wealth",
  "technology":           "Think Digital",
  "productivity":         "Get More Done",
  "fiction":              "Explore Stories",
  "horror":               "Dare to Read",
  "science-fiction":      "Beyond Tomorrow",
};

export default async function HomePage() {
  const [featuredBooks, categories, settings, activeOffers] = await Promise.all([
    getFeaturedBooks(),
    getVisibleCategories(),
    getStoreSettings(),
    getActivePublicOffers(),
  ]);

  const heroBook   = featuredBooks[0];
  const book2      = featuredBooks[1];
  const book3      = featuredBooks[2];

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          HERO — redesigned for all screens
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0E1C13] min-h-[100svh] sm:min-h-[640px] lg:min-h-[700px] flex flex-col justify-center">

        {/* ── Background: full-bleed lifestyle photo ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&q=85"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25 scale-105"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E1C13]/70 via-[#0E1C13]/50 to-[#0E1C13]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E1C13]/80 via-transparent to-[#0E1C13]/40" />

        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C6A66B] to-transparent" />

        {/* ── Content ── */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">

            {/* ── LEFT: Text + CTAs ── */}
            <div className="flex flex-col gap-6 max-w-2xl">

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2.5 w-fit">
                <span className="w-8 h-px bg-[#C6A66B]" />
                <p className="text-[10px] sm:text-[11px] font-body font-bold uppercase tracking-[0.3em] text-[#C6A66B]">
                  Discover · Read · Grow
                </p>
              </div>

              {/* Headline */}
              <h1 className="font-heading font-bold text-[#FFFCF7] leading-[1.0] tracking-tight
                text-[48px] sm:text-[64px] lg:text-[76px]">
                {settings?.homepageSettings?.heroHeadline ? (
                  <span>{settings.homepageSettings.heroHeadline}</span>
                ) : (
                  <>
                    Books for<br />
                    <span className="text-[#C6A66B]">Every Mind</span>
                    <br />
                    <span className="text-[#FFFCF7]/80">&amp; Moment.</span>
                  </>
                )}
              </h1>

              {/* Sub-text */}
              <p className="font-body text-[#A8B5A0] text-[15px] sm:text-[16px] leading-[1.75] max-w-[480px]">
                {settings?.homepageSettings?.heroSubtext ??
                  "Your next favourite story is just a page away. Handpicked books for curious minds."}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2.5 bg-[#C6A66B] text-[#0E1C13] font-body text-[11px] font-bold uppercase tracking-[0.18em] px-8 py-4 hover:bg-[#d4b77e] transition-colors duration-200 shadow-lg"
                >
                  Shop Now <ArrowRight size={13} />
                </Link>
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2.5 border border-[#FFFCF7]/30 text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.18em] px-8 py-4 hover:bg-[#FFFCF7]/10 hover:border-[#FFFCF7]/60 transition-colors duration-200"
                >
                  Explore Collection
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {["#A8B5A0", "#C6A66B", "#315B55", "#203A2B"].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#0E1C13] flex items-center justify-center text-[#FFFCF7] text-[9px] font-bold shadow-md"
                      style={{ backgroundColor: c }}
                    >
                      {["A", "R", "B", "S"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className="fill-[#C6A66B] text-[#C6A66B]" />
                    ))}
                  </div>
                  <p className="text-[10px] font-body text-[#A8B5A0]">Growing reader community</p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Book stack — visible on all screens, centered on mobile ── */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative flex items-end justify-center gap-4 sm:gap-6 pb-6">

                {/* Side book left */}
                {book3 && (
                  <div className="opacity-40 rotate-[-8deg] translate-y-8 shrink-0
                    transition-transform duration-300 hover:translate-y-6 hover:opacity-60">
                    <BookCover
                      src={book3.coverImageUrl}
                      title={book3.title}
                      size="md"
                      className="shadow-2xl"
                    />
                  </div>
                )}

                {/* Hero book — center, prominent */}
                {heroBook ? (
                  <div className="relative shrink-0 z-10 transition-transform duration-300 hover:-translate-y-2 drop-shadow-2xl">
                    <BookCover
                      src={heroBook.coverImageUrl}
                      title={heroBook.title}
                      size="xl"
                      perspective
                    />
                    {/* Badge */}
                    <div className="absolute -top-5 -right-5 w-[60px] h-[60px] rounded-full bg-[#C6A66B] flex flex-col items-center justify-center shadow-xl border-2 border-[#0E1C13]">
                      <span className="text-[#0E1C13] text-[7px] font-body font-black uppercase leading-tight tracking-wide text-center">New<br />Release</span>
                    </div>
                    {/* Price tag */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0E1C13] border border-[#C6A66B]/60 text-[#C6A66B] font-body text-[11px] font-bold px-5 py-1.5 shadow-lg whitespace-nowrap">
                      {formatINR(heroBook.pricePaise)}
                    </div>
                  </div>
                ) : (
                  <div className="w-[240px] h-[336px] border border-[#FFFCF7]/10 rounded-sm flex items-center justify-center">
                    <p className="text-[#A8B5A0] font-body text-xs text-center px-6">
                      Add books in admin dashboard
                    </p>
                  </div>
                )}

                {/* Side book right */}
                {book2 && (
                  <div className="opacity-40 rotate-[7deg] translate-y-8 shrink-0
                    transition-transform duration-300 hover:translate-y-6 hover:opacity-60">
                    <BookCover
                      src={book2.coverImageUrl}
                      title={book2.title}
                      size="md"
                      className="shadow-2xl"
                    />
                  </div>
                )}

                {/* Glow under stack */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#C6A66B]/20 blur-2xl rounded-full" />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFFCF7] to-transparent" />
      </section>

      {/* ════════════════════════════════════════════════════════════════
          BENEFITS BAR
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFFCF7] border-y border-[#E6DFD5] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Sparkles,     title: "Carefully Curated",  sub: "Books selected with care",      color: "#203A2B" },
              { Icon: CheckCircle,  title: "Quality Content",    sub: "Ideas worth discovering",        color: "#315B55" },
              { Icon: ShieldCheck,  title: "Secure Shopping",    sub: "Safe & encrypted checkout",      color: "#203A2B" },
              { Icon: Headphones,   title: "Reader Support",     sub: "Help whenever you need it",      color: "#315B55" },
            ].map(({ Icon, title, sub, color }, i) => (
              <div
                key={title}
                className={`flex items-center gap-4 px-6 py-5 ${i < 3 ? "border-r border-[#E6DFD5]" : ""} ${i >= 2 ? "border-t border-[#E6DFD5] lg:border-t-0" : ""}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={18} strokeWidth={1.5} style={{ color }} />
                </div>
                <div>
                  <p className="font-body text-[12px] font-bold text-[#242824] uppercase tracking-wide leading-tight">{title}</p>
                  <p className="font-body text-[11px] text-[#777970] mt-0.5 leading-snug">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          EXCLUSIVE OFFERS
      ════════════════════════════════════════════════════════════════ */}
      <OffersSection offers={activeOffers} />

      {/* ════════════════════════════════════════════════════════════════
          BROWSE BY CATEGORY
      ════════════════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="bg-[#FFFCF7] py-12 lg:py-14">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-px bg-[#315B55]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#315B55]">Browse by Category</p>
                </div>
                <h2 className="font-heading text-[36px] sm:text-[44px] font-bold text-[#242824] leading-tight">
                  Find Your Next Read
                </h2>
              </div>
              <Link
                href="/books"
                className="inline-flex items-center gap-1.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B]/40 pb-0.5 hover:border-[#203A2B] transition-colors shrink-0 self-start sm:self-auto"
              >
                View All Categories <ArrowRight size={12} />
              </Link>
            </div>

            {/* Category row — single scrollable row on mobile, fixed row on desktop */}
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-6 lg:overflow-visible">
              {categories.slice(0, 6).map((cat) => {
                const imgSrc   = CATEGORY_IMAGES[cat.slug] ?? FALLBACK_CAT;
                const sublabel = CAT_SUBLABELS[cat.slug]   ?? "Explore";
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="group relative overflow-hidden rounded-sm shrink-0 w-[130px] sm:w-auto"
                    style={{ aspectRatio: "2/3" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e20]/90 via-[#1a2e20]/30 to-transparent group-hover:from-[#1a2e20]/95 transition-opacity duration-300" />
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C6A66B] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-2 text-center">
                      <p className="font-heading text-[13px] font-bold text-[#FFFCF7] leading-tight mb-0.5">{cat.name}</p>
                      <p className="font-body text-[9px] text-[#A8B5A0] tracking-wide">{sublabel}</p>
                      <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ArrowRight size={11} className="text-[#C6A66B]" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          BESTSELLERS
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F5EFE6] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-px bg-[#315B55]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#315B55]">Featured</p>
              </div>
              <h2 className="font-heading text-[36px] sm:text-[44px] font-bold text-[#242824] leading-tight">
                Featured Books
              </h2>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B]/40 pb-0.5 hover:border-[#203A2B] transition-colors shrink-0 self-start sm:self-auto"
            >
              View All Books <ArrowRight size={12} />
            </Link>
          </div>

          {featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-5">
              {featuredBooks.slice(0, 6).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <BookOpen size={40} className="text-[#A8B5A0]" strokeWidth={1} />
              <p className="text-[#777970] font-body text-sm text-center">
                No books yet. Add books in the admin dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          NEWSLETTER BANNER
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFFCF7] py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-sm">

            {/* Background photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=90"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Layered overlay: strong on left, fades right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#203A2B]/95 via-[#203A2B]/80 to-[#203A2B]/40" />
            {/* Subtle texture grain */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

            <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-center">

              {/* Left — copy */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-5 h-px bg-[#C6A66B]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#A8B5A0]">
                    Be Part of Our Reading Community
                  </p>
                </div>
                <h2 className="font-heading text-[32px] sm:text-[40px] lg:text-[44px] font-bold text-[#FFFCF7] leading-[1.1] mb-4">
                  Get Updates, Exclusive<br className="hidden sm:block" />
                  Deals &amp; Book Picks
                </h2>
                <p className="font-body text-[13px] text-[#A8B5A0] leading-relaxed max-w-md">
                  New releases, curated reading recommendations, and exclusive discounts — delivered straight to your inbox.
                </p>
                {/* Trust badges */}
                <div className="flex flex-wrap gap-4 mt-6">
                  {["No spam, ever", "Unsubscribe anytime", "Exclusive reader deals"].map((t) => (
                    <div key={t} className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-[#C6A66B]" />
                      <span className="text-[11px] font-body text-[#A8B5A0]">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — form: opaque card so inputs are always readable */}
              <div className="bg-[#FFFCF7] rounded-sm p-6 shadow-xl">
                <p className="font-heading text-[20px] font-bold text-[#203A2B] mb-1">Join the community</p>
                <p className="font-body text-[11px] text-[#777970] mb-5">Get your first book recommendation today.</p>
                <NewsletterForm source="homepage" variant="banner" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TRUST STRIP
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F5EFE6] border-t border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: BookOpen,     title: "Handpicked Books",        sub: "Curated with purpose",       color: "#203A2B" },
              { Icon: Users,        title: "For Every Reader",         sub: "All genres & interests",     color: "#315B55" },
              { Icon: ShieldCheck,  title: "Quality You Can Trust",    sub: "Thoroughly crafted",         color: "#203A2B" },
              { Icon: Heart,        title: "Stories That Stay",        sub: "Words that move you",        color: "#315B55" },
            ].map(({ Icon, title, sub, color }, i) => (
              <div
                key={title}
                className={`flex items-center gap-4 px-6 py-6 ${i < 3 ? "border-r border-[#E6DFD5]" : ""} ${i >= 2 ? "border-t border-[#E6DFD5] lg:border-t-0" : ""}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={18} strokeWidth={1.5} style={{ color }} />
                </div>
                <div>
                  <p className="font-body text-[12px] font-bold text-[#242824] uppercase tracking-wide leading-tight">{title}</p>
                  <p className="font-body text-[11px] text-[#777970] mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
