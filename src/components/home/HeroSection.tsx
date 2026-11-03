"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookCover } from "@/components/book/BookCover";
import { ArrowRight, BookOpen, Download, ShieldCheck, Star, Sparkles } from "lucide-react";
import type { Book } from "@/types";

interface HeroSectionProps {
  books:     Book[];
  headline?: string;
  subtext?:  string;
}

// ─── Rotating words ───────────────────────────────────────────────────────────
const WORDS = ["Bold Thinkers", "Curious Souls", "Every Mind", "Your Growth", "New Ideas"];

function RotatingWord() {
  const [idx,  setIdx]  = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % WORDS.length);
        setShow(true);
      }, 320);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="italic"
      style={{
        color:      "#8B5E3C",
        display:    "inline-block",
        opacity:    show ? 1 : 0,
        transform:  show ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.32s ease, transform 0.32s ease",
      }}
    >
      {WORDS[idx]}
    </span>
  );
}

// ─── Book stack ───────────────────────────────────────────────────────────────
function BookStack({ books }: { books: Book[] }) {
  const visible = books.slice(0, 3);

  return (
    <div className="relative flex items-end justify-center" style={{ height: 360, width: 300 }}>
      {/* Soft shadow pool beneath books */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width:      260,
          height:     60,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 70%)",
          filter:     "blur(8px)",
        }}
      />

      {/* Book 3 — back left */}
      {visible[2] && (
        <div
          className="absolute bottom-4"
          style={{
            left:      "0%",
            opacity:   0.65,
            transform: "rotate(-9deg) translateY(14px) scale(0.80)",
            zIndex:    1,
            filter:    "drop-shadow(0 12px 28px rgba(0,0,0,0.30))",
          }}
        >
          <BookCover src={visible[2].coverImageUrl} title={visible[2].title} size="lg" />
        </div>
      )}

      {/* Book 2 — back right */}
      {visible[1] && (
        <div
          className="absolute bottom-4"
          style={{
            right:     "0%",
            opacity:   0.75,
            transform: "rotate(8deg) translateY(9px) scale(0.84)",
            zIndex:    2,
            filter:    "drop-shadow(0 14px 30px rgba(0,0,0,0.30))",
          }}
        >
          <BookCover src={visible[1].coverImageUrl} title={visible[1].title} size="lg" />
        </div>
      )}

      {/* Book 1 — front center */}
      {visible[0] && (
        <div
          className="relative"
          style={{
            zIndex: 3,
            filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.38)) drop-shadow(0 4px 12px rgba(0,0,0,0.22))",
          }}
        >
          <BookCover
            src={visible[0].coverImageUrl}
            title={visible[0].title}
            size="xl"
            perspective
            priority
          />
        </div>
      )}

      {/* Fallback */}
      {visible.length === 0 && (
        <div
          className="w-[160px] h-[224px] border border-[#203A2B]/20 bg-white/60
            flex items-center justify-center backdrop-blur-sm"
          style={{ zIndex: 3 }}
        >
          <p className="font-body text-[11px] text-[#203A2B]/50 text-center px-4 leading-relaxed">
            Add books<br />in admin
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Stat item ────────────────────────────────────────────────────────────────
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-heading text-[28px] sm:text-[32px] font-bold text-[#203A2B] leading-none">
        {value}
      </span>
      <span className="font-body text-[9.5px] uppercase tracking-[0.2em] text-[#777970]">
        {label}
      </span>
    </div>
  );
}

// ─── Trust badge ──────────────────────────────────────────────────────────────
function TrustBadge({ Icon, text }: { Icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={13} className="text-[#203A2B] shrink-0" strokeWidth={1.8} />
      <span className="font-body text-[11.5px] text-[#4a5568] font-medium">{text}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function HeroSection({ books, headline, subtext }: HeroSectionProps) {

  // CSS-only fade-up: no JS state, no hydration delay, plays on page paint
  const fadeUp = (delay = 0): React.CSSProperties => ({
    animation:       "heroFadeUp 0.6s ease both",
    animationDelay:  `${delay}s`,
  });

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label="Hero"
    >

      {/* ── Background image ─────────────────────────────────────────── */}
      <Image
        src="/hero-bg.jpg"
        alt=""
        fill
        priority
        quality={80}
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />

      {/* ── Light overlay: warm cream wash so text stays legible ──────── */}
      {/* Primary wash — heavy cream from left where text lives */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, rgba(250,249,246,0.97) 0%, rgba(250,249,246,0.93) 38%, rgba(250,249,246,0.70) 58%, rgba(250,249,246,0.15) 100%)",
        }}
      />
      {/* Secondary soft vignette top & bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(250,249,246,0.55) 0%, transparent 25%, transparent 75%, rgba(250,249,246,0.55) 100%)",
        }}
      />

      {/* Top gold rule */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C6A66B]/70 to-transparent z-10" />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div
        className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16
          flex flex-col lg:flex-row items-center gap-12 lg:gap-0 py-20 lg:py-0"
        style={{ minHeight: "100svh" }}
      >

        {/* ══ LEFT: copy ══════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col justify-center lg:pr-12 xl:pr-20 text-center lg:text-left order-2 lg:order-1">

          {/* Eyebrow */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6" style={fadeUp(0)}>
            <span className="h-px w-7 bg-[#C6A66B]" />
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.36em] text-[#8B5E3C]">
              AR Books &nbsp;·&nbsp; Official eBook Store
            </span>
            <span className="h-px w-7 bg-[#C6A66B]" />
          </div>

          {/* Headline */}
          <h1
            className="font-heading font-bold text-[#1a2419] tracking-tight leading-[1.06]
              text-[42px] sm:text-[54px] lg:text-[56px] xl:text-[66px] mb-5"
            style={fadeUp(0.08)}
          >
            {headline ?? (
              <>
                Books Written
                <br />
                for{" "}
                <RotatingWord />
              </>
            )}
          </h1>

          {/* Sparkle divider */}
          <div
            className="flex items-center justify-center lg:justify-start gap-3 mb-6"
            style={fadeUp(0.14)}
          >
            <span className="h-px w-14 bg-[#C6A66B]/40" />
            <Sparkles size={11} className="text-[#C6A66B]" />
            <span className="h-px w-14 bg-[#C6A66B]/40" />
          </div>

          {/* Subtext */}
          <p
            className="font-body text-[#555f52] text-[14.5px] sm:text-[15.5px] leading-[1.85]
              mb-9 max-w-[460px] mx-auto lg:mx-0"
            style={fadeUp(0.19)}
          >
            {subtext ??
              "Handpicked titles across business, fiction, finance, and personal growth — written to inspire, inform, and stay with you long after the last page."}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10"
            style={fadeUp(0.26)}
          >
            {/* Primary — dark forest */}
            <Link
              href="/books"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden
                font-body text-[11px] font-bold uppercase tracking-[0.16em]
                text-[#FAF9F6] bg-[#203A2B] px-8 py-[15px]
                hover:bg-[#2a4d36] active:scale-[0.98]
                transition-all duration-200 shadow-md shadow-[#203A2B]/20"
            >
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                  bg-gradient-to-r from-transparent via-white/10 to-transparent
                  transition-transform duration-500 pointer-events-none"
              />
              Browse the Collection
              <ArrowRight
                size={12}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            {/* Secondary — outlined */}
            <Link
              href="/about"
              className="inline-flex items-center gap-2 font-body text-[11px] font-semibold
                text-[#203A2B] border border-[#203A2B]/35 px-7 py-[14px]
                hover:bg-[#203A2B] hover:text-[#FAF9F6] hover:border-[#203A2B]
                transition-all duration-200"
            >
              About the Author
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center justify-center lg:justify-start gap-x-7 gap-y-3
              pt-6 border-t border-[#203A2B]/10"
            style={fadeUp(0.32)}
          >
            <TrustBadge Icon={BookOpen}    text="Handpicked titles" />
            <TrustBadge Icon={Download}    text="Instant download"  />
            <TrustBadge Icon={ShieldCheck} text="Secure checkout"   />
          </div>
        </div>

        {/* ══ RIGHT: books + stats ════════════════════════════════════ */}
        <div
          className="relative flex flex-col items-center justify-center
            order-1 lg:order-2 lg:w-[46%] xl:w-[44%] shrink-0"
          style={fadeUp(0.06)}
        >
          {/* Subtle vertical rule */}
          <div
            className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2
              h-[52%] w-px"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(198,166,107,0.35), transparent)" }}
          />

          {/* Glass card behind books */}
          <div
            className="relative lg:ml-16 xl:ml-20 rounded-2xl p-8 sm:p-10"
            style={{
              background:   "rgba(255,255,255,0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border:       "1px solid rgba(255,255,255,0.70)",
              boxShadow:    "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <BookStack books={books} />

            {/* Stats */}
            <div
              className="flex items-center justify-center gap-8 sm:gap-10 mt-8 pt-6
                border-t border-[#203A2B]/10"
              style={fadeUp(0.38)}
            >
              <StatItem value="10+"  label="eBooks"   />
              <span className="h-8 w-px bg-[#C6A66B]/30" />
              <StatItem value="₹0"   label="Shipping" />
              <span className="h-8 w-px bg-[#C6A66B]/30" />
              <StatItem value="100%" label="Digital"  />
            </div>

            {/* Stars */}
            <div
              className="flex items-center justify-center gap-2 mt-4"
              style={fadeUp(0.44)}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-[#C6A66B] text-[#C6A66B]" />
                ))}
              </div>
              <span className="font-body text-[11px] text-[#777970]">Loved by readers</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom fade seam into next section ───────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, transparent, #FAF9F6)" }}
      />

      {/* CSS keyframes for entrance animations — no JS, plays on page paint */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
