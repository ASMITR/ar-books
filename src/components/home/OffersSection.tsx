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
          <span className={`font-heading text-[15px] font-bold ${num} leading-none`}>
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
        px-4 py-2.5 transition-all duration-150 group
        ${dark
          ? "border-white/20 hover:border-[#C6A66B]/60 bg-white/[0.04] hover:bg-white/[0.08]"
          : "border-[#203A2B]/20 hover:border-[#203A2B]/50 bg-[#203A2B]/[0.03] hover:bg-[#203A2B]/[0.06]"
        }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Tag size={12} className={dark ? "text-[#C6A66B] shrink-0" : "text-[#315B55] shrink-0"} />
        <span className={`font-mono text-[12px] font-bold tracking-[0.18em] truncate ${dark ? "text-[#FFFCF7]" : "text-[#203A2B]"}`}>
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
  if (type === "bundle" || type === "buy_x_get_y") return <PackageOpen size={15} strokeWidth={1.7} className={cls} />;
  if (type === "first_order") return <Gift size={15} strokeWidth={1.7} className={cls} />;
  return <Zap size={15} strokeWidth={1.7} className={cls} />;
}

// ─── Discount headline ────────────────────────────────────────────────────────
// Fixed height container so all cards have the same discount block height
function DiscountNumber({ offer, dark }: { offer: Offer; dark: boolean }) {
  const mainCls = `font-heading font-bold leading-none tracking-tight ${dark ? "text-[#C6A66B]" : "text-[#203A2B]"}`;
  const subCls  = `font-body font-semibold uppercase tracking-[0.1em] ${dark ? "text-[#A8B5A0]" : "text-[#789185]"}`;

  if (offer.offerType === "bundle" || offer.offerType === "buy_x_get_y") {
    return (
      <div className="flex items-end gap-2 h-12">
        <span className={`${mainCls} text-[36px]`}>
          {offer.discountValue}
          <span className={`${mainCls} text-[20px] ml-0.5`}>%</span>
        </span>
        <span className={`${subCls} text-[10px] mb-1 truncate`}>
          buy {offer.buyX ?? 3}+
        </span>
      </div>
    );
  }
  if (offer.discountType === "flat") {
    return (
      <div className="flex items-start gap-0.5 h-12">
        <span className={`${mainCls} text-[18px] mt-1`}>₹</span>
        <span className={`${mainCls} text-[36px]`}>
          {(offer.discountValue).toLocaleString("en-IN")}
        </span>
        <span className={`${subCls} text-[10px] mb-1 self-end`}>off</span>
      </div>
    );
  }
  // percent
  return (
    <div className="flex items-end gap-1 h-12">
      <span className={`${mainCls} text-[40px]`}>{offer.discountValue}</span>
      <span className={`${mainCls} text-[20px] mb-0.5`}>%</span>
      <span className={`${subCls} text-[10px] mb-1`}>off</span>
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
// SHARED CARD SHELL — enforces identical dimensions for every card
// h-full ensures all cards in the same row stretch to the tallest card's height
// ─────────────────────────────────────────────────────────────────────────────

// ─── CARD LIGHT  (cream/ivory, forest accent) ─────────────────────────────────
function CardLight({ offer }: { offer: Offer }) {
  const badge = offer.badgeLabel || defaultBadge(offer);
  return (
    <article className="group relative flex flex-col h-full bg-[#FFFCF7] border border-[#E6DFD5]
      hover:border-[#C6A66B]/70 hover:shadow-[0_6px_28px_rgba(32,58,43,0.10)]
      transition-all duration-300 overflow-hidden">

      {/* Gold top bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
        scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {/* ── Header: badge + date ── fixed height */}
      <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-0 h-9 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <OfferIcon type={offer.offerType} dark={false} />
          <span className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#315B55] truncate">
            {badge}
          </span>
        </div>
        {offer.endAt && (
          <span className="font-body text-[10px] text-[#A8B5A0] flex items-center gap-1 shrink-0">
            <Clock size={9} strokeWidth={1.8} />
            {new Date(offer.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* ── Discount number ── fixed height via h-12 in DiscountNumber */}
      <div className="px-5 pt-3 pb-0 shrink-0">
        <DiscountNumber offer={offer} dark={false} />
      </div>

      {/* Divider */}
      <div className="mx-5 mt-3 h-px bg-[#EDE8E1] shrink-0" />

      {/* ── Title + description ── flex-1 so all cards share remaining space */}
      <div className="px-5 pt-3 pb-0 flex flex-col gap-1 flex-1 min-h-0">
        <h3 className="font-heading text-[15px] font-bold text-[#1a1a1a] leading-snug line-clamp-2">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="font-body text-[11px] text-[#777970] leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        )}
      </div>

      {/* ── Coupon ── fixed height slot (visible or invisible placeholder) */}
      <div className="px-5 pt-3 shrink-0">
        {offer.couponCode && offer.displayCouponPublicly ? (
          <CopyPill code={offer.couponCode} dark={false} />
        ) : (
          /* invisible spacer keeps height consistent when no coupon */
          <div className="h-[38px]" aria-hidden />
        )}
      </div>

      {/* ── Footer ── fixed to bottom, consistent height */}
      <div className="px-5 pt-3 pb-4 flex items-center justify-between gap-2 shrink-0">
        <EligibilityNote offer={offer} dark={false} />
        <Link
          href="/books"
          aria-label={`${offer.ctaText ?? "Shop Now"} — ${offer.title}`}
          className="inline-flex items-center gap-1.5 shrink-0
            font-body text-[10px] font-bold uppercase tracking-[0.12em]
            bg-[#203A2B] text-[#FFFCF7] px-3.5 py-2
            hover:bg-[#315B55] active:scale-[0.98]
            transition-all duration-200"
        >
          {offer.ctaText ?? "Shop Now"}
          <ArrowRight size={10} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* ── Countdown ── always rendered at bottom; CountdownStrip returns null when expired/absent */}
      <div className="shrink-0">
        {offer.endAt
          ? <CountdownStrip endAt={offer.endAt} dark={false} />
          : <div className="h-[38px]" aria-hidden />}
      </div>
    </article>
  );
}

// ─── CARD DARK  (forest green, gold accent) ───────────────────────────────────
function CardDark({ offer }: { offer: Offer }) {
  const badge = offer.badgeLabel || defaultBadge(offer);
  return (
    <article className="group relative flex flex-col h-full bg-[#1C3325]
      border border-[#2E5040]
      hover:border-[#C6A66B]/60 hover:shadow-[0_6px_28px_rgba(198,166,107,0.15)]
      transition-all duration-300 overflow-hidden">

      {/* Gold top bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
        scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {/* Subtle noise/texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none
        bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBudW1PY3RhdmVzPSI0Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* ── Header: badge + date ── fixed height */}
      <div className="relative flex items-center justify-between gap-2 px-5 pt-4 pb-0 h-9 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <OfferIcon type={offer.offerType} dark={true} />
          <span className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#C6A66B] truncate">
            {badge}
          </span>
        </div>
        {offer.endAt && (
          <span className="font-body text-[10px] text-[#A8B5A0]/70 flex items-center gap-1 shrink-0">
            <Clock size={9} strokeWidth={1.8} />
            {new Date(offer.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* ── Discount number ── */}
      <div className="relative px-5 pt-3 pb-0 shrink-0">
        <DiscountNumber offer={offer} dark={true} />
      </div>

      {/* Divider */}
      <div className="mx-5 mt-3 h-px bg-white/[0.07] shrink-0" />

      {/* ── Title + description ── flex-1 */}
      <div className="relative px-5 pt-3 pb-0 flex flex-col gap-1 flex-1 min-h-0">
        <h3 className="font-heading text-[15px] font-bold text-[#FFFCF7] leading-snug line-clamp-2">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="font-body text-[11px] text-[#A8B5A0] leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        )}
      </div>

      {/* ── Coupon ── fixed height slot */}
      <div className="relative px-5 pt-3 shrink-0">
        {offer.couponCode && offer.displayCouponPublicly ? (
          <CopyPill code={offer.couponCode} dark={true} />
        ) : (
          <div className="h-[38px]" aria-hidden />
        )}
      </div>

      {/* ── Footer ── */}
      <div className="relative px-5 pt-3 pb-4 flex items-center justify-between gap-2 shrink-0">
        <EligibilityNote offer={offer} dark={true} />
        <Link
          href="/books"
          aria-label={`${offer.ctaText ?? "Shop Now"} — ${offer.title}`}
          className="inline-flex items-center gap-1.5 shrink-0
            font-body text-[10px] font-bold uppercase tracking-[0.12em]
            bg-[#C6A66B] text-[#1C3325] px-3.5 py-2
            hover:bg-[#D4B47A] active:scale-[0.98]
            transition-all duration-200"
        >
          {offer.ctaText ?? "Shop Now"}
          <ArrowRight size={10} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* ── Countdown ── */}
      <div className="relative shrink-0">
        {offer.endAt
          ? <CountdownStrip endAt={offer.endAt} dark={true} />
          : <div className="h-[38px]" aria-hidden />}
      </div>
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
      hover:border-[#C6A66B]/60 hover:shadow-[0_6px_28px_rgba(198,166,107,0.15)]
      transition-all duration-300 overflow-hidden">

      {/* Gold top bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
        scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_300px]">

        {/* ── LEFT: main content ──────────────────────────────────────── */}
        <div className="px-6 sm:px-8 py-7 flex flex-col gap-4">
          {/* Badge + date */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <OfferIcon type={offer.offerType} dark={true} />
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#C6A66B]">
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
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5">
            <DiscountNumber offer={offer} dark={true} />
            <div className="flex flex-col gap-1 pb-1">
              <h3 className="font-heading text-[18px] font-bold text-[#FFFCF7] leading-snug">
                {offer.title}
              </h3>
              {offer.description && (
                <p className="font-body text-[11px] text-[#A8B5A0] leading-relaxed max-w-xs">
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
                font-body text-[10px] font-bold uppercase tracking-[0.12em]
                bg-[#C6A66B] text-[#1C3325] px-4 py-2.5
                hover:bg-[#D4B47A] active:scale-[0.98]
                transition-all duration-200"
            >
              {offer.ctaText ?? "Shop Now"}
              <ArrowRight size={10} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <EligibilityNote offer={offer} dark={true} />
          </div>
        </div>

        {/* ── DIVIDER ─────────────────────────────────────────────────── */}
        <div className="hidden md:block bg-white/[0.07]" />

        {/* ── RIGHT: coupon + countdown ────────────────────────────────── */}
        <div className="flex flex-col justify-center gap-4 px-6 sm:px-8 py-7
          border-t border-white/[0.07] md:border-t-0">

          {offer.couponCode && offer.displayCouponPublicly ? (
            <>
              <div>
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8B5A0] mb-2">
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
              <p className="font-body text-[11px] text-[#A8B5A0] leading-relaxed">
                Discount is applied automatically. Add eligible books to your cart and save instantly.
              </p>
            </div>
          )}

          {offer.minCartValuePaise && (
            <div className="flex items-center gap-2 border-t border-white/[0.07] pt-3">
              <ShoppingCart size={11} className="text-[#A8B5A0] shrink-0" strokeWidth={1.8} />
              <span className="font-body text-[11px] text-[#A8B5A0]">
                Min. cart value: <strong className="text-[#FFFCF7]">{formatINR(offer.minCartValuePaise)}</strong>
              </span>
            </div>
          )}

          {offer.endAt && <CountdownStrip endAt={offer.endAt} dark={true} />}
        </div>
      </div>
    </article>
  );
}

// ─── Mobile card carousel ─────────────────────────────────────────────────────
function MobileCarousel({ offers }: { offers: Offer[] }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

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

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / offers.length;
    el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Scroll track — cards are same width, no tilt/scale to avoid overlap */}
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory
          scrollbar-none pb-1 -mx-4 px-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {offers.map((offer, i) => {
          const isDark = !!(offer.endAt) || i % 2 === 1;
          return (
            <div
              key={offer.id}
              className="snap-center shrink-0 w-[calc(100vw-3rem)]"
              style={{
                // Slight opacity fade on non-active; NO rotate/scale to prevent overlap
                opacity: active === i ? 1 : 0.6,
                transition: "opacity 0.25s ease",
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
        <p className="text-center font-body text-[10px] text-[#A8B5A0] mt-1.5 uppercase tracking-[0.15em]">
          {active + 1} / {offers.length}
        </p>
      )}
    </div>
  );
}

// ─── Desktop grid — equal-height cards via CSS grid rows ─────────────────────
// Uses CSS grid with auto-fit columns so cards in the same implicit row
// automatically stretch to match the tallest card (align-items: stretch default).
function DesktopGrid({ offers }: { offers: Offer[] }) {
  return (
    <div
      className="grid gap-5"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {offers.map((offer, i) => (
        <div key={offer.id} className="flex">
          {/* flex wrapper ensures the article fills the cell height */}
          <div className="w-full">
            {!!(offer.endAt) || i % 2 === 1
              ? <CardDark  offer={offer} />
              : <CardLight offer={offer} />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Unified offer grid ───────────────────────────────────────────────────────
function OfferGrid({ offers }: { offers: Offer[] }) {
  return (
    <>
      {/* Mobile: snap carousel */}
      <div className="sm:hidden">
        <MobileCarousel offers={offers} />
      </div>

      {/* Tablet + Desktop: equal-height grid */}
      <div className="hidden sm:block">
        <DesktopGrid offers={offers} />
      </div>
    </>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-6 h-px bg-[#C6A66B]" />
          <p className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#C6A66B]">
            Exclusive Deals
          </p>
        </div>
        <h2 className="font-heading text-[36px] sm:text-[44px] font-bold text-[#242824] leading-[1.05]">
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
    <section id="offers" className="bg-[#F5EFE6] py-12 lg:py-16" aria-label="Exclusive reader deals">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        <div className="overflow-hidden sm:overflow-visible">
          <OfferGrid offers={sorted} />
        </div>
      </div>
    </section>
  );
}
