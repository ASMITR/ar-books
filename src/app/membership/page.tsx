import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, Sparkles, Shield, Zap, Bell } from "lucide-react";
import { NewsletterForm } from "@/components/home/NewsletterForm";

export const metadata: Metadata = {
  title: "Membership — Coming Soon | AR Books",
  description:
    "AR Books membership is coming soon. Unlimited access to handpicked eBooks — one monthly plan.",
};

const UPCOMING_FEATURES = [
  { Icon: BookOpen, title: "Curated eBook Library",   desc: "Unlimited access to handpicked titles across every genre." },
  { Icon: Download, title: "PDF Downloads",           desc: "Download and read offline on any device, anytime." },
  { Icon: Zap,      title: "Instant Access",          desc: "New books added regularly — always something fresh to read." },
  { Icon: Shield,   title: "Secure & Flexible",       desc: "Cancel anytime. No lock-ins, no hidden fees." },
];

export default function MembershipPage() {
  return (
    <div className="bg-[#FFFCF7] min-h-screen">

      {/* ── Top gold rule ─────────────────────────────────────────────────── */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-[#C6A66B]/70 to-transparent" />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">

        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(198,166,107,0.10) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <span className="w-6 h-px bg-[#C6A66B]" />
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#8B5E3C]">
              AR Books &nbsp;·&nbsp; Membership
            </p>
            <span className="w-6 h-px bg-[#C6A66B]" />
          </div>

          {/* Coming Soon badge */}
          <div className="inline-flex items-center gap-2 bg-[#203A2B]/8 border border-[#203A2B]/20 rounded-full px-4 py-2 mb-8">
            <Sparkles size={11} className="text-[#C6A66B]" />
            <span className="font-body text-[11px] font-semibold text-[#203A2B] uppercase tracking-[0.15em]">
              Coming Soon
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-[40px] sm:text-[54px] lg:text-[62px] font-bold text-[#242824] leading-[1.06] tracking-tight mb-6">
            One Membership.
            <br />
            <span className="italic" style={{ color: "#8B5E3C" }}>Unlimited Reading.</span>
          </h1>

          {/* Sparkle divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-12 bg-[#C6A66B]/40" />
            <Sparkles size={11} className="text-[#C6A66B]" />
            <span className="h-px w-12 bg-[#C6A66B]/40" />
          </div>

          {/* Subtext */}
          <p className="font-body text-[15px] sm:text-[16px] text-[#777970] leading-[1.85] max-w-[520px] mx-auto mb-10">
            We&apos;re putting the finishing touches on our membership programme —
            handpicked eBooks, PDF downloads, and exclusive collections, all for one
            simple monthly price.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/books"
              className="group inline-flex items-center gap-2.5 bg-[#203A2B] text-[#FFFCF7]
                font-body text-[11px] font-bold uppercase tracking-[0.16em]
                px-8 py-[15px] hover:bg-[#2a4d36] transition-colors duration-200
                shadow-md shadow-[#203A2B]/20"
            >
              Browse eBooks Now
              <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 font-body text-[11px] font-semibold
                text-[#203A2B] border border-[#203A2B]/35 px-7 py-[14px]
                hover:bg-[#203A2B] hover:text-[#FFFCF7] hover:border-[#203A2B]
                transition-all duration-200"
            >
              About the Author
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── What's coming ─────────────────────────────────────────────────── */}
      <section className="bg-[#F5EFE6] border-y border-[#E6DFD5] py-16 lg:py-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-[#A8B5A0] mb-3">
              What to Expect
            </p>
            <h2 className="font-heading text-[28px] sm:text-[36px] font-bold text-[#242824]">
              Everything in One Plan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E6DFD5]">
            {UPCOMING_FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-[#FFFCF7] px-7 py-8 flex flex-col gap-4">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(32,58,43,0.08)" }}
                >
                  <Icon size={18} strokeWidth={1.5} className="text-[#203A2B]" />
                </div>
                <div>
                  <p className="font-heading text-[15px] font-bold text-[#242824] mb-1.5">{title}</p>
                  <p className="font-body text-[12.5px] text-[#777970] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notify me ─────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="w-12 h-12 bg-[#203A2B]/8 rounded-full flex items-center justify-center mx-auto mb-5">
            <Bell size={20} strokeWidth={1.5} className="text-[#203A2B]" />
          </div>

          <h2 className="font-heading text-[26px] sm:text-[32px] font-bold text-[#242824] mb-3">
            Be the First to Know
          </h2>
          <p className="font-body text-[13px] text-[#777970] leading-relaxed mb-8">
            Subscribe to our newsletter and we&apos;ll notify you the moment membership launches —
            along with an exclusive early-bird offer.
          </p>

          <div className="bg-[#F5EFE6] border border-[#E6DFD5] p-6 sm:p-8">
            <NewsletterForm source="membership-waitlist" variant="banner" />
            <p className="font-body text-[10px] text-[#A8B5A0] mt-4 leading-relaxed">
              No spam, ever. Unsubscribe at any time. See our{" "}
              <Link href="/privacy" className="underline hover:text-[#203A2B] transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── Individual purchase CTA ───────────────────────────────────────── */}
      <section className="bg-[#F5EFE6] border-t border-[#E6DFD5] py-12 lg:py-14">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFFCF7] border border-[#E6DFD5] px-7 py-7
            flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A66B] mb-1">
                Available right now
              </p>
              <h3 className="font-heading text-[20px] font-bold text-[#242824] mb-1">
                Buy individual eBooks
              </h3>
              <p className="font-body text-[13px] text-[#777970]">
                Purchase any eBook once and own it permanently — no membership required.
              </p>
            </div>
            <Link
              href="/books"
              className="shrink-0 inline-flex items-center gap-2 border-2 border-[#203A2B]
                text-[#203A2B] font-body text-[11px] font-bold uppercase tracking-[0.15em]
                px-6 py-3 hover:bg-[#203A2B] hover:text-[#FFFCF7] transition-all duration-200"
            >
              Browse All eBooks <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
