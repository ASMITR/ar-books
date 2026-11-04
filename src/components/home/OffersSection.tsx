"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Copy, Check, Clock, ArrowRight, ShoppingCart,
  BookOpen, Layers, Tag, Zap, Gift, PackageOpen, Sparkles,
} from "lucide-react";
import type { Offer } from "@/types";
import { formatINR } from "@/lib/currency";

// ─── Countdown hook (updates every second) ───────────────────────────────────
function useCountdown(endAt: string) {
  const calc = () => {
    const diff = new Date(endAt).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      mins:    Math.floor((diff % 3600000) / 60000),
      secs:    Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt]);
  return tick;
}

// ─── Countdown bar ────────────────────────────────────────────────────────────
function CountdownBar({ endAt, dark }: { endAt: string; dark: boolean }) {
  const { days, hours, mins, secs, expired } = useCountdown(endAt);
  if (expired) return null;

  const wrapBg  = dark ? "bg-[#152A1C]"      : "bg-[#F5EFE6]";
  const border  = dark ? "border-[#2E5040]"  : "border-[#E6DFD5]";
  const label   = dark ? "text-[#A8B5A0]"   : "text-[#777970]";
  const boxBg   = dark ? "bg-[#1C3325] border-[#2E5040]" : "bg-[#FFFCF7] border-[#E6DFD5]";
  const numTxt  = dark ? "text-[#FFFCF7]"   : "text-[#203A2B]";
  const unitTxt = dark ? "text-[#A8B5A0]"   : "text-[#A8B5A0]";

  const units = [
    { v: days,  l: "Days" },
    { v: hours, l: "Hrs"  },
    { v: mins,  l: "Min"  },
    { v: secs,  l: "Sec"  },
  ].filter(({ l }) => l !== "Days" || days > 0);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${wrapBg} border-t ${border}`}>
      <div className="flex items-center gap-1.5 shrink-0">
        <Clock size={10} className={label} strokeWidth={2} />
        <span className={`font-body text-[9px] font-bold uppercase tracking-[0.15em] ${label}`}>
          Ends in
        </span>
      </div>
      <div className="flex items-center gap-1">
        {units.map(({ v, l }, i) => (
          <div key={l} className="flex items-center gap-1">
            {i > 0 && <span className={`${label} text-[11px] font-bold mx-0.5`}>:</span>}
            <div className={`flex flex-col items-center min-w-[34px] border ${boxBg} px-1.5 py-1`}>
              <span className={`font-heading text-[15px] font-bold leading-none tabular-nums ${numTxt}`}>
                {String(v).padStart(2, "0")}
              </span>
              <span className={`font-body text-[7px] uppercase tracking-[0.08em] ${unitTxt} leading-none mt-0.5`}>
                {l}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Copy code pill ───────────────────────────────────────────────────────────
function CopyPill({ code, dark }: { code: string; dark: boolean }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); }
    catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  const base = "w-full flex items-center justify-between gap-3 px-4 py-3 border-2 border-dashed transition-all duration-200 group";
  const idle = dark
    ? "border-[#C6A66B]/40 bg-[#C6A66B]/5 hover:border-[#C6A66B]/80 hover:bg-[#C6A66B]/10"
    : "border-[#203A2B]/25 bg-[#203A2B]/4 hover:border-[#203A2B]/55 hover:bg-[#203A2B]/8";
  const done = "border-emerald-500/50 bg-emerald-50/40";

  return (
    <button onClick={handleCopy} aria-label={`Copy code ${code}`}
      className={`${base} ${copied ? done : idle}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <Tag size={11} strokeWidth={2}
          className={dark ? "text-[#C6A66B] shrink-0" : "text-[#315B55] shrink-0"} />
        <span className={`font-mono text-[13px] font-bold tracking-[0.22em] truncate
          ${dark ? "text-[#FFFCF7]" : "text-[#203A2B]"}`}>
          {code}
        </span>
      </div>
      <span className={`flex items-center gap-1.5 shrink-0 font-body text-[10px] font-bold uppercase
        tracking-[0.1em] transition-colors
        ${copied ? "text-emerald-500"
          : dark  ? "text-[#A8B5A0] group-hover:text-[#C6A66B]"
                  : "text-[#A8B5A0] group-hover:text-[#203A2B]"}`}>
        {copied ? <Check size={11} strokeWidth={2.5} /> : <Copy size={10} />}
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}

// ─── Offer type icon ──────────────────────────────────────────────────────────
function OfferIcon({ type, dark }: { type: string; dark: boolean }) {
  const cls = `shrink-0 ${dark ? "text-[#C6A66B]" : "text-[#203A2B]"}`;
  if (type === "bundle" || type === "buy_x_get_y")
    return <PackageOpen size={14} strokeWidth={1.8} className={cls} />;
  if (type === "first_order")
    return <Gift size={14} strokeWidth={1.8} className={cls} />;
  if (type === "category" || type === "product_specific")
    return <Layers size={14} strokeWidth={1.8} className={cls} />;
  return <Zap size={14} strokeWidth={1.8} className={cls} />;
}

// ─── Big discount number ──────────────────────────────────────────────────────
function DiscountSlab({ offer, dark }: { offer: Offer; dark: boolean }) {
  const num  = `font-heading font-bold leading-none tracking-tight ${dark ? "text-[#C6A66B]" : "text-[#203A2B]"}`;
  const mute = `font-body font-bold uppercase tracking-[0.1em] ${dark ? "text-[#A8B5A0]" : "text-[#789185]"}`;

  if (offer.offerType === "bundle" || offer.offerType === "buy_x_get_y") {
    return (
      <div className="flex items-end gap-2">
        <span className={`${num} text-[50px]`}>
          {offer.discountValue}<span className="text-[26px] ml-0.5">%</span>
        </span>
        <span className={`${mute} text-[9px] mb-2`}>buy {offer.buyX ?? 3}+</span>
      </div>
    );
  }
  if (offer.discountType === "flat") {
    return (
      <div className="flex items-start gap-0.5">
        <span className={`${num} text-[22px] mt-2`}>₹</span>
        <span className={`${num} text-[50px]`}>
          {offer.discountValue.toLocaleString("en-IN")}
        </span>
        <span className={`${mute} text-[9px] self-end mb-2 ml-1`}>off</span>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-1">
      <span className={`${num} text-[54px]`}>{offer.discountValue}</span>
      <span className={`${num} text-[26px] mb-1`}>%</span>
      <span className={`${mute} text-[9px] mb-2`}>off</span>
    </div>
  );
}

// ─── Eligibility badge ────────────────────────────────────────────────────────
function EligibilityBadge({ offer, dark }: { offer: Offer; dark: boolean }) {
  const cls = `inline-flex items-center gap-1.5 font-body text-[9px] font-bold uppercase
    tracking-[0.12em] px-2 py-1 border
    ${dark
      ? "border-[#2E5040] bg-[#152A1C] text-[#A8B5A0]"
      : "border-[#E6DFD5] bg-[#F5EFE6] text-[#777970]"}`;
  if (offer.customerEligibility === "new_customers")
    return <span className={cls}><BookOpen size={8} strokeWidth={2} /> New customers</span>;
  if (offer.minCartValueRupees)
    return <span className={cls}><ShoppingCart size={8} strokeWidth={2} /> Min {formatINR(offer.minCartValueRupees)}</span>;
  if (offer.applicableBookIds?.length)
    return <span className={cls}><Layers size={8} strokeWidth={2} /> Selected books</span>;
  return <span className={cls}><Sparkles size={8} strokeWidth={2} /> All books</span>;
}

// ─── Badge label ─────────────────────────────────────────────────────────────
function badgeFor(offer: Offer): string {
  if (offer.badgeLabel) return offer.badgeLabel;
  const map: Record<string, string> = {
    first_order:      "Welcome Offer",
    bundle:           "Bundle Deal",
    buy_x_get_y:      "Buy More Save More",
    combo:            "Combo Deal",
    category:         "Category Deal",
    product_specific: "Limited Offer",
    percent:          "Limited-Time",
    flat:             "Extra Savings",
  };
  return map[offer.offerType] ?? "Special Offer";
}

// ═════════════════════════════════════════════════════════════════════════════
//  CARD LIGHT  — ivory / forest
// ═════════════════════════════════════════════════════════════════════════════
function CardLight({ offer }: { offer: Offer }) {
  return (
    <article className="group relative flex flex-col h-full bg-[#FFFCF7]
      border border-[#E6DFD5] hover:border-[#C6A66B]
      hover:shadow-[0_8px_32px_rgba(32,58,43,0.11)]
      transition-all duration-300 overflow-hidden">

      {/* Gold left stripe on hover */}
      <div className="absolute left-0 inset-y-0 w-[3px] bg-[#C6A66B]
        scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300" />

      {/* Top accent line */}
      <div className="h-[3px] bg-gradient-to-r from-[#C6A66B]/50 via-[#C6A66B]/20 to-transparent" />

      {/* Badge row */}
      <div className="flex items-center justify-between gap-2 px-5 pt-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#203A2B]/8 flex items-center justify-center shrink-0">
            <OfferIcon type={offer.offerType} dark={false} />
          </div>
          <span className="font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#315B55] truncate">
            {badgeFor(offer)}
          </span>
        </div>
        {offer.endAt && (
          <span className="font-body text-[9px] text-[#A8B5A0] flex items-center gap-1
            shrink-0 border border-[#E6DFD5] px-2 py-0.5">
            <Clock size={8} strokeWidth={2} />
            {new Date(offer.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* Discount */}
      <div className="px-5 pt-3 shrink-0">
        <DiscountSlab offer={offer} dark={false} />
      </div>

      {/* Ruled divider */}
      <div className="mx-5 mt-2 h-px bg-gradient-to-r from-[#C6A66B]/40 via-[#E6DFD5] to-transparent shrink-0" />

      {/* Title + desc — flex-1 fills remaining height */}
      <div className="px-5 pt-3 flex flex-col gap-1.5 flex-1">
        <h3 className="font-heading text-[17px] font-bold text-[#1a1a1a] leading-snug line-clamp-2">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="font-body text-[11px] text-[#777970] leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        )}
      </div>

      {/* Coupon */}
      {offer.couponCode && offer.displayCouponPublicly && (
        <div className="px-5 pt-4 shrink-0">
          <CopyPill code={offer.couponCode} dark={false} />
        </div>
      )}

      {/* Footer */}
      <div className="px-5 pt-3 pb-5 flex items-center justify-between gap-2 shrink-0">
        <EligibilityBadge offer={offer} dark={false} />
        <Link href="/books"
          aria-label={`${offer.ctaText ?? "Shop Now"} — ${offer.title}`}
          className="inline-flex items-center gap-1.5 shrink-0
            font-body text-[9px] font-bold uppercase tracking-[0.14em]
            bg-[#203A2B] text-[#FFFCF7] px-4 py-2.5
            hover:bg-[#315B55] active:scale-[0.98] transition-all">
          {offer.ctaText ?? "Shop Now"}
          <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>

      {offer.endAt && (
        <div className="shrink-0">
          <CountdownBar endAt={offer.endAt} dark={false} />
        </div>
      )}
    </article>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  CARD DARK  — forest green / gold
// ═════════════════════════════════════════════════════════════════════════════
function CardDark({ offer }: { offer: Offer }) {
  return (
    <article className="group relative flex flex-col h-full bg-[#1C3325]
      border border-[#2E5040] hover:border-[#C6A66B]/70
      hover:shadow-[0_8px_36px_rgba(198,166,107,0.16)]
      transition-all duration-300 overflow-hidden">

      {/* Gold left stripe on hover */}
      <div className="absolute left-0 inset-y-0 w-[3px] bg-[#C6A66B]
        scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300" />

      {/* Gold top line */}
      <div className="h-[3px] bg-gradient-to-r from-[#C6A66B] via-[#C6A66B]/60 to-transparent" />

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")"}} />

      {/* Badge row */}
      <div className="relative flex items-center justify-between gap-2 px-5 pt-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#C6A66B]/15 flex items-center justify-center shrink-0">
            <OfferIcon type={offer.offerType} dark={true} />
          </div>
          <span className="font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#C6A66B] truncate">
            {badgeFor(offer)}
          </span>
        </div>
        {offer.endAt && (
          <span className="font-body text-[9px] text-[#A8B5A0]/70 flex items-center gap-1
            shrink-0 border border-[#2E5040] px-2 py-0.5">
            <Clock size={8} strokeWidth={2} />
            {new Date(offer.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* Discount */}
      <div className="relative px-5 pt-3 shrink-0">
        <DiscountSlab offer={offer} dark={true} />
      </div>

      {/* Divider */}
      <div className="mx-5 mt-2 h-px bg-gradient-to-r from-[#C6A66B]/30 via-[#2E5040] to-transparent shrink-0" />

      {/* Title + desc */}
      <div className="relative px-5 pt-3 flex flex-col gap-1.5 flex-1">
        <h3 className="font-heading text-[17px] font-bold text-[#FFFCF7] leading-snug line-clamp-2">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="font-body text-[11px] text-[#A8B5A0] leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        )}
      </div>

      {/* Coupon */}
      {offer.couponCode && offer.displayCouponPublicly && (
        <div className="relative px-5 pt-4 shrink-0">
          <CopyPill code={offer.couponCode} dark={true} />
        </div>
      )}

      {/* Footer */}
      <div className="relative px-5 pt-3 pb-5 flex items-center justify-between gap-2 shrink-0">
        <EligibilityBadge offer={offer} dark={true} />
        <Link href="/books"
          aria-label={`${offer.ctaText ?? "Shop Now"} — ${offer.title}`}
          className="inline-flex items-center gap-1.5 shrink-0
            font-body text-[9px] font-bold uppercase tracking-[0.14em]
            bg-[#C6A66B] text-[#1C3325] px-4 py-2.5
            hover:bg-[#D4B47A] active:scale-[0.98] transition-all">
          {offer.ctaText ?? "Shop Now"}
          <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>

      {offer.endAt && (
        <div className="relative shrink-0">
          <CountdownBar endAt={offer.endAt} dark={true} />
        </div>
      )}
    </article>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  HERO BANNER  — top offer, full-width two-panel layout
// ═════════════════════════════════════════════════════════════════════════════
function HeroBanner({ offer }: { offer: Offer }) {
  return (
    <article className="group relative bg-[#1C3325] border border-[#2E5040]
      hover:border-[#C6A66B]/55 transition-all duration-300 overflow-hidden">

      {/* Gold top band */}
      <div className="h-[3px] bg-gradient-to-r from-[#C6A66B]/40 via-[#C6A66B] to-[#C6A66B]/40" />

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C6A66B]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#203A2B]/40 blur-2xl pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">

        {/* LEFT — main offer content */}
        <div className="px-7 sm:px-10 py-8 flex flex-col gap-5">

          {/* Badge + expiry */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#C6A66B]/15 border border-[#C6A66B]/20 flex items-center justify-center shrink-0">
                <OfferIcon type={offer.offerType} dark={true} />
              </div>
              <span className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-[#C6A66B]">
                {badgeFor(offer)}
              </span>
            </div>
            {offer.endAt && (
              <span className="font-body text-[9px] text-[#A8B5A0]/70 flex items-center gap-1.5
                border border-[#2E5040] px-2.5 py-1">
                <Clock size={8} strokeWidth={2} />
                Ends {new Date(offer.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>

          {/* Discount + title side by side on sm+ */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6">
            <div className="shrink-0">
              <DiscountSlab offer={offer} dark={true} />
            </div>
            <div className="flex flex-col gap-1.5 sm:pb-2">
              <div className="w-8 h-px bg-[#C6A66B]/40 hidden sm:block" />
              <h3 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#FFFCF7] leading-snug">
                {offer.title}
              </h3>
              {offer.description && (
                <p className="font-body text-[12px] text-[#A8B5A0] leading-relaxed max-w-sm">
                  {offer.description}
                </p>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/books"
              aria-label={`${offer.ctaText ?? "Shop Now"} — ${offer.title}`}
              className="inline-flex items-center gap-2
                font-body text-[10px] font-bold uppercase tracking-[0.18em]
                bg-[#C6A66B] text-[#1C3325] px-6 py-3.5
                hover:bg-[#D4B47A] active:scale-[0.98] transition-all shadow-sm">
              {offer.ctaText ?? "Shop Now"}
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <EligibilityBadge offer={offer} dark={true} />
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-[#2E5040]" />

        {/* RIGHT — coupon + countdown */}
        <div className="px-7 sm:px-10 lg:px-8 py-8 flex flex-col justify-center gap-5
          border-t border-[#2E5040] lg:border-t-0">

          {offer.couponCode && offer.displayCouponPublicly ? (
            <>
              <div>
                <p className="font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#A8B5A0] mb-2.5">
                  Your discount code
                </p>
                <CopyPill code={offer.couponCode} dark={true} />
              </div>
              <p className="font-body text-[11px] text-[#A8B5A0]/70 leading-relaxed">
                Apply at checkout to unlock your savings. Terms and conditions apply.
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#C6A66B]/15 flex items-center justify-center shrink-0">
                  <Check size={10} className="text-[#C6A66B]" strokeWidth={2.5} />
                </div>
                <p className="font-body text-[12px] font-semibold text-[#FFFCF7]">No code needed</p>
              </div>
              <p className="font-body text-[11px] text-[#A8B5A0] leading-relaxed">
                Discount applies automatically at checkout on all eligible books.
              </p>
            </div>
          )}

          {offer.minCartValueRupees && (
            <div className="flex items-center gap-2 border-t border-[#2E5040] pt-4">
              <ShoppingCart size={11} className="text-[#A8B5A0] shrink-0" strokeWidth={1.8} />
              <span className="font-body text-[11px] text-[#A8B5A0]">
                Min. cart: <strong className="text-[#FFFCF7]">{formatINR(offer.minCartValueRupees)}</strong>
              </span>
            </div>
          )}

          {offer.endAt && (
            <div className="border-t border-[#2E5040] -mx-7 sm:-mx-10 lg:-mx-8 -mb-8">
              <CountdownBar endAt={offer.endAt} dark={true} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  MOBILE CAROUSEL
// ═════════════════════════════════════════════════════════════════════════════
function MobileCarousel({ offers }: { offers: Offer[] }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.scrollWidth / offers.length;
      setActive(Math.min(Math.max(Math.round(el.scrollLeft / w), 0), offers.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [offers.length]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth / offers.length) * i, behavior: "smooth" });
  };

  return (
    <div>
      <div ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 -mx-4 px-4 pb-1"
        style={{ WebkitOverflowScrolling: "touch" }}>
        {offers.map((offer, i) => (
          <div key={offer.id}
            className="snap-center shrink-0 w-[calc(100vw-3rem)] transition-opacity duration-300"
            style={{ opacity: active === i ? 1 : 0.5 }}>
            {i % 2 === 0 ? <CardLight offer={offer} /> : <CardDark offer={offer} />}
          </div>
        ))}
        <div className="shrink-0 w-4" aria-hidden />
      </div>

      {offers.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {offers.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Go to offer ${i + 1}`}
              className={`rounded-full transition-all duration-300
                ${active === i ? "w-6 h-2 bg-[#203A2B]" : "w-2 h-2 bg-[#C6A66B]/35 hover:bg-[#C6A66B]/70"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  DESKTOP SCROLL ROW
// ═════════════════════════════════════════════════════════════════════════════
function DesktopScrollRow({ offers }: { offers: Offer[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers.length]);

  const scroll = (dir: "left" | "right") =>
    trackRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });

  return (
    <div className="relative">
      {canLeft && (
        <button onClick={() => scroll("left")} aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20
            w-9 h-9 bg-[#FFFCF7] border border-[#E6DFD5] shadow-md
            flex items-center justify-center text-[#555]
            hover:border-[#203A2B] hover:text-[#203A2B] hover:bg-[#F5EFE6]
            active:scale-95 transition-all">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M8.5 1.5L4 6.5l4.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll("right")} aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20
            w-9 h-9 bg-[#FFFCF7] border border-[#E6DFD5] shadow-md
            flex items-center justify-center text-[#555]
            hover:border-[#203A2B] hover:text-[#203A2B] hover:bg-[#F5EFE6]
            active:scale-95 transition-all">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M4.5 1.5L9 6.5l-4.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Edge fades */}
      <div className={`absolute left-0 inset-y-0 w-12 z-10 pointer-events-none transition-opacity duration-200
        bg-gradient-to-r from-[#F5EFE6] to-transparent ${canLeft ? "opacity-100" : "opacity-0"}`} />
      <div className={`absolute right-0 inset-y-0 w-12 z-10 pointer-events-none transition-opacity duration-200
        bg-gradient-to-l from-[#F5EFE6] to-transparent ${canRight ? "opacity-100" : "opacity-0"}`} />

      <div ref={trackRef}
        className="flex gap-5 overflow-x-auto scrollbar-none scroll-smooth py-2">
        {offers.map((offer, i) => (
          <div key={offer.id} className="shrink-0 w-[300px] lg:w-[315px] flex">
            {i % 2 === 0 ? <CardLight offer={offer} /> : <CardDark offer={offer} />}
          </div>
        ))}
        <div className="shrink-0 w-2" aria-hidden />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION HEADER
// ═════════════════════════════════════════════════════════════════════════════
function SectionHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-6 h-px bg-[#C6A66B]" />
          <p className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#C6A66B]">
            Exclusive Deals
          </p>
        </div>
        <h2 className="font-heading text-[30px] sm:text-[36px] font-bold text-[#242824] leading-tight">
          Reader Offers
        </h2>
        <p className="font-body text-[12px] text-[#777970] mt-1.5 leading-relaxed">
          Curated discounts — for every kind of reader.
        </p>
      </div>
      <Link href="/books"
        className="group inline-flex items-center gap-2 font-body text-[10px] font-bold uppercase
          tracking-[0.16em] text-[#FFFCF7] bg-[#203A2B] px-5 py-3
          hover:bg-[#315B55] transition-colors shrink-0 self-start sm:self-auto">
        Browse All Books
        <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
      </Link>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═════════════════════════════════════════════════════════════════════════════
export function OffersSection({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) return null;

  const sorted = [...offers]
    .sort((a, b) => b.priority - a.priority || b.startAt.localeCompare(a.startAt))
    .filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i);

  const [hero, ...rest] = sorted;

  return (
    <section id="offers" className="bg-[#F5EFE6] py-8 lg:py-12" aria-label="Exclusive reader deals">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeader />

        {/* Highest-priority offer = hero banner */}
        <HeroBanner offer={hero} />

        {/* Remaining offers */}
        {rest.length > 0 && (
          <div className="mt-5">
            <div className="sm:hidden">
              <MobileCarousel offers={rest} />
            </div>
            <div className="hidden sm:block">
              <DesktopScrollRow offers={rest} />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
