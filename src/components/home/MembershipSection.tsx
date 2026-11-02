import Link from "next/link";
import {
  ArrowRight, Check, BookOpen, Download, Zap,
  Shield, Star, Crown, Infinity,
} from "lucide-react";
import type { MembershipPlan } from "@/types/subscription";

// ─── Per-plan icon ─────────────────────────────────────────────────────────
function PlanIcon({ slug }: { slug: string }) {
  if (slug === "premium") return <Crown   size={16} className="text-[#C6A66B]" strokeWidth={1.6} />;
  if (slug === "plus")    return <Star    size={16} className="text-[#C6A66B]" strokeWidth={1.6} />;
  return                         <Zap     size={16} className="text-[#C6A66B]" strokeWidth={1.6} />;
}

// ─── Tier access chips ──────────────────────────────────────────────────────
function AccessChips({ plan, highlighted }: { plan: MembershipPlan; highlighted: boolean }) {
  const chip = `inline-flex items-center gap-1.5 font-body text-[9px] font-bold uppercase tracking-[0.13em] px-2.5 py-1 border`;
  const light = `${chip} border-[#203A2B]/18 bg-[#203A2B]/6 text-[#315B55]`;
  const dark  = `${chip} border-[#2E5040]    bg-[#C6A66B]/8  text-[#C6A66B]`;
  const cls   = highlighted ? light : dark;

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
        ? "bg-[#FFFCF7] border-2 border-[#C6A66B] shadow-[0_12px_48px_rgba(198,166,107,0.22)] -translate-y-1 lg:-translate-y-2"
        : "bg-[#FFFCF7]/[0.06] border border-[#2E5040] hover:border-[#C6A66B]/50 hover:bg-[#FFFCF7]/[0.09] hover:shadow-[0_8px_32px_rgba(198,166,107,0.10)]"
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
            <div className={`w-8 h-8 flex items-center justify-center shrink-0
              ${isHighlighted ? "bg-[#203A2B]/8 border border-[#203A2B]/12" : "bg-[#C6A66B]/12 border border-[#C6A66B]/20"}`}>
              <PlanIcon slug={plan.slug} />
            </div>
            <span className={`font-body text-[10px] font-bold uppercase tracking-[0.2em]
              ${isHighlighted ? "text-[#203A2B]" : "text-[#C6A66B]"}`}>
              {plan.name}
            </span>
          </div>
          <span className={`font-body text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 border
            ${isHighlighted
              ? "border-[#E6DFD5] bg-[#F5EFE6] text-[#777970]"
              : "border-[#2E5040] bg-[#152A1C] text-[#A8B5A0]"}`}>
            {plan.billingPeriod}
          </span>
        </div>

        {/* Price */}
        <div>
          <div className="flex items-end gap-1">
            <span className={`font-heading text-[13px] font-bold leading-none mb-2
              ${isHighlighted ? "text-[#777970]" : "text-[#A8B5A0]/70"}`}>₹</span>
            <span className={`font-heading text-[46px] font-bold leading-none tracking-tight
              ${isHighlighted ? "text-[#203A2B]" : "text-[#FFFCF7]"}`}>
              {plan.priceRupees.toLocaleString("en-IN")}
            </span>
            <span className={`font-body text-[13px] mb-2 ml-0.5
              ${isHighlighted ? "text-[#A8B5A0]" : "text-[#A8B5A0]/60"}`}>/mo</span>
          </div>
          <p className={`font-body text-[10px] ${isHighlighted ? "text-[#A8B5A0]" : "text-[#A8B5A0]/55"}`}>
            Billed monthly · Cancel anytime
          </p>
        </div>

        {/* Divider */}
        <div className={`h-px ${isHighlighted ? "bg-[#E6DFD5]" : "bg-[#2E5040]"}`} />

        {/* Access chips */}
        <AccessChips plan={plan} highlighted={isHighlighted} />

        {/* Benefits list */}
        <ul className="flex flex-col gap-2.5 flex-1">
          {plan.benefits.slice(0, 5).map((b) => (
            <li key={b} className="flex items-start gap-2.5">
              <div className={`w-4 h-4 flex items-center justify-center shrink-0 mt-0.5
                ${isHighlighted ? "bg-[#203A2B]/10" : "bg-[#C6A66B]/12"}`}>
                <Check size={9} strokeWidth={3}
                  className={isHighlighted ? "text-[#203A2B]" : "text-[#C6A66B]"} />
              </div>
              <span className={`font-body text-[11.5px] leading-snug
                ${isHighlighted ? "text-[#555]" : "text-[#A8B5A0]"}`}>
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
              : "border border-[#C6A66B]/50 text-[#C6A66B] hover:bg-[#C6A66B] hover:text-[#1C3325]"
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

// ─── Feature comparison table (desktop only) ────────────────────────────────
function ComparisonTable({ plans }: { plans: MembershipPlan[] }) {
  if (plans.length < 2) return null;

  const rows: { label: string; key: keyof MembershipPlan | null; fn?: (p: MembershipPlan) => boolean }[] = [
    { label: "Online Reading",       key: "canReadOnline" },
    { label: "PDF Downloads",        key: "canDownload" },
    { label: "Starter Library",      key: "includesStarter" },
    { label: "Plus Library",         key: "includesPlus" },
    { label: "Premium Library",      key: "includesPremium" },
    { label: "Exclusive Collections",key: "includesExclusive" },
    { label: "Early Access",         key: "includesLatestReleases" },
    { label: "Unlimited Downloads",  key: null, fn: (p) => p.canDownload && !p.downloadLimit },
  ];

  return (
    <div className="hidden lg:block mt-12 overflow-hidden border border-[#2E5040]">
      <div className="bg-[#152A1C] px-6 py-3 border-b border-[#2E5040]">
        <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-[#A8B5A0]">
          Feature Comparison
        </p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2E5040]">
            <th className="text-left px-6 py-3 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-[#A8B5A0]/60 w-1/2" />
            {plans.map((plan) => (
              <th key={plan.id}
                className={`px-4 py-3 text-center font-body text-[10px] font-bold uppercase tracking-[0.14em]
                  ${plan.highlighted ? "text-[#C6A66B]" : "text-[#A8B5A0]"}`}>
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2E5040]/60">
          {rows.map(({ label, key, fn }) => (
            <tr key={label} className="hover:bg-[#FFFCF7]/[0.03] transition-colors">
              <td className="px-6 py-3 font-body text-[11px] text-[#A8B5A0]">{label}</td>
              {plans.map((plan) => {
                const val = fn ? fn(plan) : key ? Boolean(plan[key]) : false;
                return (
                  <td key={plan.id} className="px-4 py-3 text-center">
                    {val
                      ? <div className="inline-flex items-center justify-center w-5 h-5 bg-[#C6A66B]/15 mx-auto">
                          <Check size={10} className="text-[#C6A66B]" strokeWidth={2.5} />
                        </div>
                      : <div className="w-3 h-px bg-[#2E5040] mx-auto" />
                    }
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Trust chips row ────────────────────────────────────────────────────────
function TrustRow() {
  const items = [
    { Icon: Shield,   text: "Cancel anytime, no lock-in" },
    { Icon: Infinity, text: "Access entire library"       },
    { Icon: Download, text: "Download & read offline"     },
    { Icon: Zap,      text: "Instant activation"          },
  ];
  return (
    <div className="mt-10 pt-8 border-t border-[#2E5040]/60
      grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map(({ Icon, text }) => (
        <div key={text} className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#C6A66B]/10 border border-[#C6A66B]/20 flex items-center justify-center shrink-0">
            <Icon size={13} className="text-[#C6A66B]" strokeWidth={1.6} />
          </div>
          <span className="font-body text-[11px] text-[#A8B5A0] leading-snug">{text}</span>
        </div>
      ))}
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
    <section className="relative bg-[#1C3325] py-14 lg:py-20 overflow-hidden"
      aria-label="Membership plans">

      {/* Dot-grid texture */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.055]" aria-hidden>
        <defs>
          <pattern id="ms-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="#A8B5A0" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ms-dots)" />
      </svg>

      {/* Gold radial glow */}
      <div className="absolute right-0 bottom-0 w-[700px] h-[700px] pointer-events-none"
        style={{ background: "radial-gradient(circle at 80% 90%, rgba(198,166,107,0.09) 0%, transparent 60%)" }} />
      <div className="absolute left-0 top-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(circle at 20% 10%, rgba(32,58,43,0.5) 0%, transparent 55%)" }} />

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
            <h2 className="font-heading text-[34px] sm:text-[46px] font-bold text-[#FFFCF7] leading-[1.04] mb-2">
              Read More,<br className="hidden sm:block" /> Pay Less.
            </h2>
            <p className="font-body text-[13px] text-[#A8B5A0] max-w-sm leading-relaxed">
              Unlimited access to our curated eBook library.
              One flat monthly rate — cancel anytime.
            </p>
          </div>
          <Link
            href="/membership"
            className="group inline-flex items-center gap-2
              border border-[#C6A66B]/40 text-[#C6A66B]
              font-body text-[10px] font-bold uppercase tracking-[0.18em]
              px-5 py-3 hover:bg-[#C6A66B] hover:text-[#1C3325]
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

        {/* ── Feature comparison (desktop) ───────────────────────────── */}
        <ComparisonTable plans={sorted} />

        {/* ── Trust row ──────────────────────────────────────────────── */}
        <TrustRow />

        {/* ── Bottom footnote ────────────────────────────────────────── */}
        <p className="text-center font-body text-[10px] text-[#A8B5A0]/50 mt-8 leading-relaxed">
          Individual eBook purchases remain available separately. No membership required to buy books.
        </p>

      </div>
    </section>
  );
}
