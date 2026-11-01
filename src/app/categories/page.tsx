import { getVisibleCategories, getPublishedBooks } from "@/lib/firebase/firestore";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse eBooks by Asmit Rajaramkar by category — business, finance, personal development, fiction, and more.",
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const [categories, allBooks] = await Promise.all([
    getVisibleCategories(),
    getPublishedBooks(),
  ]);

  const countMap: Record<string, number> = {};
  for (const book of allBooks) {
    for (const cid of book.categoryIds) {
      countMap[cid] = (countMap[cid] ?? 0) + 1;
    }
  }

  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1 h-7 rounded-full bg-[#203A2B]" />
              <div>
                <h1 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#242824] leading-none">
                  Categories
                </h1>
                <p className="font-body text-[11px] text-[#A8B5A0] mt-1 tracking-wide">
                  Browse the collection by topic
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">{categories.length}</p>
                <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">Categories</p>
              </div>
              <div className="w-px h-8 bg-[#E6DFD5]" />
              <div className="text-right">
                <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">{allBooks.length}</p>
                <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">Titles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category grid ───────────────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
              <div className="w-16 h-16 bg-[#E9E7E2] flex items-center justify-center rounded-sm">
                <BookOpen size={24} className="text-[#bbb]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-heading text-xl font-bold text-[#242824] mb-2">No categories yet</p>
                <p className="font-body text-sm text-[#777970]">Check back soon.</p>
              </div>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-6 py-3 hover:bg-[#315B55] transition-colors rounded-sm mt-2"
              >
                Browse All Books <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {categories.map((category) => {
                const bookCount = countMap[category.id] ?? 0;
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group relative flex flex-col bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden
                      hover:border-[#203A2B]/40 hover:shadow-[0_8px_32px_rgba(32,58,43,0.10)]
                      transition-all duration-300"
                  >
                    {/* Gold top accent on hover */}
                    <div className="h-[2.5px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
                      scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    <div className="flex flex-col gap-3 p-5 sm:p-6 flex-1">
                      {/* Icon */}
                      <div className="w-10 h-10 bg-[#203A2B]/8 rounded-sm flex items-center justify-center shrink-0">
                        <BookOpen size={18} className="text-[#203A2B]" strokeWidth={1.5} />
                      </div>

                      {/* Name + description */}
                      <div className="flex flex-col gap-1.5 flex-1">
                        <h2 className="font-heading text-[17px] font-bold text-[#242824] leading-snug
                          group-hover:text-[#203A2B] transition-colors duration-200">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="font-body text-[12px] text-[#777970] leading-relaxed line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#E6DFD5]">
                        <span className="font-body text-[11px] text-[#A8B5A0]">
                          {bookCount} {bookCount === 1 ? "book" : "books"}
                        </span>
                        <span className="flex items-center gap-1 font-body text-[11px] font-bold uppercase tracking-[0.1em]
                          text-[#203A2B] group-hover:gap-1.5 transition-all duration-200">
                          Explore
                          <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-[#FFFCF7] border-t border-[#E6DFD5] py-12 lg:py-14">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-sm bg-[#203A2B] px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#315B55] rounded-full blur-3xl opacity-25 -translate-y-1/2 translate-x-1/4" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-4 h-px bg-[#C6A66B]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">Full Collection</p>
                </div>
                <h2 className="font-heading text-[26px] sm:text-[32px] font-bold text-[#FFFCF7] leading-tight">
                  Not sure which category?
                </h2>
                <p className="font-body text-[13px] text-[#A8B5A0] mt-1">Browse all {allBooks.length} titles in one place.</p>
              </div>
              <Link
                href="/books"
                className="relative z-10 shrink-0 inline-flex items-center gap-2.5 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-[#d4b77e] transition-colors rounded-sm shadow-sm"
              >
                All eBooks <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
