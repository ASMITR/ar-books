"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookCover } from "@/components/book/BookCover";
import { ArrowRight, BookOpen, Zap, ShieldCheck, Download, Star } from "lucide-react";
import type { Book } from "@/types";

interface HeroSectionProps {
  books:     Book[];
  headline?: string;
  subtext?:  string;
}

// ─── Rotating headline words ──────────────────────────────────────────────────
const WORDS = ["Bold Thinkers", "Curious Souls", "Every Mind", "Your Growth", "New Ideas"];

function RotatingWord() {
  const [idx,  setIdx]  = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx((i) => (i + 1) % WORDS.length); setShow(true); }, 350);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{
      display:    "inline-block",
      color:      "#C6A66B",
      opacity:    show ? 1 : 0,
      transform:  show ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.35s ease, transform 0.35s ease",
    }}>
      {WORDS[idx]}
    </span>
  );
}

// ─── Book display (left panel) ────────────────────────────────────────────────
function BookDisplay({ book }: { book: Book }) {
  return (
    <div className="flex flex-col items-center gap-5 select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(198,166,107,0.16) 0%, transparent 70%)" }} />
        <div style={{ filter: "drop-shadow(0 28px 56px rgba(0,0,0,0.72)) drop-shadow(0 6px 20px rgba(0,0,0,0.48))" }}>
          <BookCover src={book.coverImageUrl} title={book.title} size="xl" perspective priority />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 text-center px-4">
        <span className="inline-flex items-center gap-1.5 bg-[#C6A66B] text-[#0A160D]
          font-body text-[8px] font-black uppercase tracking-[0.22em] px-3 py-[5px]">
          ✦ Latest Release
        </span>
        <p className="font-heading text-[16px] font-bold text-[#FFFCF7] leading-snug line-clamp-2 mt-0.5">
          {book.title}
        </p>
        <p className="font-body text-[9px] uppercase tracking-[0.16em] text-[#A8B5A0]">by {book.author}</p>
        <div className="flex items-center gap-0.5 mt-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} size={9} className="fill-[#C6A66B] text-[#C6A66B]" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Left panel decorative background ────────────────────────────────────────
function LeftPanelBg() {
  return (
    <>
      <div className="absolute inset-0 bg-[#1C3325]" />
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <defs>
          <pattern id="lp-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#A8B5A0" fillOpacity="0.12" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lp-dots)" />
      </svg>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <defs>
          <pattern id="lp-diag" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <line x1="0" y1="40" x2="40" y2="0" stroke="#C6A66B" strokeWidth="0.3" strokeOpacity="0.07" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lp-diag)" />
      </svg>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.40) 100%)" }} />
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#C6A66B] to-transparent" />
      <svg className="absolute top-5 left-5 pointer-events-none" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden style={{ opacity: 0.28 }}>
        <path d="M0 22 L0 0 L22 0" stroke="#C6A66B" strokeWidth="1.4" fill="none" />
      </svg>
      <svg className="absolute bottom-5 right-5 pointer-events-none" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden style={{ opacity: 0.28 }}>
        <path d="M44 22 L44 44 L22 44" stroke="#C6A66B" strokeWidth="1.4" fill="none" />
      </svg>
    </>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "10+",  label: "eBooks",   sub: "& growing"    },
  { value: "₹0",   label: "Shipping", sub: "always free"  },
  { value: "100%", label: "Digital",  sub: "instant access"},
  { value: "∞",    label: "Ideas",    sub: "to explore"   },
];

// ─── Feature pills ─────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: BookOpen,    text: "Handpicked titles"  },
  { Icon: Zap,         text: "Instant download"   },
  { Icon: ShieldCheck, text: "Secure checkout"    },
  { Icon: Download,    text: "PDF · Any device"   },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export function HeroSection({ books, headline, subtext }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const anim = (delay = 0): React.CSSProperties => ({
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? "none" : "translateY(18px)",
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  return (
    <section
      className="relative flex flex-col lg:flex-row overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label="Hero"
    >

      {/* ══ LEFT: book cover panel ══════════════════════════════════════ */}
      <div className="relative flex lg:w-[42%] xl:w-[40%] flex-col items-center justify-center
        py-16 lg:py-0 min-h-[60vw] lg:min-h-0">
        <LeftPanelBg />
        <div className="relative z-10" style={{
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? "none" : "translateY(28px) scale(0.95)",
          transition: "opacity 0.85s ease 0.1s, transform 0.85s ease 0.1s",
        }}>
          {books[0] ? (
            <BookDisplay book={books[0]} />
          ) : (
            <div className="w-[180px] h-[252px] border border-[#FFFCF7]/10 flex items-center justify-center">
              <p className="font-body text-[11px] text-[#A8B5A0]/40 text-center px-4">Add books in admin</p>
            </div>
          )}
        </div>
        <div className="absolute bottom-7 inset-x-0 flex items-center justify-center gap-2.5">
          <span className="w-8 h-px bg-[#C6A66B]/40" />
          <p className="font-body text-[8px] uppercase tracking-[0.35em] text-[#A8B5A0]/50">AR Books · eBook Store</p>
          <span className="w-8 h-px bg-[#C6A66B]/40" />
        </div>
      </div>

      {/* ══ RIGHT: content panel ════════════════════════════════════════ */}
      <div className="relative flex-1 bg-[#FFFCF7] flex flex-col justify-center overflow-hidden
        px-8 sm:px-12 lg:px-14 xl:px-20 py-14 lg:py-0">

        {/* Background dot grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
          <defs>
            <pattern id="rp-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="#203A2B" fillOpacity="0.05" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rp-dots)" />
        </svg>

        {/* Decorative vertical line left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px]
          bg-gradient-to-b from-transparent via-[#C6A66B]/30 to-transparent hidden lg:block" />

        <div className="relative z-10 max-w-[540px] flex flex-col gap-0">

          {/* ── 1. Eyebrow ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-5" style={anim(0)}>
            <span className="w-6 h-px bg-[#C6A66B]" />
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.35em] text-[#C6A66B]">
              Discover · Read · Grow
            </p>
          </div>

          {/* ── 2. Headline ────────────────────────────────────────────── */}
          <h1
            className="font-heading font-bold text-[#1a2419] tracking-tight leading-[1.04] mb-5
              text-[42px] sm:text-[52px] lg:text-[56px] xl:text-[64px]"
            style={anim(0.07)}
          >
            {headline ?? (
              <>
                Books Written
                <br />
                for{" "}
                <span className="relative whitespace-nowrap">
                  <RotatingWord />
                  <span className="absolute left-0 -bottom-1.5 h-[3px] w-full pointer-events-none"
                    style={{ background: "linear-gradient(90deg, #C6A66B, #e0c080, #C6A66B)", opacity: 0.7 }} />
                </span>
              </>
            )}
          </h1>

          {/* ── 3. Sub-copy ─────────────────────────────────────────────── */}
          <p className="font-body text-[#6B7068] text-[14px] sm:text-[15px] leading-[1.8] mb-8
            border-l-[2px] border-[#C6A66B]/40 pl-4 max-w-[400px]"
            style={anim(0.13)}
          >
            {subtext ??
              "Handpicked titles across business, fiction, finance, and personal growth — written to inspire, inform, and stay with you long after the last page."}
          </p>

          {/* ── 4. Stats ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 mb-7" style={anim(0.19)}>
            {STATS.map(({ value, label, sub }, i) => (
              <div key={label}
                className={`flex flex-col items-center gap-0.5 py-4
                  ${i < 3 ? "border-r border-[#E6DFD5]" : ""}`}
              >
                <span className="font-heading text-[24px] sm:text-[28px] font-bold text-[#203A2B] leading-none">
                  {value}
                </span>
                <span className="font-body text-[11px] font-semibold text-[#242824] mt-1">
                  {label}
                </span>
                <span className="font-body text-[9px] uppercase tracking-[0.14em] text-[#A8B5A0]">
                  {sub}
                </span>
              </div>
            ))}
          </div>

          {/* ── 5. Feature list ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-8" style={anim(0.24)}>
            {FEATURES.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-[#203A2B]/8 flex items-center justify-center shrink-0">
                  <Icon size={11} className="text-[#203A2B]" strokeWidth={2} />
                </div>
                <span className="font-body text-[12px] text-[#555] font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* ── 6. CTAs ──────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-4" style={anim(0.29)}>
            <Link
              href="/books"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden
                font-body text-[11px] font-bold uppercase tracking-[0.16em]
                text-[#FFFCF7] bg-[#203A2B] px-8 py-[14px]
                hover:bg-[#2a4d36] active:scale-[0.98]
                transition-all duration-200 shadow-md"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                transition-transform duration-500 pointer-events-none" />
              Browse the Collection
              <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 font-body text-[11px] font-semibold
                text-[#777970] border-b border-dashed border-[#C6A66B]/40 pb-0.5
                hover:text-[#203A2B] hover:border-[#203A2B] transition-all duration-200"
            >
              About the Author
              <ArrowRight size={10} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
