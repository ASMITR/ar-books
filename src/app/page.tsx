import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedBooks, getVisibleCategories, getStoreSettings, getActivePublicOffers } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { OffersSection } from "@/components/home/OffersSection";
import { HeroSection } from "@/components/home/HeroSection";
import { formatINR } from "@/lib/currency";
import {
  ArrowRight, BookOpen,
  Sparkles, CheckCircle, Headphones, ShieldCheck,
  Users, Heart,
  TrendingUp, Brain, DollarSign, Cpu, Zap,
  BookMarked, Ghost, Rocket,
} from "lucide-react";

// Revalidate every 60 s so new books/offers appear quickly without a cold
// Firestore hit on every single page load.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Asmit Rajaramkar Books | Official eBook Store",
};

// Category display config — icon + sublabel + palette, keyed by slug
const CAT_CONFIG: Record<string, {
  Icon: React.ElementType;
  sublabel: string;
  accent: string;   // icon / border / text accent
  bg: string;       // card background tint
  ring: string;     // icon ring colour (low-opacity version)
}> = {
  "business":             { Icon: TrendingUp,  sublabel: "Strategy · Leadership",  accent: "#203A2B", bg: "#EEF3EF", ring: "#203A2B22" },
  "personal-development": { Icon: Brain,        sublabel: "Mindset · Growth",       accent: "#315B55", bg: "#EBF2F1", ring: "#315B5522" },
  "finance":              { Icon: DollarSign,   sublabel: "Wealth · Investing",     accent: "#5A6E2C", bg: "#F1F3E8", ring: "#5A6E2C22" },
  "technology":           { Icon: Cpu,          sublabel: "Code · Innovation",      accent: "#1D4E6B", bg: "#E8EFF4", ring: "#1D4E6B22" },
  "productivity":         { Icon: Zap,          sublabel: "Focus · Systems",        accent: "#7B4F12", bg: "#F5EDE1", ring: "#7B4F1222" },
  "fiction":              { Icon: BookMarked,   sublabel: "Stories · Imagination",  accent: "#5C2D6E", bg: "#F1EAF5", ring: "#5C2D6E22" },
  "horror":               { Icon: Ghost,        sublabel: "Dark · Suspense",        accent: "#2D2D2D", bg: "#EBEBEB", ring: "#2D2D2D22" },
  "science-fiction":      { Icon: Rocket,       sublabel: "Future · Worlds",        accent: "#1A3B6E", bg: "#E8EDF5", ring: "#1A3B6E22" },
};

export default async function HomePage() {
  const [featuredBooks, categories, settings, activeOffers] = await Promise.all([
    getFeaturedBooks(),
    getVisibleCategories(),
    getStoreSettings(),
    getActivePublicOffers(),
  ]);

  const heroBook   = featuredBooks[0]; // kept for potential future use

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════ */}
      <HeroSection
        books={featuredBooks}
        headline={settings?.homepageSettings?.heroHeadline}
        subtext={settings?.homepageSettings?.heroSubtext}
      />

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
        <section className="bg-[#F5EFE6] py-14 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-6 h-px bg-[#C6A66B]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#C6A66B]">Explore the Collection</p>
                </div>
                <h2 className="font-heading text-[38px] sm:text-[48px] font-bold text-[#242824] leading-[1.05]">
                  Browse by Category
                </h2>
                <p className="font-body text-[13px] text-[#777970] mt-2 max-w-sm leading-relaxed">
                  Handpicked titles across every area of personal and professional growth.
                </p>
              </div>
              <Link
                href="/books"
                className="group inline-flex items-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.15em] text-[#FFFCF7] bg-[#203A2B] px-5 py-3 hover:bg-[#315B55] transition-colors shrink-0 self-start sm:self-auto"
              >
                All Books <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
              {categories.slice(0, 6).map((cat, i) => {
                const cfg = CAT_CONFIG[cat.slug];
                const Icon    = cfg?.Icon    ?? BookOpen;
                const sublabel = cfg?.sublabel ?? "Explore";
                const accent   = cfg?.accent   ?? (i % 2 === 0 ? "#203A2B" : "#315B55");
                const bg       = cfg?.bg       ?? "#EEF3EF";
                const ring     = cfg?.ring     ?? "#203A2B22";
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="group relative flex flex-col gap-5 p-5 lg:p-6 bg-white border border-[#E6DFD5] hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Coloured left border flash on hover */}
                    <span
                      className="absolute inset-y-0 left-0 w-[3px] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"
                      style={{ backgroundColor: accent }}
                    />

                    {/* Background tint that fades in on hover */}
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: bg }}
                    />

                    {/* Icon */}
                    <span
                      className="relative z-10 w-11 h-11 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: ring, boxShadow: `0 0 0 6px ${ring}` }}
                    >
                      <Icon size={20} strokeWidth={1.6} style={{ color: accent }} />
                    </span>

                    {/* Text */}
                    <div className="relative z-10 flex flex-col gap-1 flex-1">
                      <p
                        className="font-heading text-[17px] font-bold leading-snug transition-colors duration-200"
                        style={{ color: "#242824" }}
                      >
                        {cat.name}
                      </p>
                      <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#999890]">
                        {sublabel}
                      </p>
                    </div>

                    {/* Footer row */}
                    <div className="relative z-10 flex items-center justify-between pt-2 border-t border-[#E6DFD5] group-hover:border-transparent transition-colors duration-300">
                      <span
                        className="font-body text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200"
                        style={{ color: accent }}
                      >
                        Browse
                      </span>
                      <ArrowRight
                        size={13}
                        className="transition-all duration-200 group-hover:translate-x-1"
                        style={{ color: accent }}
                      />
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
