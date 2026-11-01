"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { BookCard } from "@/components/book/BookCard";
import type { Book } from "@/types";

interface BookCarouselProps {
  heading: string;
  eyebrow?: string;
  viewAllHref?: string;
  books: Book[];
  /** bg-* tailwind class or raw CSS colour for the section wrapper */
  bgColor?: string;
}

export function BookCarousel({
  heading,
  eyebrow,
  viewAllHref = "/books",
  books,
  bgColor = "#F5EFE6",
}: BookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    // Scroll roughly one "page" worth of cards
    const amount = scrollRef.current.clientWidth * 0.85;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-14 lg:py-20" style={{ backgroundColor: bgColor }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 lg:mb-10">
          <div>
            {eyebrow && (
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-px bg-[#C6A66B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.28em] text-[#C6A66B]">
                  {eyebrow}
                </p>
              </div>
            )}
            <h2 className="font-heading text-[34px] sm:text-[44px] font-bold text-[#242824] leading-tight">
              {heading}
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            {/* Prev / Next arrows */}
            <button
              onClick={() => scroll("left")}
              aria-label={`Scroll ${heading} left`}
              className="w-9 h-9 border border-[#E6DFD5] flex items-center justify-center text-[#777970] hover:border-[#203A2B] hover:text-[#203A2B] hover:bg-[#FFFCF7] transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label={`Scroll ${heading} right`}
              className="w-9 h-9 border border-[#E6DFD5] flex items-center justify-center text-[#777970] hover:border-[#203A2B] hover:text-[#203A2B] hover:bg-[#FFFCF7] transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>

            <Link
              href={viewAllHref}
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B]/40 pb-0.5 hover:border-[#203A2B] transition-colors"
            >
              View All <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {/* ── Scrollable book row ── */}
        {books.length > 0 ? (
          <>
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
            >
              {books.map((book) => (
                <div
                  key={book.id}
                  // Card widths: show ~2.2 on mobile, 3 on sm, 4 on md, 5 on lg, 6 on xl
                  className="shrink-0 w-[46vw] sm:w-[30vw] md:w-[23vw] lg:w-[18vw] xl:w-[15.5%] max-w-[240px]"
                >
                  <BookCard book={book} />
                </div>
              ))}
            </div>

            {/* Mobile "View All" link below */}
            <div className="sm:hidden mt-6 flex justify-center">
              <Link
                href={viewAllHref}
                className="inline-flex items-center gap-1.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B]/40 pb-0.5 hover:border-[#203A2B] transition-colors"
              >
                View All <ArrowRight size={11} />
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BookOpen size={36} className="text-[#A8B5A0]" strokeWidth={1} />
            <p className="font-body text-[13px] text-[#777970] text-center">
              No books available yet. Check back soon.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
