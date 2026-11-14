import type { Metadata } from "next";
import Image from "next/image";
import {
  getFeaturedBooks,
  getPublishedBooks,
  getVisibleCategories,
  getStoreSettings,
  getActivePublicOffers,
} from "@/lib/firebase/firestore";
import { HeroSection }         from "@/components/home/HeroSection";
import { CategorySection }     from "@/components/home/CategorySection";
import { BookCarousel }        from "@/components/home/BookCarousel";
import { BrandStoryBanner }    from "@/components/home/BrandStoryBanner";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterForm }      from "@/components/home/NewsletterForm";
import { OffersSection }       from "@/components/home/OffersSection";
import {
  Sparkles,
  CheckCircle,
  Headphones,
  ShieldCheck,
  Download,
  Globe,
  Lock,
  BookOpen,
} from "lucide-react";

// ISR — background revalidate every 5 min; mutations bust it instantly via revalidateTag
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Asmit Rajaramkar Books | Official eBook Store",
  description:
    "Discover and download premium eBooks by Asmit Rajaramkar — business, finance, personal development, fiction, and more.",
};

export default async function HomePage() {
  const [featuredBooks, allPublished, categories, settings, activeOffers] =
    await Promise.all([
      getFeaturedBooks(),
      getPublishedBooks(),
      getVisibleCategories(),
      getStoreSettings(),
      getActivePublicOffers(),
    ]);

  // Bestselling = featured books (admin-curated)
  const bestsellers = featuredBooks;
  // "Explore more" = remaining published books not already in featured, or all if none featured
  const exploreMore = allPublished.filter(
    (b) => !featuredBooks.some((f) => f.id === b.id),
  );
  // Fall back: if no non-featured books, show all published books
  const exploreBooks = exploreMore.length > 0 ? exploreMore : allPublished;

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          1 · HERO BANNER
      ══════════════════════════════════════════════════════════════ */}
      <HeroSection
        books={featuredBooks}
        latestBook={allPublished[0] ?? null}
        headline={settings?.homepageSettings?.heroHeadline}
        subtext={settings?.homepageSettings?.heroSubtext}
      />

      {/* ══════════════════════════════════════════════════════════════
          2 · SHOPPING BENEFITS BAR
      ══════════════════════════════════════════════════════════════ */}
      <section className="cv-auto bg-white border-y border-[#ECEAE5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              {
                Icon:  Download,
                title: "Instant Downloads",
                sub:   "Get your eBook immediately",
                color: "#203A2B",
              },
              {
                Icon:  Lock,
                title: "Secure Payments",
                sub:   "Encrypted via Razorpay",
                color: "#315B55",
              },
              {
                Icon:  Sparkles,
                title: "Premium eBooks",
                sub:   "Handpicked quality titles",
                color: "#203A2B",
              },
              {
                Icon:  Globe,
                title: "Read Anywhere",
                sub:   "Any device, anytime",
                color: "#315B55",
              },
            ].map(({ Icon, title, sub, color }, i) => (
              <div
                key={title}
                className={`flex items-center gap-4 px-6 py-5
                  ${i < 3 ? "border-r border-[#ECEAE5]" : ""}
                  ${i >= 2 ? "border-t border-[#ECEAE5] lg:border-t-0" : ""}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={18} strokeWidth={1.5} style={{ color }} />
                </div>
                <div>
                  <p className="font-body text-[12px] font-bold text-[#242824] uppercase tracking-wide leading-tight">
                    {title}
                  </p>
                  <p className="font-body text-[11px] text-[#777970] mt-0.5 leading-snug">
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3 · EXCLUSIVE OFFERS  (only when active offers exist)
      ══════════════════════════════════════════════════════════════ */}
      <div className="cv-auto">
        <OffersSection offers={activeOffers} />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          4 · BROWSE BY CATEGORY  (horizontal circular scroll)
      ══════════════════════════════════════════════════════════════ */}
      <div className="cv-auto">
        <CategorySection categories={categories} />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          5 · BESTSELLING eBOOKS  (carousel)
      ══════════════════════════════════════════════════════════════ */}
      <div className="cv-auto">
        <BookCarousel
          heading="Bestselling eBooks"
          eyebrow="Top Picks"
          viewAllHref="/books?filter=bestsellers"
          books={bestsellers}
          bgColor="#F5EFE6"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          6 · EXPLORE MORE eBOOKS  (carousel)
      ══════════════════════════════════════════════════════════════ */}
      <div className="cv-auto">
        <BookCarousel
          heading="Explore More eBooks"
          eyebrow="More to Discover"
          viewAllHref="/books"
          books={exploreBooks}
          bgColor="#FFFCF7"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          8 · BRAND STORY BANNER
      ══════════════════════════════════════════════════════════════ */}
      <div className="cv-auto">
        <BrandStoryBanner />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          8 · CUSTOMER TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <div className="cv-auto">
        <TestimonialsSection />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          9 · NEWSLETTER SUBSCRIPTION BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section className="cv-auto bg-white py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden">

            {/* Background photo */}
            <Image
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center"
              aria-hidden
            />
            {/* Layered gradient: strong left, fades right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#203A2B]/96 via-[#203A2B]/82 to-[#203A2B]/45" />
            {/* Subtle grain texture */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==\")",
              }}
            />

            <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-center">

              {/* Left – copy */}
              <div>
                {/* Newsletter icon */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 border border-[#C6A66B]/30 flex items-center justify-center">
                    <BookOpen size={18} className="text-[#C6A66B]" strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-px bg-[#C6A66B]" />
                    <p className="text-[10px] font-body font-bold uppercase tracking-[0.28em] text-[#A8B5A0]">
                      Join Our Reading Community
                    </p>
                  </div>
                </div>

                <h2 className="font-heading text-[32px] sm:text-[40px] lg:text-[46px] font-bold text-[#FFFCF7] leading-[1.1] mb-4">
                  Stay Inspired.
                </h2>
                <p className="font-body text-[13px] text-[#A8B5A0] leading-relaxed max-w-md mb-6">
                  Get the latest eBook releases, exclusive offers, and reading inspiration delivered to your inbox.
                </p>

                {/* Trust chips */}
                <div className="flex flex-wrap gap-4">
                  {[
                    { Icon: CheckCircle, text: "No spam, ever"          },
                    { Icon: Headphones,  text: "Unsubscribe anytime"    },
                    { Icon: Sparkles,    text: "Exclusive reader deals"  },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5">
                      <Icon size={12} className="text-[#C6A66B] shrink-0" />
                      <span className="text-[11px] font-body text-[#A8B5A0]">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right – form card */}
              <div className="bg-white p-6 shadow-2xl rounded-2xl">
                <p className="font-heading text-[20px] font-bold text-[#203A2B] mb-1">
                  Join the community
                </p>
                <p className="font-body text-[11px] text-[#777970] mb-5">
                  Get your first book recommendation today.
                </p>
                <NewsletterForm source="homepage" variant="banner" />
                <p className="font-body text-[10px] text-[#A8B5A0] mt-3 leading-relaxed">
                  By subscribing you agree to our{" "}
                  <a href="/privacy" className="underline hover:text-[#203A2B] transition-colors">
                    Privacy Policy
                  </a>
                  . Unsubscribe at any time.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          10 · TRUST STRIP  (bottom of page, above footer)
      ══════════════════════════════════════════════════════════════ */}
      <section className="cv-auto bg-[#F5F2EE] border-t border-[#ECEAE5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              {
                Icon:  BookOpen,
                title: "Handpicked Books",
                sub:   "Curated with purpose",
                color: "#203A2B",
              },
              {
                Icon:  ShieldCheck,
                title: "Quality You Can Trust",
                sub:   "Thoroughly crafted",
                color: "#315B55",
              },
              {
                Icon:  Download,
                title: "Instant Access",
                sub:   "Download in seconds",
                color: "#203A2B",
              },
              {
                Icon:  Headphones,
                title: "Reader Support",
                sub:   "We're here to help",
                color: "#315B55",
              },
            ].map(({ Icon, title, sub, color }, i) => (
              <div
                key={title}
                className={`flex items-center gap-4 px-6 py-6
                  ${i < 3 ? "border-r border-[#ECEAE5]" : ""}
                  ${i >= 2 ? "border-t border-[#ECEAE5] lg:border-t-0" : ""}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={18} strokeWidth={1.5} style={{ color }} />
                </div>
                <div>
                  <p className="font-body text-[12px] font-bold text-[#242824] uppercase tracking-wide leading-tight">
                    {title}
                  </p>
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
