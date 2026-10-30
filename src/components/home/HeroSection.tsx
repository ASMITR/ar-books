"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookCover } from "@/components/book/BookCover";
import { ArrowRight, BookOpen, Zap, ShieldCheck, Sparkles, Star } from "lucide-react";
import type { Book } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface HeroSectionProps {
  books:     Book[];
  headline?: string;
  subtext?:  string;
}

// ─── Rotating headline words ──────────────────────────────────────────────────
const WORDS = ["Every Mind", "Bold Thinkers", "Curious Souls", "Your Growth", "New Ideas"];

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
      transform:  show ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.35s ease, transform 0.35s ease",
    }}>
      {WORDS[idx]}
    </span>
  );
}

// ─── Left panel — single book display ────────────────────────────────────────
function BookDisplay({ book }: { book: Book }) {
  return (
    <div className="flex flex-col items-center gap-5 select-none">

      {/* Floating glow ring behind book */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(198,166,107,0.14) 0%, transparent 70%)" }} />
        <div style={{
          filter: "drop-shadow(0 24px 52px rgba(0,0,0,0.70)) drop-shadow(0 6px 18px rgba(0,0,0,0.45))",
        }}>
          <BookCover src={book.coverImageUrl} title={book.title} size="xl" perspective priority />
        </div>
      </div>

      {/* Info below cover */}
      <div className="flex flex-col items-center gap-2 text-center px-4">
        <span className="inline-flex items-center gap-1.5 bg-[#C6A66B] text-[#0A160D]
          font-body text-[8px] font-black uppercase tracking-[0.22em] px-3 py-[5px]">
          ✦ Latest Release
        </span>
        <p className="font-heading text-[16px] font-bold text-[#FFFCF7] leading-snug line-clamp-2 mt-0.5">
          {book.title}
        </p>
        <p className="font-body text-[9px] uppercase tracking-[0.16em] text-[#A8B5A0]">
          by {book.author}
        </p>
        {/* Star rating display */}
        <div className="flex items-center gap-0.5 mt-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={9} className="fill-[#C6A66B] text-[#C6A66B]" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Left panel decorative background ────────────────────────────────────────
function LeftPanelBg() {
  return (
    <>
      {/* Base */}
      <div className="absolute inset-0 bg-[#1C3325]" />

      {/* Fine dot grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <defs>
          <pattern id="lp-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#A8B5A0" fillOpacity="0.12" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lp-dots)" />
      </svg>

      {/* Diagonal lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <defs>
          <pattern id="lp-diag" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <line x1="0" y1="40" x2="40" y2="0" stroke="#C6A66B" strokeWidth="0.3" strokeOpacity="0.07" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lp-diag)" />
      </svg>

      {/* Edge radial vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.40) 100%)" }} />

      {/* Gold top accent line */}
      <div className="absolute top-0 inset-x-0 h-[3px]
        bg-gradient-to-r from-transparent via-[#C6A66B] to-transparent" />

      {/* Corner bracket — top-left */}
      <svg className="absolute top-5 left-5 pointer-events-none" width="44" height="44"
        viewBox="0 0 44 44" fill="none" aria-hidden style={{ opacity: 0.28 }}>
        <path d="M0 22 L0 0 L22 0" stroke="#C6A66B" strokeWidth="1.4" fill="none" />
      </svg>

      {/* Corner bracket — bottom-right */}
      <svg className="absolute bottom-5 right-5 pointer-events-none" width="44" height="44"
        viewBox="0 0 44 44" fill="none" aria-hidden style={{ opacity: 0.28 }}>
        <path d="M44 22 L44 44 L22 44" stroke="#C6A66B" strokeWidth="1.4" fill="none" />
      </svg>

      {/* Large decorative open-book outline — behind the book, very faint */}
      <svg className="absolute inset-0 m-auto w-[340px] h-[340px] pointer-events-none"
        viewBox="0 0 340 340" fill="none" aria-hidden style={{ opacity: 0.04 }}>
        <path d="M170 40 C120 52 40 72 20 110 L20 290 C40 252 120 232 170 222 Z"
          stroke="#C6A66B" strokeWidth="1.2" fill="rgba(198,166,107,0.2)" />
        <path d="M170 40 C220 52 300 72 320 110 L320 290 C300 252 220 232 170 222 Z"
          stroke="#C6A66B" strokeWidth="1.2" fill="rgba(198,166,107,0.15)" />
        <line x1="170" y1="40" x2="170" y2="222" stroke="#C6A66B" strokeWidth="2" />
      </svg>
    </>
  );
}

// ─── Right panel — stats strip ────────────────────────────────────────────────
const STATS = [
  { value: "10+",  label: "eBooks"       },
  { value: "∞",    label: "Ideas"        },
  { value: "₹0",   label: "Shipping"     },
  { value: "100%", label: "Digital"      },
];

// ─── Right panel — feature chips ─────────────────────────────────────────────
const CHIPS = [
  { Icon: BookOpen,   text: "Handpicked" },
  { Icon: Zap,        text: "Instant DL" },
  { Icon: ShieldCheck,text: "Secure"     },
  { Icon: Sparkles,   text: "Curated"    },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export function HeroSection({ books, headline, subtext }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const anim = (delay = 0): React.CSSProperties => ({
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? "none" : "translateY(20px)",
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  return (
    <section
      className="relative flex flex-col lg:flex-row overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label="Hero"
    >

      {/* ══════════════════════════════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative flex lg:w-[44%] xl:w-[42%] flex-col
        items-center justify-center
        py-16 lg:py-0 min-h-[60vw] lg:min-h-0">

        <LeftPanelBg />

        {/* Book */}
        <div className="relative z-10"
          style={{
            opacity:    mounted ? 1 : 0,
            transform:  mounted ? "none" : "translateY(28px) scale(0.95)",
            transition: "opacity 0.85s ease 0.15s, transform 0.85s ease 0.15s",
          }}
        >
          {books[0] ? (
            <BookDisplay book={books[0]} />
          ) : (
            <div className="w-[180px] h-[252px] border border-[#FFFCF7]/10
              flex items-center justify-center">
              <p className="font-body text-[11px] text-[#A8B5A0]/40 text-center px-4">
                Add books in admin
              </p>
            </div>
          )}
        </div>

        {/* Bottom wordmark */}
        <div className="absolute bottom-7 inset-x-0 flex items-center justify-center gap-2.5">
          <span className="w-8 h-px bg-[#C6A66B]/40" />
          <p className="font-body text-[8px] uppercase tracking-[0.35em] text-[#A8B5A0]/50">
            AR Books · eBook Store
          </p>
          <span className="w-8 h-px bg-[#C6A66B]/40" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT PANEL
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative flex-1 bg-[#FFFCF7] flex flex-col justify-center
        overflow-hidden px-8 sm:px-12 lg:px-14 xl:px-20 py-14 lg:py-0">

        {/* Large decorative quotation mark — purely visual */}
        <span
          className="absolute top-[8%] right-[6%] font-heading font-bold text-[#E6DFD5]
            pointer-events-none select-none leading-none hidden lg:block"
          style={{ fontSize: 220, lineHeight: 1 }}
          aria-hidden
        >
          "
        </span>

        {/* Subtle grid on right panel */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
          <defs>
            <pattern id="rp-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="#203A2B" fillOpacity="0.05" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rp-dots)" />
        </svg>

        {/* Content */}
        <div className="relative z-10 max-w-[520px] flex flex-col gap-7">

          {/* ── Eyebrow ── */}
          <div className="flex items-center gap-3" style={anim(0)}>
            <span className="w-7 h-px bg-[#C6A66B]" />
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.35em] text-[#C6A66B]">
              Discover · Read · Grow
            </p>
          </div>

          {/* ── Headline ── */}
          <h1
            className="font-heading font-bold text-[#1a2419] tracking-tight leading-[1.04]
              text-[44px] sm:text-[54px] lg:text-[58px] xl:text-[66px]"
            style={anim(0.07)}
          >
            {headline ? headline : (
              <>
                Books Written
                <br />
                for{" "}
                <span className="relative whitespace-nowrap">
                  <RotatingWord />
                  {/* Gold animated underline */}
                  <span
                    className="absolute left-0 -bottom-1.5 h-[3px] w-full"
                    style={{
                      background: "linear-gradient(90deg, #C6A66B, #e0c080, #C6A66B)",
                      opacity: 0.7,
                    }}
                  />
                </span>
              </>
            )}
          </h1>

          {/* ── Subtext with left accent bar ── */}
          <p
            className="font-body text-[#6B7068] text-[14px] sm:text-[15px]
              leading-[1.85] max-w-[420px]
              border-l-2 border-[#C6A66B]/50 pl-4"
            style={anim(0.14)}
          >
            {subtext ??
              "Handpicked titles across business, fiction, finance, and personal growth — written to inspire, inform, and stay with you long after the last page."}
          </p>

          {/* ── Stats row ── */}
          <div
            className="grid grid-cols-4 gap-3 py-4
              border-y border-dashed border-[#E0D9CF]"
            style={anim(0.20)}
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="font-heading text-[22px] sm:text-[26px] font-bold
                  text-[#203A2B] leading-none">
                  {value}
                </span>
                <span className="font-body text-[8px] uppercase tracking-[0.18em] text-[#A8B5A0]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Feature chips ── */}
          <div className="flex flex-wrap gap-2" style={anim(0.26)}>
            {CHIPS.map(({ Icon, text }) => (
              <span key={text}
                className="inline-flex items-center gap-1.5
                  bg-[#EEF3EF] border border-[#D4E0D6]
                  font-body text-[10px] font-semibold text-[#203A2B]
                  uppercase tracking-[0.12em] px-3 py-1.5">
                <Icon size={10} strokeWidth={2} />
                {text}
              </span>
            ))}
          </div>

          {/* ── CTAs ── */}
          <div className="flex flex-wrap items-center gap-4" style={anim(0.32)}>
            <Link
              href="/books"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden
                font-body text-[11px] font-bold uppercase tracking-[0.16em]
                text-[#FFFCF7] bg-[#203A2B]
                px-8 py-[14px]
                hover:bg-[#2a4d36] active:scale-[0.98]
                transition-all duration-200 shadow-md"
            >
              {/* Shine sweep on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                transition-transform duration-500 pointer-events-none" />
              Browse the Collection
              <ArrowRight size={11}
                className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center gap-1.5
                font-body text-[11px] font-semibold text-[#777970]
                border-b border-dashed border-[#C6A66B]/40 pb-0.5
                hover:text-[#203A2B] hover:border-[#203A2B]
                transition-all duration-200"
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
