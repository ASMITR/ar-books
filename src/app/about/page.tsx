import { getStoreSettings, getFeaturedBooks } from "@/lib/firebase/firestore";
import { BookCover } from "@/components/book/BookCover";
import { BrandStripeDivider } from "@/components/shared/BrandStripeDivider";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Author",
  description: "Learn about Asmit Rajaramkar — author, writer, and independent publisher.",
};

export default async function AboutPage() {
  const [settings, featuredBooks] = await Promise.all([
    getStoreSettings(),
    getFeaturedBooks(),
  ]);

  const subjects = [
    "Business & Entrepreneurship",
    "Personal Development",
    "Finance & Money",
    "Technology & Programming",
    "Productivity",
    "Fiction & Storytelling",
    "Horror & Thriller",
    "Science Fiction",
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-[#789185]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.2em] text-white/60 mb-4">
                About the Author
              </p>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-none mb-6">
                Asmit Rajaramkar
              </h1>
              <p className="font-body text-white/80 text-lg leading-relaxed max-w-lg">
                {settings?.authorBio ??
                  "I write books that help people think clearly, build skills, and explore new ideas. From business and finance to fiction and technology — every book is crafted with care and purpose."}
              </p>
            </div>
            <div className="flex items-center justify-center">
              {settings?.authorPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.authorPhotoUrl}
                  alt="Asmit Rajaramkar"
                  className="max-h-96 object-contain rounded-sm shadow-2xl"
                />
              ) : (
                <div className="w-64 h-80 bg-white/10 flex items-center justify-center">
                  <p className="font-heading text-white/30 text-center text-sm px-4">
                    Author photo can be added via the admin dashboard.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <BrandStripeDivider />

      {/* Writing philosophy */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-4">
              Writing Philosophy
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808] mb-8">
              Why I Write
            </h2>
            <p className="font-body text-[#777777] text-lg leading-relaxed mb-6">
              Every book I write starts with a question I genuinely want to answer — for myself and for readers. I believe the best books are honest, practical, and written with a clear purpose.
            </p>
            <p className="font-body text-[#777777] leading-relaxed">
              Whether it&apos;s a guide to building a business, a deep dive into personal finance, or a work of fiction that explores the human condition — I approach each project with the same commitment: to make something worth your time.
            </p>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="bg-[#FAF9F6] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-4">
            Areas of Interest
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808] mb-10">
            What I Write About
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {subjects.map((subject) => (
              <div
                key={subject}
                className="bg-white border border-[#E9E7E2] px-5 py-4 text-sm font-body font-medium text-[#080808]"
              >
                {subject}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected books */}
      {featuredBooks.length > 0 && (
        <section className="bg-white py-16 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-4">
              My Work
            </p>
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808]">
                Selected Books
              </h2>
              <Link
                href="/books"
                className="hidden sm:inline-block text-xs font-body font-medium uppercase tracking-wider text-[#777777] hover:text-[#080808] transition-colors border-b border-[#777777]"
              >
                View All
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              {featuredBooks.slice(0, 4).map((book) => (
                <Link key={book.id} href={`/books/${book.slug}`} className="group flex flex-col items-center gap-3">
                  <BookCover src={book.coverImageUrl} title={book.title} size="lg" perspective />
                  <p className="font-heading text-sm font-semibold text-[#080808] group-hover:text-[#789185] transition-colors text-center max-w-[180px]">
                    {book.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <BrandStripeDivider />

      {/* CTA */}
      <section className="bg-[#FFC928] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-4xl lg:text-6xl font-bold text-[#080808] mb-4">
            Ready to Start Reading?
          </h2>
          <p className="font-body text-[#080808]/70 text-lg mb-8 max-w-md mx-auto">
            Browse my complete catalog and find your next great read.
          </p>
          <Link
            href="/books"
            className="inline-block bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-10 py-4 hover:bg-[#789185] transition-colors"
          >
            Explore My Books
          </Link>
        </div>
      </section>
    </>
  );
}
