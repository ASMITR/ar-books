import { getActiveMembershipPlans } from "@/lib/firebase/subscriptions";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { MembershipPricingCards } from "@/components/membership/MembershipPricingCards";
import { ArrowRight, BookOpen, Download, Shield, Zap, Check, X } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Plans — AR Books",
  description: "Join Asmit Rajaramkar Books membership and get unlimited access to handpicked eBooks for ₹199–₹599/month.",
};

export const revalidate = 300;

const FAQ = [
  {
    q: "What is an AR Books membership?",
    a: "A membership gives you monthly access to a curated library of eBooks by Asmit Rajaramkar. Depending on your plan, you can read online, download PDFs, and access exclusive collections.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your membership at any time from your account dashboard. Your access continues until the end of the paid billing period.",
  },
  {
    q: "What happens to my access after cancellation?",
    a: "You retain full membership access until your current billing period ends. After that, membership-only books will no longer be accessible. Books you individually purchased remain yours permanently.",
  },
  {
    q: "Can I still buy individual eBooks without a membership?",
    a: "Absolutely. Individual book purchases and membership are completely independent. You can do either, both, or switch between them at any time.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. You can change your plan at any time from your account dashboard. Upgrades take effect immediately; downgrades apply from the next billing cycle.",
  },
  {
    q: "How does billing work?",
    a: "Your membership is billed monthly on the same date each month via Razorpay's secure recurring payment system. You authorise the mandate once and renewals happen automatically.",
  },
  {
    q: "Are downloads permanent?",
    a: "Downloads are available while your membership is active. If your membership expires or is cancelled, membership-downloaded files remain on your device but new downloads require an active membership.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. Payments are processed entirely by Razorpay — we never store card details. All transactions use industry-standard SSL encryption.",
  },
];

export default async function MembershipPage() {
  const [plans, user] = await Promise.all([
    getActiveMembershipPlans(),
    getSessionUser(),
  ]);

  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#1C3325] relative overflow-hidden">
        {/* Dot grid texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]" aria-hidden>
          <defs>
            <pattern id="mem-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="#A8B5A0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mem-dots)" />
        </svg>
        {/* Gold top accent */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#C6A66B] to-transparent" />
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(198,166,107,0.12) 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <span className="w-8 h-px bg-[#C6A66B]" />
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.35em] text-[#C6A66B]">
              Membership Plans
            </p>
            <span className="w-8 h-px bg-[#C6A66B]" />
          </div>
          <h1 className="font-heading text-[38px] sm:text-[54px] lg:text-[62px] font-bold text-[#FFFCF7] leading-[1.04] mb-5">
            Choose Your<br />Reading Membership
          </h1>
          <p className="font-body text-[15px] sm:text-[17px] text-[#A8B5A0] leading-relaxed max-w-xl mx-auto mb-10">
            Discover more. Read more. Learn more.<br />
            One monthly membership, unlimited reading.
          </p>
          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { Icon: BookOpen,  text: "Curated eBook library" },
              { Icon: Download,  text: "PDF downloads"         },
              { Icon: Zap,       text: "Instant access"        },
              { Icon: Shield,    text: "Secure payments"       },
            ].map(({ Icon, text }) => (
              <span key={text}
                className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-[#FFFCF7]
                  font-body text-[11px] font-semibold px-4 py-2 rounded-full">
                <Icon size={12} className="text-[#C6A66B]" strokeWidth={2} />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing cards ─────────────────────────────────────────────────── */}
      <section className="py-14 lg:py-20 -mt-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <MembershipPricingCards plans={plans} isLoggedIn={!!user} />
        </div>
      </section>

      {/* ── Plan comparison table ──────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-y border-[#E6DFD5] py-14 lg:py-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-[28px] sm:text-[36px] font-bold text-[#242824]">Compare Plans</h2>
            <p className="font-body text-[13px] text-[#777970] mt-2">Everything you get with each membership tier.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px] font-body">
              <thead>
                <tr className="border-b-2 border-[#E6DFD5]">
                  <th className="text-left py-3 pr-4 font-body text-[11px] font-bold uppercase tracking-[0.15em] text-[#A8B5A0] w-1/2">Feature</th>
                  {["Starter", "Plus", "Premium"].map((name) => (
                    <th key={name} className="text-center py-3 px-3 font-heading text-[15px] font-bold text-[#242824]">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Monthly price",         "₹199", "₹399", "₹599"],
                  ["Read eBooks online",    true,   true,   true  ],
                  ["PDF downloads",         false,  true,   true  ],
                  ["Starter collection",    true,   true,   true  ],
                  ["Plus collection",       false,  true,   true  ],
                  ["Premium collection",    false,  false,  true  ],
                  ["Exclusive collections", false,  false,  true  ],
                  ["Early access releases", false,  true,   true  ],
                  ["Latest releases",       false,  true,   true  ],
                  ["Member library",        true,   true,   true  ],
                  ["Support",               "Standard", "Standard", "Priority"],
                ].map(([feature, starter, plus, premium], i) => (
                  <tr key={i} className={`border-b border-[#F0EDE8] ${i % 2 === 0 ? "" : "bg-[#FAF9F6]"}`}>
                    <td className="py-3 pr-4 text-[#555] font-medium">{feature as string}</td>
                    {[starter, plus, premium].map((val, j) => (
                      <td key={j} className="text-center py-3 px-3">
                        {typeof val === "boolean" ? (
                          val
                            ? <Check size={15} className="text-emerald-600 mx-auto" strokeWidth={2.5} />
                            : <X    size={14} className="text-[#C0BAB2] mx-auto" strokeWidth={2} />
                        ) : (
                          <span className={`font-semibold ${j === 1 ? "text-[#203A2B]" : "text-[#555]"}`}>{val as string}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Individual purchase CTA ───────────────────────────────────────── */}
      <section className="py-12 lg:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-7 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A66B] mb-1">Not ready to subscribe?</p>
              <h3 className="font-heading text-[20px] font-bold text-[#242824] mb-1">Buy individual eBooks instead</h3>
              <p className="font-body text-[13px] text-[#777970]">Purchase any eBook once and own it permanently — no membership required.</p>
            </div>
            <Link href="/books"
              className="shrink-0 inline-flex items-center gap-2 border-2 border-[#203A2B] text-[#203A2B] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-6 py-3 hover:bg-[#203A2B] hover:text-[#FFFCF7] transition-all duration-200 rounded-sm">
              Browse All eBooks <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-t border-[#E6DFD5] py-14 lg:py-20">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-[28px] sm:text-[36px] font-bold text-[#242824]">Frequently Asked Questions</h2>
          </div>
          <div className="flex flex-col divide-y divide-[#E6DFD5]">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-5">
                <p className="font-heading text-[16px] font-bold text-[#242824] mb-2">{q}</p>
                <p className="font-body text-[13px] text-[#777970] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Terms note ────────────────────────────────────────────────────── */}
      <section className="bg-[#F5EFE6] border-t border-[#E6DFD5] py-8">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-body text-[11px] text-[#A8B5A0] leading-relaxed">
            By subscribing you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#203A2B] transition-colors">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-[#203A2B] transition-colors">Privacy Policy</Link>.
            Memberships auto-renew monthly. Cancel anytime from your account dashboard before the renewal date.
            Refunds are subject to our{" "}
            <Link href="/refund-policy" className="underline hover:text-[#203A2B] transition-colors">Refund Policy</Link>.
          </p>
        </div>
      </section>

    </div>
  );
}
