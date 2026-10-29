"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Copy, Check, Clock, ArrowRight, ShoppingCart, BookOpen, Layers } from "lucide-react";
import type { Offer } from "@/types";
import { formatINR } from "@/lib/currency";

// ─── Decorative SVG book stack (inline — no external dependency) ──────────────
function BookStackSvg({ dark = false }: { dark?: boolean }) {
  const c = dark ? "#A8B5A0" : "#203A2B";
  const c2 = dark ? "#C6A66B" : "#315B55";
  return (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Book 3 (back) */}
      <rect x="30" y="52" width="66" height="11" rx="2" fill={c} opacity="0.18" />
      <rect x="30" y="52" width="7" height="11" rx="1" fill={c} opacity="0.32" />
      {/* Book 2 (mid) */}
      <rect x="22" y="38" width="70" height="13" rx="2" fill={c2} opacity="0.22" />
      <rect x="22" y="38" width="8" height="13" rx="1" fill={c2} opacity="0.38" />
      {/* Book 1 (front) */}
      <rect x="16" y="22" width="74" height="15" rx="2" fill={c} opacity="0.28" />
      <rect x="16" y="22" width="9" height="15" rx="1" fill={c} opacity="0.5" />
      {/* Leaf accent */}
      <path d="M88 18 Q98 10 102 24 Q96 28 88 18Z" fill={c2} opacity="0.25" />
      <path d="M90 19 Q102 17 100 24" stroke={c2} strokeWidth="0.8" opacity="0.3" fill="none" />
    </svg>
  );
}

// ─── Countdown – live ticking ─────────────────────────────────────────────────
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

function CountdownTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[18px] font-heading font-bold text-[#FFFCF7] leading-none w-8 text-center">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[8px] font-body uppercase tracking-[0.12em] text-[#A8B5A0] mt-0.5">{label}</span>
    </div>
  );
}

function CountdownRow({ endAt }: { endAt: string }) {
  const { days, hours, mins, expired } = useCountdown(endAt);
  if (expired) return null;
  return (
    <div className="flex items-center gap-1.5">
      <Clock size={11} className="text-[#A8B5A0] shrink-0" />
      <span className="text-[11px] font-body text-[#A8B5A0]">Offer ends in</span>
      <div className="flex items-center gap-2 ml-1">
        <CountdownTile value={days}  label="Days"  />
        <span className="text-[#C6A66B] text-[14px] font-bold leading-none -mt-1">·</span>
        <CountdownTile value={hours} label="Hours" />
        <span className="text-[#C6A66B] text-[14px] font-bold leading-none -mt-1">·</span>
        <CountdownTile value={mins}  label="Mins"  />
      </div>
    </div>
  );
}

// ─── Copy code pill ───────────────────────────────────────────────────────────
function CopyPill({
  code,
  dark = false,
}: {
  code: string;
  dark?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const border = dark ? "border-white/25" : "border-[#203A2B]/30";
  const bg     = dark ? "bg-white/[0.06] hover:bg-white/[0.10]" : "bg-transparent hover:bg-[#203A2B]/[0.04]";
  const text   = dark ? "text-[#FFFCF7]" : "text-[#203A2B]";
  const subtext = dark ? "text-[#A8B5A0]" : "text-[#9e9a94]";

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy code ${code}`}
      className={`flex items-center justify-between gap-3 w-full border-2 border-dashed ${border} ${bg} rounded-lg px-3.5 py-2.5 transition-all duration-150 group`}
    >
      <span className={`font-mono text-[14px] font-bold tracking-[0.15em] ${text}`}>
        {code}
      </span>
      <span className={`flex items-center gap-1 text-[10px] font-body uppercase tracking-[0.1em] ${subtext} group-hover:${dark ? "text-white/70" : "text-[#315B55]"} transition-colors shrink-0`}>
        {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
        {copied ? "Copied!" : "Copy Code"}
      </span>
    </button>
  );
}

// ─── Badge chip ───────────────────────────────────────────────────────────────
function BadgeChip({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-body font-bold uppercase tracking-[0.14em]
        ${dark
          ? "bg-[#C6A66B] text-[#242824]"
          : "bg-[#203A2B] text-[#FFFCF7]"
        }`}
    >
      {label}
    </span>
  );
}

// ─── Discount headline ─────────────────────────────────────────────────────────
function DiscountHeadline({
  offer,
  dark = false,
}: {
  offer: Offer;
  dark?: boolean;
}) {
  const color = dark ? "text-[#C6A66B]" : "text-[#203A2B]";
  const sub   = dark ? "text-[#FFFCF7]" : "text-[#242824]";

  if (offer.offerType === "bundle" || offer.offerType === "buy_x_get_y") {
    const x = offer.buyX ?? 3;
    return (
      <div>
        <p className={`font-heading text-[38px] sm:text-[42px] font-bold ${color} leading-[0.9] tracking-tight`}>
          BUY {x} &amp;
        </p>
        <p className={`font-heading text-[38px] sm:text-[42px] font-bold ${color} leading-[0.9] tracking-tight`}>
          SAVE {offer.discountValue}%
        </p>
      </div>
    );
  }

  if (offer.discountType === "flat") {
    return (
      <p className={`font-heading text-[44px] sm:text-[52px] font-bold ${color} leading-[0.85] tracking-tight`}>
        SAVE {formatINR(offer.discountValue * 100)}
      </p>
    );
  }

  // percent
  return (
    <div className="flex items-start gap-0">
      <p className={`font-heading text-[52px] sm:text-[60px] font-bold ${color} leading-[0.85] tracking-tight`}>
        {offer.discountValue}%
      </p>
      <p className={`font-heading text-[22px] font-bold ${color} leading-none mt-1.5 ml-1`}>OFF</p>
    </div>
  );
}

// ─── Card type A — standard portrait card (light) ─────────────────────────────
function CardLight({ offer }: { offer: Offer }) {
  const badge = offer.badgeLabel || defaultBadge(offer);
  const ctaHref = "/books";

  return (
    <article className="group relative bg-[#F5EFE6] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col min-h-[360px]">
      {/* Decorative illustration top-right */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-30 pointer-events-none select-none">
        <BookStackSvg dark={false} />
      </div>

      <div className="relative z-10 p-6 flex flex-col flex-1 gap-4">
        {/* Badge */}
        <div><BadgeChip label={badge} /></div>

        {/* Discount headline */}
        <DiscountHeadline offer={offer} dark={false} />

        {/* Title + description */}
        <div>
          <h3 className="font-heading text-[19px] font-bold text-[#242824] leading-snug">
            {offer.title}
          </h3>
          <p className="font-body text-[13px] text-[#777970] mt-1.5 leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        </div>

        {/* Coupon pill */}
        {offer.couponCode && offer.displayCouponPublicly && (
          <CopyPill code={offer.couponCode} dark={false} />
        )}

        {/* CTA */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href={ctaHref}
            className="flex items-center justify-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.14em] px-5 py-3 rounded-xl hover:bg-[#315B55] transition-colors duration-200"
            aria-label={`${offer.ctaText ?? "Explore Books"} — ${offer.title}`}
          >
            {offer.ctaText ?? "Explore Books"}
            <ArrowRight size={12} />
          </Link>

          {/* Footer meta */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-body text-[#A8B5A0] flex items-center gap-1">
              {offer.customerEligibility === "new_customers"
                ? <><BookOpen size={9} /> First-time customers only</>
                : offer.minCartValuePaise
                  ? <><ShoppingCart size={9} /> Min. {formatINR(offer.minCartValuePaise)}</>
                  : <><Layers size={9} /> Selected books</>
              }
            </span>
            <span className="text-[10px] font-body text-[#A8B5A0]">Terms apply</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Card type B — portrait card dark (forest green) ──────────────────────────
function CardDark({ offer }: { offer: Offer }) {
  const badge = offer.badgeLabel || defaultBadge(offer);
  const ctaHref = "/books";

  return (
    <article className="group relative bg-[#203A2B] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col min-h-[360px]">
      {/* Decorative illustration */}
      <div className="absolute top-0 right-0 w-36 h-36 opacity-20 pointer-events-none select-none">
        <BookStackSvg dark={true} />
      </div>
      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBudW1PY3RhdmVzPSI0Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      <div className="relative z-10 p-6 flex flex-col flex-1 gap-4">
        {/* Badge */}
        <div><BadgeChip label={badge} dark={true} /></div>

        {/* Discount headline */}
        <DiscountHeadline offer={offer} dark={true} />

        {/* Title + description */}
        <div>
          <h3 className="font-heading text-[19px] font-bold text-[#FFFCF7] leading-snug">
            {offer.title}
          </h3>
          <p className="font-body text-[13px] text-[#A8B5A0] mt-1.5 leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        </div>

        {/* Coupon pill */}
        {offer.couponCode && offer.displayCouponPublicly && (
          <CopyPill code={offer.couponCode} dark={true} />
        )}

        {/* Countdown */}
        {offer.endAt && (
          <CountdownRow endAt={offer.endAt} />
        )}

        {/* CTA */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href={ctaHref}
            className="flex items-center justify-center gap-2 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.14em] px-5 py-3 rounded-xl hover:bg-[#D4B47A] transition-colors duration-200"
            aria-label={`${offer.ctaText ?? "Shop the Offer"} — ${offer.title}`}
          >
            {offer.ctaText ?? "Shop the Offer"}
            <ArrowRight size={12} />
          </Link>

          {/* Footer meta */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-body text-[#A8B5A0]/70 flex items-center gap-1">
              {offer.applicableBookIds?.length
                ? <><BookOpen size={9} /> On selected eBooks only</>
                : <><Layers size={9} /> All eligible books</>
              }
            </span>
            <span className="text-[10px] font-body text-[#A8B5A0]/70">Terms apply</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Card type C — wide banner (full-width, last card) ────────────────────────
function CardBanner({ offer }: { offer: Offer }) {
  const badge = offer.badgeLabel || defaultBadge(offer);
  const ctaHref = "/books";

  return (
    <article className="group relative bg-[#F5EFE6] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 min-h-[200px]">

        {/* Left — discount + cta */}
        <div className="p-6 sm:p-8 flex flex-col justify-center gap-4">
          <div><BadgeChip label={badge} /></div>
          <DiscountHeadline offer={offer} dark={false} />
          <div>
            <h3 className="font-heading text-[20px] font-bold text-[#242824] leading-snug">
              {offer.title}
            </h3>
            <p className="font-body text-[13px] text-[#777970] mt-1 leading-relaxed">
              {offer.description}
            </p>
          </div>
          <Link
            href={ctaHref}
            className="flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.14em] px-5 py-3 rounded-xl hover:bg-[#315B55] transition-colors duration-200 w-fit"
            aria-label={`${offer.ctaText ?? "Shop Now"} — ${offer.title}`}
          >
            {offer.ctaText ?? "Shop Now"}
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Centre — coupon + meta (only on md+) */}
        <div className="hidden md:flex flex-col items-center justify-center px-8 gap-3 border-x border-[#E6DFD5]">
          {offer.couponCode && offer.displayCouponPublicly && (
            <div className="w-52">
              <CopyPill code={offer.couponCode} dark={false} />
            </div>
          )}
          {offer.minCartValuePaise && (
            <p className="text-[11px] font-body text-[#A8B5A0] flex items-center gap-1.5 mt-1">
              <ShoppingCart size={10} />
              Minimum order value: {formatINR(offer.minCartValuePaise)}
            </p>
          )}
          {offer.endAt && (
            <div className="flex items-center gap-1.5 mt-1">
              <Clock size={10} className="text-[#A8B5A0]" />
              <span className="text-[11px] font-body text-[#A8B5A0]">
                Valid till {new Date(offer.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <span className="text-[#A8B5A0] mx-1">|</span>
              <span className="text-[11px] font-body text-[#A8B5A0]">Terms apply</span>
            </div>
          )}
        </div>

        {/* Right — decorative / illustration */}
        <div className="relative hidden md:flex items-center justify-center overflow-hidden bg-[#EDE6D8] rounded-r-2xl min-h-[200px]">
          {/* Big decorative text */}
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
            <p className="font-heading text-[52px] font-bold text-[#203A2B]/10 leading-tight text-center px-4">
              Great<br />Stories<br />Greater<br />Savings
            </p>
          </div>
          {/* Book stack illustration */}
          <div className="relative z-10 w-32 h-32 opacity-40">
            <BookStackSvg dark={false} />
          </div>
        </div>

        {/* Mobile-only: coupon below the fold */}
        <div className="md:hidden px-6 pb-6 flex flex-col gap-2">
          {offer.couponCode && offer.displayCouponPublicly && (
            <CopyPill code={offer.couponCode} dark={false} />
          )}
          <div className="flex items-center justify-between mt-1">
            {offer.minCartValuePaise && (
              <p className="text-[10px] font-body text-[#A8B5A0] flex items-center gap-1">
                <ShoppingCart size={9} />
                Min. {formatINR(offer.minCartValuePaise)}
              </p>
            )}
            <span className="text-[10px] font-body text-[#A8B5A0] ml-auto">Terms apply</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function defaultBadge(offer: Offer): string {
  const map: Record<string, string> = {
    first_order:      "Welcome Offer",
    bundle:           "Book Bundle",
    buy_x_get_y:      "Book Bundle",
    combo:            "Combo Deal",
    category:         "Category Deal",
    product_specific: "Limited Offer",
    percent:          "Limited-Time Deal",
    flat:             "Extra Savings",
  };
  return map[offer.offerType] ?? "Special Offer";
}

// Assign card variant by position + offer type for visual variety
function cardVariant(offer: Offer, index: number, total: number): "light" | "dark" | "banner" {
  // Last card as banner only when it's the 4th+ and not already in the first 3
  if (total >= 4 && index === total - 1 && index >= 3) return "banner";
  // Alternate light/dark: 0=light, 1=light, 2=dark, 3=light…
  // Make the dark card the one with a countdown (most urgent = dark = prominent)
  if (offer.endAt && index < 3) return "dark";
  return "light";
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader() {
  return (
    <div className="text-center mb-12">
      {/* Eyebrow */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="w-10 h-px bg-[#C6A66B]" />
        <p className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#C6A66B]">
          Exclusive Reader Deals
        </p>
        <span className="w-10 h-px bg-[#C6A66B]" />
      </div>
      {/* Heading */}
      <h2 className="font-heading text-[40px] sm:text-[52px] font-bold text-[#242824] leading-tight mb-3">
        A Little More to Love
      </h2>
      <p className="font-body text-[15px] text-[#777970] max-w-md mx-auto leading-relaxed">
        Discover special offers and find your next favourite read for less.
      </p>
      {/* View all link */}
      <Link
        href="/books"
        className="inline-flex items-center gap-1.5 mt-5 text-[11px] font-body font-bold uppercase tracking-[0.15em] text-[#242824] border-b border-[#242824]/40 pb-0.5 hover:border-[#242824] transition-colors"
      >
        View All Offers <ArrowRight size={11} />
      </Link>
    </div>
  );
}

// ─── Offer grid layout ─────────────────────────────────────────────────────────
function OfferGrid({ offers }: { offers: Offer[] }) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
        <CardLight offer={offers[0]} />
        <CardDark  offer={offers[1]} />
      </div>
    );
  }

  // 3 cards — top row of 3
  if (total === 3) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <CardLight offer={offers[0]} />
        <CardLight offer={offers[1]} />
        <CardDark  offer={offers[2]} />
      </div>
    );
  }

  // 4+ cards — 3-column grid top row, banner last if 4th
  const topRow   = offers.slice(0, 3);
  const rest     = offers.slice(3);
  const lastCard = rest[rest.length - 1];
  const middleCards = rest.slice(0, rest.length - 1);

  return (
    <div className="flex flex-col gap-5">
      {/* First row: 3-up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {topRow.map((offer, i) => {
          const v = cardVariant(offer, i, total);
          return v === "dark"
            ? <CardDark  key={offer.id} offer={offer} />
            : <CardLight key={offer.id} offer={offer} />;
        })}
      </div>

      {/* Any middle cards */}
      {middleCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {middleCards.map((offer, i) => (
            i % 2 === 0
              ? <CardDark  key={offer.id} offer={offer} />
              : <CardLight key={offer.id} offer={offer} />
          ))}
        </div>
      )}

      {/* Full-width banner (last card) */}
      {lastCard && <CardBanner offer={lastCard} />}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
interface OffersSectionProps {
  offers: Offer[];
}

export function OffersSection({ offers }: OffersSectionProps) {
  if (offers.length === 0) return null;

  // Sort: priority desc → startAt desc, deduplicate
  const sorted = [...offers]
    .sort((a, b) => b.priority - a.priority || b.startAt.localeCompare(a.startAt))
    .filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i);

  return (
    <section className="bg-[#FFFCF7] py-14 lg:py-20 border-t border-[#E6DFD5]" aria-label="Exclusive reader deals">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        <OfferGrid offers={sorted} />

        {/* Trust strip */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-[#E6DFD5] pt-10">
          {[
            { icon: "🔒", title: "Secure Payments",    sub: "100% safe & encrypted"     },
            { icon: "⚡", title: "Instant Download",   sub: "Read anytime, anywhere"    },
            { icon: "🎁", title: "Exclusive Offers",   sub: "For our valued readers"    },
            { icon: "⭐", title: "Trusted by Readers", sub: "Join our growing community" },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full border border-[#E6DFD5] flex items-center justify-center text-[15px] shrink-0">
                {icon}
              </div>
              <div>
                <p className="font-body text-[12px] font-bold text-[#242824] leading-tight">{title}</p>
                <p className="font-body text-[11px] text-[#A8B5A0] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
