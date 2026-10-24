export const dynamic = "force-dynamic";

import Link from "next/link";
import { getFeaturedBooks, getVisibleCategories, getStoreSettings } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { BookCover } from "@/components/book/BookCover";
import { BrandStripeDivider } from "@/components/shared/BrandStripeDivider";
import { formatINR } from "@/lib/currency";

export default async function HomePage() {
  const [featuredBooks, categories, settings] = await Promise.all([
    getFeaturedBooks(),
    getVisibleCategories(),
    getStoreSettings(),
  ]);

  const heroBook = featuredBooks[0];
  const secondBook = featuredBooks[1];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#789185]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="flex flex-col gap-6">
              <p className="text-xs font-body uppercase tracking-[0.2em] text-white/70">
                Asmit Rajaramkar — Author
              </p>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-none">
                {settings?.homepageSettings?.heroHeadline ?? "WHAT WILL YOU DISCOVER NEXT?"}
              </h1>
              <p className="font-body text-white/80 text-lg leading-relaxed max-w-md">
                {settings?.homepageSettings?.heroSubtext ??
                  "Explore new ideas, build useful skills, and discover fresh perspectives through the books I write."}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/books"
                  className="inline-block bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#F2B916] transition-colors"
                >
                  Explore My Books
                </Link>
                <Link
                  href="/about"
                  className="inline-block border border-white text-white font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-white hover:text-[#080808] transition-colors"
                >
                  About the Author
                </Link>
              </div>
            </div>

            {/* Right — book mockups */}
            <div className="flex items-center justify-center gap-6 relative">
              {heroBook && (
                <div className="relative z-10">
                  <BookCover
                    src={heroBook.coverImageUrl}
                    title={heroBook.title}
                    size="xl"
                    perspective
                  />
                  <div className="absolute -bottom-3 -right-3 bg-[#FFC928] text-[#080808] text-xs font-bold px-3 py-1 font-body uppercase tracking-wide">
                    {formatINR(heroBook.pricePaise)}
                  </div>
                </div>
              )}
              {secondBook && (
                <div className="relative -rotate-6 opacity-80 mt-8">
                  <BookCover
                    src={secondBook.coverImageUrl}
                    title={secondBook.title}
                    size="lg"
                  />
                </div>
              )}
              {!heroBook && (
                <div className="text-white/40 font-heading text-xl text-center">
                  Add books in the admin dashboard to display them here.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <BrandStripeDivider />

      {/* ── Featured Books ───────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808]">
              Books by Asmit Rajaramkar
            </h2>
            <Link
              href="/books"
              className="hidden sm:inline-block text-xs font-body font-medium uppercase tracking-wider text-[#777777] hover:text-[#080808] transition-colors border-b border-[#777777]"
            >
              View All
            </Link>
          </div>

          {featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

      {/* ── Browse by Category ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-[#FAF9F6] py-16 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808] mb-10">
              Explore by Subject
            </h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="inline-block border border-[#E9E7E2] bg-white px-5 py-3 text-sm font-body font-medium text-[#080808] hover:bg-[#080808] hover:text-white hover:border-[#080808] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <BrandStripeDivider />

      {/* ── Promotional Banner ───────────────────────────────────────────── */}
      <section className="bg-[#FFC928] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-4xl lg:text-6xl font-bold text-[#080808] leading-none mb-4">
                YOUR NEXT GREAT READ STARTS HERE
              </h2>
              <p className="font-body text-[#080808]/70 text-lg mb-8 max-w-md">
                Every book is written, edited, and published by me — direct to you, no middlemen.
              </p>
              <Link
                href="/books"
                className="inline-block bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#789185] transition-colors"
              >
                Browse My Books
              </Link>
            </div>
            <div className="flex gap-4 justify-center lg:justify-end">
              {featuredBooks.slice(0, 3).map((book, i) => (
                <div
                  key={book.id}
                  className="shrink-0"
                  style={{ transform: `rotate(${[-4, 0, 4][i] ?? 0}deg)` }}
                >
                  <BookCover src={book.coverImageUrl} title={book.title} size="md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About the Author ─────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-3">
                About the Author
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808] mb-6">
                Asmit Rajaramkar
              </h2>
              <p className="font-body text-[#777777] leading-relaxed mb-6">
                {settings?.authorBio ??
                  "I write books that help people think clearly, build skills, and explore new ideas. From business and finance to fiction and technology — every book is crafted with care and purpose."}
              </p>
              <Link
                href="/about"
                className="inline-block border border-[#080808] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#080808] hover:text-white transition-colors"
              >
                Read More
              </Link>
            </div>
            <div className="bg-[#FAF9F6] p-8 flex items-center justify-center min-h-[300px]">
              {settings?.authorPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.authorPhotoUrl}
                  alt="Asmit Rajaramkar"
                  className="max-h-80 object-contain"
                />
              ) : (
                <div className="text-[#E9E7E2] font-heading text-lg text-center">
                  Author photo can be added via the admin dashboard.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
