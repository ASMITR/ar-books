"use client";

import { useState, useEffect, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  { name: "Rahul M.", initials: "RM", text: "Incredibly well-written and practical. I finished it in two days and immediately started applying the concepts.", book: "The Founder's Mindset" },
  { name: "Priya S.", initials: "PS", text: "Finally a finance book that speaks in plain language. No jargon, just clear actionable advice.", book: "Build Wealth Early" },
  { name: "Arjun K.", initials: "AK", text: "The best investment I've made this year. Worth every rupee and more.", book: "Code & Clarity" },
];

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = (next: number, dir: "left" | "right") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent((next + testimonials.length) % testimonials.length);
      setAnimating(false);
    }, 350);
  };

  const next = () => go(current + 1, "left");
  const prev = () => go(current - 1, "right");

  // auto-advance every 5 s
  useEffect(() => {
    timerRef.current = setTimeout(next, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const t = testimonials[current];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* card */}
      <div
        className="relative w-full max-w-2xl mx-auto overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          key={current}
          className="group relative bg-white/5 border border-white/10 p-8 sm:p-10 flex flex-col gap-5"
          style={{
            animation: animating
              ? `${direction === "left" ? "slideOutLeft" : "slideOutRight"} 350ms ease forwards`
              : `${direction === "left" ? "slideInRight" : "slideInLeft"} 350ms ease forwards`,
          }}
        >
          {/* top accent line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FFC928] to-[#789185]" />

          <Quote size={28} className="text-[#FFC928]" />

          <p className="font-body text-white/90 leading-relaxed text-base sm:text-lg flex-1">
            &ldquo;{t.text}&rdquo;
          </p>

          <div className="border-t border-white/10 pt-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#789185] to-[#FFC928]/60 flex items-center justify-center shrink-0">
              <span className="text-xs font-body font-bold text-white">{t.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-white text-base">{t.name}</p>
              <p className="text-[11px] font-body text-white/40 truncate">{t.book}</p>
            </div>
            <div className="flex gap-0.5 shrink-0">
              {[...Array(5)].map((_, j) => (
                <Star key={j} size={12} className="fill-[#FFC928] text-[#FFC928]" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#FFC928] hover:text-[#FFC928] transition-all duration-200"
          aria-label="Previous"
        >
          <ChevronLeft size={16} />
        </button>

        {/* dots */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? "left" : "right")}
              className="transition-all duration-300"
              aria-label={`Go to review ${i + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 h-2 bg-[#FFC928]"
                    : "w-2 h-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={next}
          className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#FFC928] hover:text-[#FFC928] transition-all duration-200"
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* progress bar */}
      <div className="w-full max-w-2xl mx-auto h-px bg-white/10 overflow-hidden">
        <div
          key={current}
          className="h-full bg-gradient-to-r from-[#FFC928] to-[#789185]"
          style={{ animation: "progress 5s linear forwards" }}
        />
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-60px); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(60px); }
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
