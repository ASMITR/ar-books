import Link from "next/link";
import {
  ArrowRight, Check, BookOpen, Download, Zap,
  Star, Crown,
} from "lucide-react";
import type { MembershipPlan } from "@/types/subscription";

// ─── Per-plan icon ─────────────────────────────────────────────────────────
function PlanIcon({ slug }: { slug: string }) {
  if (slug === "premium") return <Crown   size={16} className="text-[#C6A66B]" strokeWidth={1.6} />;
  if (slug === "plus")    return <Star    size={16} className="text-[#C6A66B]" strokeWidth={1.6} />;
  return                         <Zap     size={16} className="text-[#C6A66B]" strokeWidth={1.6} />;
}

// ─── Tier access chips ──────────────────────────────────────────────────────
function AccessChips({ plan }: { plan: MembershipPlan }) {
  const chip = "inline-flex items-center gap-1.5 font-body text-[9px] font-bold uppercase tracking-[0.13em] px-2.5 py-1 border";
  const cls  = `${chip} border-[#203A2B]/18 bg-[#203A2B]/6 text-[#315B55]`;

  return (
    <div className="flex flex-wrap gap-1.5">
      {plan.canReadOnline && (
        <span className={cls}><BookOpen size={9} strokeWidth={2} /> Online Read</span>
      )}
      {plan.canDownload && (
        <span className={cls}><Download size={9} strokeWidth={2} />
          {plan.downloadLimit ? `${plan.downloadLimit}/mo` : "Unlimited"} Downloads
        </span>
      )}
      {plan.includesExclusive && (
        <span className={cls}><Star size={9} strokeWidth={2} /> Exclusives</span>
      )}
    </div>
  );
}

// ─── Individual plan card ───────────────────────────────────────────────────
function PlanCard({ plan, index }: { plan: MembershipPlan; index: number }) {
  const isHighlighted = plan.highlighted;

  return (
    <div className={`group relative flex flex-col overflow-hidden transition-all duration-300
      ${isHighlighted
        ? "bg-[#FFFCF7] border-2 border-[#C6A66B] shadow-[0_12px_48px_rgba(198,166,107,0.18)] -translate-y-1 lg:-translate-y-2"
        : "bg-[#FFFCF7] border border-[#E6DFD5] hover:border-[#C6A66B]/50 hover:shadow-[0_8px_32px_rgba(198,166,107,0.10)]"
      }`}
    >
      {/* Most popular ribbon */}
      {isHighlighted && (
        <div className="bg-[#C6A66B] text-[#1C3325] text-center font-body text-[9px] font-black uppercase tracking-[0.22em] py-1.5">
          ✦ Most Popular
        </div>
      )}

      {/* Gold top line on non-highlighted */}
      {!isHighlighted && (
        <div className="h-[2px] bg-gradient-to-r from-[#C6A66B]/50 via-[#C6A66B]/20 to-transparent" />
      )}

      <div className="px-6 pt-6 pb-7 flex flex-col gap-5 flex-1">

        {/* Plan name + icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center shrink-0
              bg-[#203A2B]/8 border border-[#203A2B]/12">
              <PlanIcon slug={plan.slug} />
            </div>
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#203A2B]">
              {plan.name}
            </span>
          </div>
          <span className="font-body text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 border
            border-[#E6DFD5] bg-[#F5EFE6] text-[#777970]">
            {plan.billingPeriod}
          </span>
        </div>

        {/* Price */}
        <div>
          <div className="flex items-end gap-1">
            <span className="font-heading text-[13px] font-bold leading-none mb-2 text-[#777970]">₹</span>
            <span className="font-heading text-[46px] font-bold leading-none tracking-tight text-[#203A2B]">
              {plan.priceRupees.toLocaleString("en-IN")}
            </span>
            <span className="font-body text-[13px] mb-2 ml-0.5 text-[#A8B5A0]">/mo</span>
          </div>
          <p className="font-body text-[10px] text-[#A8B5A0]">
            Billed monthly · Cancel anytime
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E6DFD5]" />

        {/* Access chips */}
        <AccessChips plan={plan} />

        {/* Benefits list */}
        <ul className="flex flex-col gap-2.5 flex-1">
          {plan.benefits.slice(0, 5).map((b) => (
            <li key={b} className="flex items-start gap-2.5">
              <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 bg-[#203A2B]/10">
                <Check size={9} strokeWidth={3} className="text-[#203A2B]" />
              </div>
              <span className="font-body text-[11.5px] leading-snug text-[#555]">
                {b}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/membership"
          className={`w-full flex items-center justify-center gap-2
            font-body text-[10px] font-black uppercase tracking-[0.2em] py-3.5
            transition-all duration-200 active:scale-[0.98] mt-auto
            ${isHighlighted
              ? "bg-[#203A2B] text-[#FFFCF7] hover:bg-[#2c5040] shadow-sm"
              : "border border-[#203A2B]/40 text-[#203A2B] hover:bg-[#203A2B] hover:text-[#FFFCF7]"
            }`}
        >
          <Zap size={11} strokeWidth={2} />
          {index === 0 ? "Start Free" : "Get Started"}
          <ArrowRight size={10} className="ml-0.5" />
        </Link>

      </div>
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────
export function MembershipSection({ plans }: { plans: MembershipPlan[] }) {
  if (plans.length === 0) return null;

  const sorted = [...plans]
    .filter((p) => p.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length === 0) return null;

  return (
    <section className="relative bg-[#FFFCF7] border-y border-[#E6DFD5] py-14 lg:py-20 overflow-hidden"
      aria-label="Membership plans">

      {/* Subtle dot grid texture */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" aria-hidden>
        <defs>
          <pattern id="ms-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="#203A2B" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ms-dots)" />
      </svg>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10 lg:mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-px bg-[#C6A66B]" />
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.35em] text-[#C6A66B]">
                Membership
              </p>
            </div>
            <h2 className="font-heading text-[34px] sm:text-[46px] font-bold text-[#242824] leading-[1.04] mb-2">
              Read More,<br className="hidden sm:block" /> Pay Less.
            </h2>
            <p className="font-body text-[13px] text-[#777970] max-w-sm leading-relaxed">
              Unlimited access to our curated eBook library.
              One flat monthly rate — cancel anytime.
            </p>
          </div>
          <Link
            href="/membership"
            className="group inline-flex items-center gap-2
              border border-[#203A2B]/35 text-[#203A2B]
              font-body text-[10px] font-bold uppercase tracking-[0.18em]
              px-5 py-3 hover:bg-[#203A2B] hover:text-[#FFFCF7]
              transition-all duration-200 shrink-0 self-start sm:self-auto"
          >
            Compare All Plans
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* ── Plan cards ─────────────────────────────────────────────── */}
        <div className={`grid gap-4 lg:gap-5 items-end
          ${sorted.length === 1 ? "grid-cols-1 max-w-sm"
          : sorted.length === 2 ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-3"}`}>
          {sorted.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
