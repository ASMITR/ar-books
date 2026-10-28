import { getStoreSettings, getFeaturedBooks } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, User, PenLine, BookOpen, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Author",
  description: "Learn about Asmit Rajaramkar — author, writer, and independent publisher.",
};

const subjects = [
  { label: "Business & Entrepreneurship", icon: "01" },
  { label: "Personal Development",        icon: "02" },
  { label: "Finance & Money",             icon: "03" },
  { label: "Technology & Programming",    icon: "04" },
  { label: "Productivity",                icon: "05" },
  { label: "Fiction & Storytelling",      icon: "06" },
  { label: "Horror & Thriller",           icon: "07" },
  { label: "Science Fiction",             icon: "08" },
];

export default async function AboutPage() {
  const [settings, featuredBooks] = await Promise.all([
    getStoreSettings(),
    getFeaturedBooks(),
  ]);

  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Photo */}
            <div className="relative order-first lg:order-last flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px]">
                {/* Offset border accent */}
                <div className="absolute -bottom-3 -right-3 w-full h-full border-2 border-[#C6A66B] rounded-sm" />
                <div className="relative bg-[#F5EFE6] border border-[#E6DFD5] rounded-sm overflow-hidden aspect-[4/5]">
                  {settings?.authorPhotoUrl ? (
                    <Image
                      src={settings.authorPhotoUrl}
                      alt="Asmit Rajaramkar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 h-full text-[#E6DFD5]">
                      <User size={52} />
                      <p className="font-body text-[11px] text-[#A8B5A0] text-center px-8">
                        Author photo can be added via the admin dashboard.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-px bg-[#C6A66B]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#A8B5A0]">
                    Meet the Author
                  </p>
                </div>
                <h1 className="font-heading text-[36px] sm:text-[48px] lg:text-[52px] font-bold text-[#242824] leading-tight">
                  Asmit<br />Rajaramkar
                </h1>
              </div>

              <p className="font-body text-[14px] sm:text-[15px] text-[#555] leading-relaxed max-w-lg">
                {settings?.authorBio ??
                  "I write books that help people think clearly, build skills, and explore new ideas. From business and finance to fiction and technology — every book is crafted with care and purpose."}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-6 py-4 border-y border-[#E6DFD5]">
                <div>
                  <p className="font-heading text-[28px] font-bold text-[#203A2B] leading-none">{featuredBooks.length}+</p>
                  <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider mt-0.5">Books</p>
                </div>
                <div className="w-px h-10 bg-[#E6DFD5]" />
                <div>
                  <p className="font-heading text-[28px] font-bold text-[#203A2B] leading-none">{subjects.length}</p>
                  <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider mt-0.5">Subjects</p>
                </div>
                <div className="w-px h-10 bg-[#E6DFD5]" />
                <div>
                  <p className="font-heading text-[28px] font-bold text-[#203A2B] leading-none">100%</p>
                  <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider mt-0.5">Independent</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3 hover:bg-[#315B55] transition-colors rounded-sm"
                >
                  <BookOpen size={13} /> Browse Books
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-[#E6DFD5] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3 hover:border-[#203A2B] hover:text-[#203A2B] transition-colors rounded-sm"
                >
                  <Mail size={13} /> Get in Touch
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Why I Write ───────────────────────────────────────────────────── */}
      <section className="py-14 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 lg:gap-20 items-start">

            <div className="lg:sticky lg:top-28">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-6 rounded-full bg-[#203A2B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">Philosophy</p>
              </div>
              <h2 className="font-heading text-[28px] sm:text-[34px] font-bold text-[#242824] leading-tight">
                Why I Write
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              {[
                {
                  icon: <PenLine size={16} />,
                  title: "Honest & Purposeful",
                  body: "Every book I write starts with a question I genuinely want to answer — for myself and for readers. I believe the best books are honest, practical, and written with a clear purpose.",
                },
                {
                  icon: <BookOpen size={16} />,
                  title: "Worth Your Time",
                  body: "Whether it's a guide to building a business, a deep dive into personal finance, or a work of fiction that explores the human condition — I approach each project with the same commitment: to make something worth your time.",
                },
                {
                  icon: <Mail size={16} />,
                  title: "Direct from Author",
                  body: "Every book is published independently, which means you get it straight from the source — no middlemen, no markups, just the work itself.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-6 py-5 flex gap-4 items-start hover:border-[#203A2B]/30 hover:shadow-sm transition-all duration-200">
                  <span className="mt-0.5 shrink-0 text-[#203A2B]">{item.icon}</span>
                  <div>
                    <p className="font-heading text-[15px] font-bold text-[#242824] mb-1">{item.title}</p>
                    <p className="font-body text-[13px] text-[#777] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── What I Write About ────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-y border-[#E6DFD5] py-14 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-6 rounded-full bg-[#203A2B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">Areas of Interest</p>
              </div>
              <h2 className="font-heading text-[28px] sm:text-[34px] font-bold text-[#242824]">What I Write About</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {subjects.map((s) => (
              <div
                key={s.label}
                className="group bg-[#F5EFE6] border border-[#E6DFD5] rounded-sm p-4 sm:p-5 hover:border-[#203A2B]/40 hover:bg-[#FFFCF7] hover:shadow-sm transition-all duration-200"
              >
                <span className="font-heading text-[28px] font-bold text-[#E6DFD5] group-hover:text-[#C6A66B]/50 transition-colors leading-none block mb-2">
                  {s.icon}
                </span>
                <p className="font-body text-[12px] sm:text-[13px] font-semibold text-[#242824] leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Books ────────────────────────────────────────────────── */}
      {featuredBooks.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-6 rounded-full bg-[#203A2B]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">My Work</p>
                </div>
                <h2 className="font-heading text-[28px] sm:text-[34px] font-bold text-[#242824]">Selected Books</h2>
              </div>
              <Link
                href="/books"
                className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B] pb-0.5 hover:text-[#315B55] hover:border-[#315B55] transition-colors"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {featuredBooks.slice(0, 4).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-t border-[#E6DFD5] py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-sm bg-[#203A2B] px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#315B55] rounded-full blur-3xl opacity-25 -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-px bg-[#C6A66B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">Ready to Read?</p>
              </div>
              <h2 className="font-heading text-[26px] sm:text-[32px] font-bold text-[#FFFCF7] leading-tight">
                Find your next great read.
              </h2>
            </div>
            <Link
              href="/books"
              className="relative z-10 shrink-0 inline-flex items-center gap-2.5 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-[#d4b77e] transition-colors rounded-sm"
            >
              Explore Books <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
