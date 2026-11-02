import Link from "next/link";
import { ArrowRight, Check, Zap, BookOpen, Download } from "lucide-react";
import type { MembershipPlan } from "@/types/subscription";

interface Props {
  plans: MembershipPlan[];
}

export function MembershipSection({ plans }: Props) {
  if (plans.length === 0) return null;

  return (
    <section className="bg-[#1C3325] py-14 lg:py-20 relative overflow-hidden" aria-label="Membership plans">
      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" aria-hidden>
        <defs>
          <pattern id="ms-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="#A8B5A0" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ms-dots)" />
      </svg>
      {/* Gold radial */}
      <div className="absolute right-0 bottom-0 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle at 85% 85%, rgba(198,166,107,0.10) 0%, transparent 60%)" }} />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-px bg-[#C6A66B]" />
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.35em] text-[#C6A66B]">
                Membership
              </p>
            </div>
            <h2 className="font-heading text-[34px] sm:text-[44px] font-bold text-[#FFFCF7] leading-[1.04]">
              Read More,<br className="hidden sm:block" /> Pay Less
            </h2>
            <p className="font-body text-[13px] text-[#A8B5A0] mt-2 max-w-sm leading-relaxed">
              Monthly access to a curated eBook library. Cancel anytime.
            </p>
          </div>
          <Link
            href="/membership"
            className="group inline-flex items-center gap-2 border border-[#C6A66B]/40 text-[#C6A66B] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-3 hover:bg-[#C6A66B] hover:text-[#1C3325] transition-all duration-200 rounded-sm shrink-0 self-start sm:self-auto"
          >
            Compare All Plans
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-sm overflow-hidden transition-all duration-300
                ${plan.highlighted
                  ? "bg-[#FFFCF7] border-2 border-[#C6A66B] shadow-[0_8px_40px_rgba(198,166,107,0.20)]"
                  : "bg-[#FFFCF7]/[0.07] border border-[#2E5040] hover:border-[#C6A66B]/50 hover:bg-[#FFFCF7]/[0.10]"
                }`}
            >
              {plan.highlighted && (
                <div className="bg-[#C6A66B] text-[#1C3325] text-center font-body text-[9px] font-black uppercase tracking-[0.2em] py-1.5">
                  ✦ Most Popular
                </div>
              )}

              <div className={`px-5 pt-5 pb-4 ${plan.highlighted ? "" : "pt-5"}`}>
                <p className={`font-body text-[10px] font-bold uppercase tracking-[0.2em] mb-2
                  ${plan.highlighted ? "text-[#C6A66B]" : "text-[#A8B5A0]"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className={`font-heading text-[36px] font-bold leading-none
                    ${plan.highlighted ? "text-[#203A2B]" : "text-[#FFFCF7]"}`}>
                    ₹{plan.priceRupees}
                  </span>
                  <span className={`font-body text-[13px] mb-1 ${plan.highlighted ? "text-[#A8B5A0]" : "text-[#A8B5A0]/70"}`}>
                    /mo
                  </span>
                </div>
                <p className={`font-body text-[11px] mb-4 ${plan.highlighted ? "text-[#777970]" : "text-[#A8B5A0]/60"}`}>
                  Billed monthly · Cancel anytime
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {plan.canReadOnline && (
                    <span className={`inline-flex items-center gap-1 font-body text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-full
                      ${plan.highlighted ? "bg-[#203A2B]/8 text-[#203A2B]" : "bg-white/8 text-[#A8B5A0]"}`}>
                      <BookOpen size={9} /> Online Read
                    </span>
                  )}
                  {plan.canDownload && (
                    <span className={`inline-flex items-center gap-1 font-body text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-full
                      ${plan.highlighted ? "bg-[#203A2B]/8 text-[#203A2B]" : "bg-white/8 text-[#A8B5A0]"}`}>
                      <Download size={9} /> PDF Download
                    </span>
                  )}
                </div>

                {/* Top 3 benefits */}
                <ul className="flex flex-col gap-2 mb-5">
                  {plan.benefits.slice(0, 4).map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check size={11} className={`shrink-0 mt-0.5 ${plan.highlighted ? "text-emerald-600" : "text-[#C6A66B]"}`} strokeWidth={2.5} />
                      <span className={`font-body text-[11px] leading-snug
                        ${plan.highlighted ? "text-[#555]" : "text-[#A8B5A0]"}`}>{b}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/membership"
                  className={`w-full flex items-center justify-center gap-2 font-body text-[10.5px] font-black uppercase tracking-[0.18em] py-3 rounded-sm transition-all duration-200
                    ${plan.highlighted
                      ? "bg-[#203A2B] text-[#FFFCF7] hover:bg-[#2c5040] shadow-md"
                      : "border border-[#C6A66B]/40 text-[#C6A66B] hover:bg-[#C6A66B] hover:text-[#1C3325]"
                    }`}
                >
                  <Zap size={11} />
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center font-body text-[11px] text-[#A8B5A0]/60 mt-8">
          Individual eBook purchases remain available separately. No membership required.
        </p>
      </div>
    </section>
  );
}
