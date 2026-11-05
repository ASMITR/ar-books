"use client";

import { Star, CheckCircle } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Rahul M.",
    initials: "RM",
    review: "Incredibly well-written and practical. I finished it in two days and immediately started applying the concepts.",
    bookTitle: "The Founder's Mindset",
    verified: true,
    rating: 5,
    accent: "#203A2B",
  },
  {
    name: "Priya S.",
    initials: "PS",
    review: "Finally a finance book that speaks in plain language. No jargon, just clear actionable advice I could use from day one.",
    bookTitle: "Build Wealth Early",
    verified: true,
    rating: 5,
    accent: "#315B55",
  },
  {
    name: "Arjun K.",
    initials: "AK",
    review: "The best investment I've made this year. Immediately impactful — I've already recommended it to three colleagues.",
    bookTitle: "Code & Clarity",
    verified: true,
    rating: 5,
    accent: "#4A5C1E",
  },
  {
    name: "Sneha R.",
    initials: "SR",
    review: "The writing is crisp, the ideas are fresh. I keep coming back to re-read chapters whenever I need a boost.",
    bookTitle: "The Founder's Mindset",
    verified: true,
    rating: 5,
    accent: "#1D4060",
  },
  {
    name: "Vikram D.",
    initials: "VD",
    review: "Bought it on a whim and couldn't put it down. Changed the way I think about productivity entirely.",
    bookTitle: "Code & Clarity",
    verified: true,
    rating: 5,
    accent: "#6B3E0D",
  },
];

// Triple for seamless infinite loop
const TRACK = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} className={i < n ? "fill-[#C6A66B] text-[#C6A66B]" : "fill-[#E6DFD5] text-[#E6DFD5]"} />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-[#FFFCF7] py-12 lg:py-14 overflow-hidden">

      {/* ── Eyebrow label ── */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className="w-8 h-px bg-[#E6DFD5]" />
        <p className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#A8B5A0]">
          What Readers Say
        </p>
        <span className="w-8 h-px bg-[#E6DFD5]" />
      </div>

      {/* ── Marquee track ── */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-[#FFFCF7] to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-[#FFFCF7] to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-3 w-max marquee-track"
          style={{ animation: "tmScroll 32s linear infinite" }}
        >
          {TRACK.map((t, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[260px] sm:w-[300px] bg-white border border-[#E6DFD5] px-5 py-4 flex flex-col gap-3"
            >
              {/* Stars */}
              <Stars n={t.rating} />

              {/* Review */}
              <p className="font-body text-[12px] text-[#555] leading-[1.75] line-clamp-3">
                &ldquo;{t.review}&rdquo;
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-[#F5EFE6]">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-body text-[9px] font-bold text-[#FFFCF7]"
                  style={{ backgroundColor: t.accent }}
                >
                  {t.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[13px] font-bold text-[#242824] leading-tight truncate">
                    {t.name}
                  </p>
                  <p className="font-body text-[9px] text-[#A8B5A0] truncate italic mt-0.5">
                    {t.bookTitle}
                  </p>
                </div>
                {t.verified && (
                  <CheckCircle size={11} className="shrink-0 text-[#203A2B]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
