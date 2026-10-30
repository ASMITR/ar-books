"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Copy, Check, Clock, ArrowRight, ShoppingCart,
  BookOpen, Layers, Tag, Zap, Gift, PackageOpen,
} from "lucide-react";
import type { Offer } from "@/types";
import { formatINR } from "@/lib/currency";

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(endAt: string) {
  const calc = () => {
    const diff = new Date(endAt).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, expired: true };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      mins:    Math.floor((diff % 3600000) / 60000),
      expired: false,
    };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTick(calc()), 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt]);
  return tick;
}

// ─── Countdown strip ──────────────────────────────────────────────────────────
function CountdownStrip({ endAt, dark }: { endAt: string; dark: boolean }) {
  const { days, hours, mins, expired } = useCountdown(endAt);
  if (expired) return null;

  const bg   = dark ? "bg-white/[0.07]" : "bg-[#203A2B]/[0.06]";
  const text = dark ? "text-[#A8B5A0]"  : "text-[#5A7060]";
  const num  = dark ? "text-[#FFFCF7]"  : "text-[#203A2B]";

  return (
    <div className={`flex items-center gap-3 px-3.5 py-2.5 ${bg} border-t ${dark ? "border-white/[0.08]" : "border-[#203A2B]/[0.08]"}`}>
      <Clock size={11} className={text} strokeWidth={1.8} />
      <span className={`font-body text-[10px] font-semibold uppercase tracking-[0.1em] ${text}`}>
        Ends in
      </span>
      {[{ v: days, l: "d" }, { v: hours, l: "h" }, { v: mins, l: "m" }].map(({ v, l }, i) => (
        <span key={l} className="flex items-baseline gap-0.5">
          {i > 0 && <span className={`${text} text-[11px] mr-1`}>:</span>}
          <span className={`font-heading text-[16px] font-bold ${num} leading-none`}>
            {String(v).padStart(2, "0")}
          </span>
          <span className={`font-body text-[9px] ${text}`}>{l}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Copy code pill ───────────────────────────────────────────────────────────
function CopyPill({ code, dark }: { code: string; dark: boolean }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); }
    catch {
      const el = document.createElement("textarea");
      el.value = code; document.body.appendChild(el);
      el.select(); document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy code ${code}`}
      className={`w-full flex items-center justify-between gap-3 border-2 border-dashed rounded-sm
        px-4 py-3 transition-all duration-150 group
        ${dark
          ? "border-white/20 hover:border-[#C6A66B]/60 bg-white/[0.04] hover:bg-white/[0.08]"
          : "border-[#203A2B]/20 hover:border-[#203A2B]/50 bg-[#203A2B]/[0.03] hover:bg-[#203A2B]/[0.06]"
        }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Tag size={12} className={dark ? "text-[#C6A66B] shrink-0" : "text-[#315B55] shrink-0"} />
        <span className={`font-mono text-[13px] font-bold tracking-[0.2em] truncate ${dark ? "text-[#FFFCF7]" : "text-[#203A2B]"}`}>
          {code}
        </span>
      </div>
      <span className={`flex items-center gap-1.5 shrink-0 font-body text-[10px] font-bold uppercase tracking-[0.1em] transition-colors
        ${copied
          ? "text-emerald-500"
          : dark ? "text-[#A8B5A0] group-hover:text-[#FFFCF7]" : "text-[#9e9a94] group-hover:text-[#203A2B]"
        }`}>
        {copied ? <Check size={10} /> : <Copy size={10} />}
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}

// ─── Offer type icon ──────────────────────────────────────────────────────────
function OfferIcon({ type, dark }: { type: string; dark: boolean }) {
  const cls = `shrink-0 ${dark ? "text-[#C6A66B]" : "text-[#203A2B]"}`;
  if (type === "bundle" || type === "buy_x_get_y") return <PackageOpen size={16} strokeWidth={1.7} className={cls} />;
  if (type === "first_order") return <Gift size={16} strokeWidth={1.7} className={cls} />;
  return <Zap size={16} strokeWidth={1.7} className={cls} />;
}

// ─── Discount headline ────────────────────────────────────────────────────────
function DiscountNumber({ offer, dark }: { offer: Offer; dark: boolean }) {
  const mainCls = `font-heading font-bold leading-none tracking-tight ${dark ? "text-[#C6A66B]" : "text-[#203A2B]"}`;
  const subCls  = `font-body font-bold uppercase tracking-[0.1em] ${dark ? "text-[#A8B5A0]" : "text-[#789185]"}`;

  if (offer.offerType === "bundle" || offer.offerType === "buy_x_get_y") {
    return (
      <div className="flex items-end gap-2">
        <span className={`${mainCls} text-[48px] sm:text-[56px]`}>
          {offer.discountValue}
          <span className={`${mainCls} text-[28px] ml-0.5`}>%</span>
        </span>
        <span className={`${subCls} text-[11px] mb-2`}>
          when you buy {offer.buyX ?? 3}+
        </span>
      </div>
    );
  }
  if (offer.discountType === "flat") {
    return (
      <div className="flex items-start gap-1">
        <span className={`${mainCls} text-[26px] mt-2`}>₹</span>
        <span className={`${mainCls} text-[52px] sm:text-[60px]`}>
          {(offer.discountValue).toLocaleString("en-IN")}
        </span>
        <span className={`${subCls} text-[11px] mb-2 self-end`}>off</span>
      </div>
    );
  }
  // percent
  return (
    <div className="flex items-end gap-1.5">
      <span className={`${mainCls} text-[56px] sm:text-[64px]`}>{offer.discountValue}</span>
      <span className={`${mainCls} text-[28px] mb-1`}>%</span>
      <span className={`${subCls} text-[11px] mb-2`}>off</span>
    </div>
  );
}

// ─── Eligibility note ─────────────────────────────────────────────────────────
function EligibilityNote({ offer, dark }: { offer: Offer; dark: boolean }) {
  const cls = `font-body text-[10px] flex items-center gap-1.5 ${dark ? "text-[#A8B5A0]/70" : "text-[#A8B5A0]"}`;
  if (offer.customerEligibility === "new_customers")
    return <span className={cls}><BookOpen size={9} strokeWidth={1.8} /> First-time customers only</span>;
  if (offer.minCartValuePaise)
    return <span className={cls}><ShoppingCart size={9} strokeWidth={1.8} /> Min. order {formatINR(offer.minCartValuePaise)}</span>;
  if (offer.applicableBookIds?.length)
    return <span className={cls}><Layers size={9} strokeWidth={1.8} /> On selected eBooks</span>;
  return <span className={cls}><Layers size={9} strokeWidth={1.8} /> All eligible books</span>;
}

// ─── Default badge label ──────────────────────────────────────────────────────
function defaultBadge(offer: Offer): string {
  const map: Record<string, string> = {
    first_order:      "Welcome Offer",
    bundle:           "Book Bundle",
    buy_x_get_y:      "Bundle Deal",
    combo:            "Combo Deal",
    category:         "Category Deal",
    product_specific: "Limited Offer",
    percent:          "Limited-Time",
    flat:             "Extra Savings",
  };
  return map[offer.offerType] ?? "Special Offer";
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD LIGHT  (cream/ivory, forest accent)
// ─────────────────────────────────────────────────────────────────────────────
function CardLight({ offer }: { offer: Offer }) {
  const badge = offer.badgeLabel || defaultBadge(offer);
  return (
    <article className="group relative flex flex-col bg-[#FFFCF7] border border-[#E6DFD5]
      hover:border-[#C6A66B]/70 hover:shadow-[0_6px_32px_rgba(32,58,43,0.10)]
      transition-all duration-300 overflow-hidden">

      {/* Gold top bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
        scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />

      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-0">
        <div className="flex items-center gap-2">
          <OfferIcon type={offer.offerType} dark={false} />
          <span className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[#315B55]">
            {badge}
          </span>
        </div>
        {offer.endAt && (
          <span className="font-body text-[10px] text-[#A8B5A0] flex items-center gap-1">
            <Clock size={9} strokeWidth={1.8} />
            {new Date(offer.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* Discount number */}
      <div className="px-5 pt-3 pb-1">
        <DiscountNumber offer={offer} dark={false} />
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-[#EDE8E1]" />

      {/* Title + desc */}
      <div className="px-5 pt-4 pb-0 flex flex-col gap-1.5 flex-1">
        <h3 className="font-heading text-[17px] font-bold text-[#1a1a1a] leading-snug">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="font-body text-[12px] text-[#777970] leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        )}
      </div>

      {/* Coupon */}
      {offer.couponCode && offer.displayCouponPublicly && (
        <div className="px-5 pt-4">
          <CopyPill code={offer.couponCode} dark={false} />
        </div>
      )}

      {/* Footer */}
      <div className="px-5 pt-4 pb-5 flex items-center justify-between gap-3 mt-auto">
        <EligibilityNote offer={offer} dark={false} />
        <Link
          href="/books"
          aria-label={`${offer.ctaText ?? "Shop Now"} — ${offer.title}`}
          className="inline-flex items-center gap-1.5 shrink-0
            font-body text-[11px] font-bold uppercase tracking-[0.14em]
            bg-[#203A2B] text-[#FFFCF7] px-4 py-2.5
            hover:bg-[#315B55] active:scale-[0.98]
            transition-all duration-200"
        >
          {offer.ctaText ?? "Shop Now"}
          <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Countdown */}
      {offer.endAt && <CountdownStrip endAt={offer.endAt} dark={false} />}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD DARK  (forest green, gold accent)
// ─────────────────────────────────────────────────────────────────────────────
function CardDark({ offer }: { offer: Offer }) {
  const badge = offer.badgeLabel || defaultBadge(offer);
  return (
    <article className="group relative flex flex-col bg-[#1C3325]
      border border-[#2E5040]
      hover:border-[#C6A66B]/60 hover:shadow-[0_6px_32px_rgba(198,166,107,0.15)]
      transition-all duration-300 overflow-hidden">

      {/* Gold top bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
        scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />

      {/* Subtle noise/texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none
        bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBudW1PY3RhdmVzPSI0Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* Header strip */}
      <div className="relative flex items-center justify-between gap-3 px-5 pt-5 pb-0">
        <div className="flex items-center gap-2">
          <OfferIcon type={offer.offerType} dark={true} />
          <span className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[#C6A66B]">
            {badge}
          </span>
        </div>
        {offer.endAt && (
          <span className="font-body text-[10px] text-[#A8B5A0]/70 flex items-center gap-1">
            <Clock size={9} strokeWidth={1.8} />
            {new Date(offer.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* Discount number */}
      <div className="relative px-5 pt-3 pb-1">
        <DiscountNumber offer={offer} dark={true} />
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/[0.07]" />

      {/* Title + desc */}
      <div className="relative px-5 pt-4 pb-0 flex flex-col gap-1.5 flex-1">
        <h3 className="font-heading text-[17px] font-bold text-[#FFFCF7] leading-snug">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="font-body text-[12px] text-[#A8B5A0] leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        )}
      </div>

      {/* Coupon */}
      {offer.couponCode && offer.displayCouponPublicly && (
        <div className="relative px-5 pt-4">
          <CopyPill code={offer.couponCode} dark={true} />
        </div>
      )}

      {/* Footer */}
      <div className="relative px-5 pt-4 pb-5 flex items-center justify-between gap-3 mt-auto">
        <EligibilityNote offer={offer} dark={true} />
        <Link
          href="/books"
          aria-label={`${offer.ctaText ?? "Shop Now"} — ${offer.title}`}
          className="inline-flex items-center gap-1.5 shrink-0
            font-body text-[11px] font-bold uppercase tracking-[0.14em]
            bg-[#C6A66B] text-[#1C3325] px-4 py-2.5
            hover:bg-[#D4B47A] active:scale-[0.98]
            transition-all duration-200"
        >
          {offer.ctaText ?? "Shop Now"}
          <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Countdown */}
      {offer.endAt && <CountdownStrip endAt={offer.endAt} dark={true} />}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD BANNER  (full-width, 3-column layout on md+)
// ─────────────────────────────────────────────────────────────────────────────
function CardBanner({ offer }: { offer: Offer }) {
  const badge = offer.badgeLabel || defaultBadge(offer);
  return (
    <article className="group relative bg-[#1C3325] border border-[#2E5040]
      hover:border-[#C6A66B]/60 hover:shadow-[0_6px_32px_rgba(198,166,107,0.15)]
      transition-all duration-300 overflow-hidden">

      {/* Gold top bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
        scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_320px]">

        {/* ── LEFT: main content ──────────────────────────────────────── */}
        <div className="px-6 sm:px-8 py-8 flex flex-col gap-4">
          {/* Badge + date */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <OfferIcon type={offer.offerType} dark={true} />
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[#C6A66B]">
                {badge}
              </span>
            </div>
            {offer.endAt && (
              <span className="font-body text-[10px] text-[#A8B5A0]/70 flex items-center gap-1 ml-auto">
                <Clock size={9} strokeWidth={1.8} />
                Ends {new Date(offer.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>

          {/* Discount + title inline */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6">
            <DiscountNumber offer={offer} dark={true} />
            <div className="flex flex-col gap-1 pb-1">
              <h3 className="font-heading text-[20px] font-bold text-[#FFFCF7] leading-snug">
                {offer.title}
              </h3>
              {offer.description && (
                <p className="font-body text-[12px] text-[#A8B5A0] leading-relaxed max-w-sm">
                  {offer.description}
                </p>
              )}
            </div>
          </div>

          {/* CTA + eligibility */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/books"
              aria-label={`${offer.ctaText ?? "Shop Now"} — ${offer.title}`}
              className="inline-flex items-center gap-1.5
                font-body text-[11px] font-bold uppercase tracking-[0.14em]
                bg-[#C6A66B] text-[#1C3325] px-5 py-3
                hover:bg-[#D4B47A] active:scale-[0.98]
                transition-all duration-200"
            >
              {offer.ctaText ?? "Shop Now"}
              <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <EligibilityNote offer={offer} dark={true} />
          </div>
        </div>

        {/* ── DIVIDER ─────────────────────────────────────────────────── */}
        <div className="hidden md:block bg-white/[0.07]" />

        {/* ── RIGHT: coupon + countdown ────────────────────────────────── */}
        <div className="flex flex-col justify-center gap-4 px-6 sm:px-8 py-8
          border-t border-white/[0.07] md:border-t-0">

          {offer.couponCode && offer.displayCouponPublicly ? (
            <>
              <div>
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A8B5A0] mb-2.5">
                  Your discount code
                </p>
                <CopyPill code={offer.couponCode} dark={true} />
              </div>
              <p className="font-body text-[11px] text-[#A8B5A0]/70 leading-relaxed">
                Apply this code at checkout to unlock your discount. Terms and conditions apply.
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="font-body text-[13px] font-semibold text-[#FFFCF7]">
                No code needed
              </p>
              <p className="font-body text-[12px] text-[#A8B5A0] leading-relaxed">
                Discount is applied automatically. Add eligible books to your cart and save instantly.
              </p>
            </div>
          )}

          {offer.minCartValuePaise && (
            <div className="flex items-center gap-2 border-t border-white/[0.07] pt-3">
              <ShoppingCart size={11} className="text-[#A8B5A0] shrink-0" strokeWidth={1.8} />
              <span className="font-body text-[11px] text-[#A8B5A0]">
                Minimum cart value: <strong className="text-[#FFFCF7]">{formatINR(offer.minCartValuePaise)}</strong>
              </span>
            </div>
          )}

          {offer.endAt && <CountdownStrip endAt={offer.endAt} dark={true} />}
        </div>
      </div>
    </article>
  );
}

// ─── Mobile card carousel (snap-scroll, playing-card stack effect) ────────────
function MobileCarousel({ offers }: { offers: Offer[] }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Sync dot indicator with native scroll position
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.scrollWidth / offers.length;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActive(Math.min(Math.max(idx, 0), offers.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [offers.length]);

  // Tap a dot → scroll to that card
  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / offers.length;
    el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Stack shadow cards peeking behind the active card */}
      <div className="relative h-[26px] mx-4">
        <div className="absolute inset-x-6 top-2 h-full bg-[#1C3325]/30 rounded-sm" />
        <div className="absolute inset-x-3 top-1 h-full bg-[#1C3325]/15 rounded-sm" />
      </div>

      {/* Scroll track — negative margin pulls it edge-to-edge past the section padding */}
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory
          scrollbar-none pb-2 -mx-4 px-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {offers.map((offer, i) => {
          const isDark = offer.endAt || i % 2 === 1;
          return (
            <div
              key={offer.id}
              className="snap-center shrink-0 w-[calc(100vw-2.5rem)] max-w-sm
                transition-all duration-300"
              style={{
                // Playing-card tilt: alternate ±1.5 deg, active = 0
                transform: active === i
                  ? "rotate(0deg) scale(1)"
                  : `rotate(${i % 2 === 0 ? "1.2deg" : "-1.2deg"}) scale(0.97)`,
                opacity: active === i ? 1 : 0.72,
              }}
            >
              {isDark
                ? <CardDark  offer={offer} />
                : <CardLight offer={offer} />}
            </div>
          );
        })}
        {/* Right spacer so last card centres properly */}
        <div className="shrink-0 w-4" aria-hidden />
      </div>

      {/* Dot indicators */}
      {offers.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to offer ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                active === i
                  ? "w-5 h-2 bg-[#203A2B]"
                  : "w-2 h-2 bg-[#C6A66B]/40 hover:bg-[#C6A66B]/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Counter label */}
      {offers.length > 1 && (
        <p className="text-center font-body text-[10px] text-[#A8B5A0] mt-2 uppercase tracking-[0.15em]">
          {active + 1} / {offers.length}
        </p>
      )}
    </div>
  );
}

// ─── Desktop grid layout ──────────────────────────────────────────────────────
function DesktopGrid({ offers }: { offers: Offer[] }) {
  const total = offers.length;

  if (total === 1) {
    return (
      <div className="max-w-sm mx-auto">
        <CardLight offer={offers[0]} />
      </div>
    );
  }

  if (total === 2) {
    return (
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <CardLight offer={offers[0]} />
        <CardDark  offer={offers[1]} />
      </div>
    );
  }

  if (total === 3) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <CardLight offer={offers[0]} />
        <CardDark  offer={offers[1]} />
        <CardLight offer={offers[2]} />
      </div>
    );
  }

  // 4+ cards — 3-col top, banner last
  const topRow   = offers.slice(0, 3);
  const rest     = offers.slice(3);
  const banner   = rest[rest.length - 1];
  const midCards = rest.slice(0, rest.length - 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {topRow.map((offer, i) =>
          offer.endAt || i === 1
            ? <CardDark  key={offer.id} offer={offer} />
            : <CardLight key={offer.id} offer={offer} />
        )}
      </div>
      {midCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {midCards.map((offer, i) =>
            i % 2 === 0
              ? <CardDark  key={offer.id} offer={offer} />
              : <CardLight key={offer.id} offer={offer} />
          )}
        </div>
      )}
      {banner && <CardBanner offer={banner} />}
    </div>
  );
}

// ─── Unified offer grid — carousel on mobile, grid on sm+ ────────────────────
function OfferGrid({ offers }: { offers: Offer[] }) {
  return (
    <>
      {/* Mobile: playing-card carousel */}
      <div className="sm:hidden">
        <MobileCarousel offers={offers} />
      </div>

      {/* sm+: normal grid */}
      <div className="hidden sm:block">
        <DesktopGrid offers={offers} />
      </div>
    </>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-6 h-px bg-[#C6A66B]" />
          <p className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#C6A66B]">
            Exclusive Deals
          </p>
        </div>
        <h2 className="font-heading text-[38px] sm:text-[48px] font-bold text-[#242824] leading-[1.05]">
          Reader Offers
        </h2>
        <p className="font-body text-[13px] text-[#777970] mt-2 max-w-xs leading-relaxed">
          Curated discounts for every kind of reader.
        </p>
      </div>
      <Link
        href="/books"
        className="group inline-flex items-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.15em]
          text-[#FFFCF7] bg-[#203A2B] px-5 py-3
          hover:bg-[#315B55] transition-colors shrink-0 self-start sm:self-auto"
      >
        Browse All Books
        <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface OffersSectionProps {
  offers: Offer[];
}

export function OffersSection({ offers }: OffersSectionProps) {
  if (offers.length === 0) return null;

  const sorted = [...offers]
    .sort((a, b) => b.priority - a.priority || b.startAt.localeCompare(a.startAt))
    .filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i);

  return (
    <section className="bg-[#F5EFE6] py-14 lg:py-20" aria-label="Exclusive reader deals">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        {/* On mobile the carousel handles its own edge-to-edge overflow */}
        <div className="overflow-hidden sm:overflow-visible">
          <OfferGrid offers={sorted} />
        </div>
      </div>
    </section>
  );
}
