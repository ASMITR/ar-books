import { getStoreSettings, getFeaturedBooks } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E9E7E2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text */}
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Meet the Author</p>
                <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#080808]">
                  Asmit Rajaramkar
                </h1>
              </div>
              <p className="font-body text-[#777777] text-lg leading-relaxed">
                {settings?.authorBio ??
                  "I write books that help people think clearly, build skills, and explore new ideas. From business and finance to fiction and technology — every book is crafted with care and purpose."}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#789185] transition-colors"
                >
                  Browse My Books <ArrowRight size={12} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border-2 border-[#080808] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#080808] hover:text-white transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>

            {/* Photo */}
            <div className="relative order-first lg:order-last">
              <div className="absolute -top-4 -right-4 w-full h-full border-2 border-[#FFC928] hidden sm:block" />
              <div className="relative bg-white border border-[#E9E7E2] overflow-hidden">
                {settings?.authorPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.authorPhotoUrl}
                    alt="Asmit Rajaramkar"
                    className="w-full h-auto block"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 text-[#E9E7E2] h-64">
                    <User size={48} />
                    <p className="font-body text-sm text-center px-8">Author photo can be added via the admin dashboard.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Writing Philosophy ───────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Writing Philosophy</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808]">Why I Write</h2>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-body text-[#777777] leading-relaxed">
                Every book I write starts with a question I genuinely want to answer — for myself and for readers. I believe the best books are honest, practical, and written with a clear purpose.
              </p>
              <p className="font-body text-[#777777] leading-relaxed">
                Whether it&apos;s a guide to building a business, a deep dive into personal finance, or a work of fiction that explores the human condition — I approach each project with the same commitment: to make something worth your time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What I Write About ───────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Areas of Interest</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808]">What I Write About</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 scrollbar-none">
            {subjects.map((subject, i) => (
              <div
                key={subject}
                className="group bg-white border border-[#E9E7E2] p-5 hover:border-[#789185] hover:shadow-md transition-all duration-200 flex flex-col gap-2 snap-start shrink-0 w-[60vw] sm:w-auto"
              >
                <span className="font-heading text-3xl font-bold text-[#E9E7E2] group-hover:text-[#FFC928]/60 transition-colors leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-body text-sm font-medium text-[#080808] group-hover:text-[#789185] transition-colors">{subject}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] font-body text-[#777777] mt-4 sm:hidden">← swipe to see more →</p>
        </div>
      </section>

      {/* ── Selected Books ───────────────────────────────────────────────── */}
      {featuredBooks.length > 0 && (
        <section className="bg-white py-16 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">My Work</p>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808]">Selected Books</h2>
              </div>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 text-xs font-body font-bold uppercase tracking-wider text-[#080808] border-b-2 border-[#FFC928] pb-1 hover:text-[#789185] transition-colors shrink-0"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredBooks.slice(0, 4).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFC928] py-14 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-body uppercase tracking-[0.2em] text-[#080808]/60 mb-2">Ready to Read?</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808]">
              Find your next great read.
            </h2>
          </div>
          <Link
            href="/books"
            className="shrink-0 inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#789185] transition-colors"
          >
            Explore My Books <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
