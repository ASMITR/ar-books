import { getStoreSettings } from "@/lib/firebase/firestore";
import { Mail, Clock, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Asmit Rajaramkar for support, feedback, or inquiries.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const supportEmail = settings?.supportEmail ?? "support@arbooks.in";

  const inputCls =
    "w-full border border-[#E6DFD5] bg-[#FFFCF7] px-3.5 py-2.5 text-[13px] font-body text-[#242824] placeholder:text-[#A8B5A0] focus:outline-none focus:border-[#203A2B] focus:ring-2 focus:ring-[#203A2B]/10 transition-colors rounded-sm";

  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1 h-7 rounded-full bg-[#203A2B]" />
              <div>
                <h1 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#242824] leading-none">
                  Contact
                </h1>
                <p className="font-body text-[11px] text-[#A8B5A0] mt-1 tracking-wide">
                  Questions, feedback, or purchase support
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 lg:gap-10 items-start">

            {/* ── Form ────────────────────────────────────────────────────── */}
            <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-6 sm:px-8 py-8">
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1 h-5 rounded-full bg-[#203A2B]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">Send a Message</p>
                </div>
                <h2 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#242824] leading-tight">
                  How can I help you?
                </h2>
                <p className="font-body text-[13px] text-[#777] mt-1.5 leading-relaxed">
                  Whether it&apos;s a purchase issue, download problem, or just feedback — I&apos;ll get back to you within 24–48 hours.
                </p>
              </div>

              <form action={`mailto:${supportEmail}`} method="GET" className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-[10px] font-body font-bold uppercase tracking-[0.12em] text-[#A8B5A0] mb-1.5">
                      Your Name
                    </label>
                    <input id="contact-name" name="name" required placeholder="Full name" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-[10px] font-body font-bold uppercase tracking-[0.12em] text-[#A8B5A0] mb-1.5">
                      Email Address
                    </label>
                    <input id="contact-email" name="email" type="email" required placeholder="your@email.com" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-[10px] font-body font-bold uppercase tracking-[0.12em] text-[#A8B5A0] mb-1.5">
                    Subject
                  </label>
                  <input id="contact-subject" name="subject" required placeholder="e.g. Download issue with order ARB-..." className={inputCls} />
                </div>

                <div>
                  <label htmlFor="contact-body" className="block text-[10px] font-body font-bold uppercase tracking-[0.12em] text-[#A8B5A0] mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="contact-body"
                    name="body"
                    required
                    rows={5}
                    placeholder="Describe your question or issue in detail..."
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3 hover:bg-[#315B55] active:scale-[0.98] transition-all rounded-sm"
                >
                  Send Message <ArrowRight size={13} />
                </button>

                <p className="text-[11px] font-body text-[#A8B5A0]">
                  This opens your email client. Or write directly to{" "}
                  <a href={`mailto:${supportEmail}`} className="text-[#203A2B] hover:underline">
                    {supportEmail}
                  </a>
                </p>
              </form>
            </div>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-28">

              {/* Email */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-5 flex gap-4 items-start hover:border-[#203A2B]/40 hover:shadow-sm transition-all duration-200">
                <div className="w-9 h-9 rounded-sm bg-[#203A2B]/8 border border-[#203A2B]/15 flex items-center justify-center shrink-0">
                  <Mail size={15} className="text-[#203A2B]" />
                </div>
                <div>
                  <p className="font-heading text-[13px] font-bold text-[#242824] mb-0.5">Email Support</p>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-body text-[12px] text-[#203A2B] hover:underline break-all"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>

              {/* Response time */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-5 flex gap-4 items-start hover:border-[#203A2B]/40 hover:shadow-sm transition-all duration-200">
                <div className="w-9 h-9 rounded-sm bg-[#203A2B]/8 border border-[#203A2B]/15 flex items-center justify-center shrink-0">
                  <Clock size={15} className="text-[#203A2B]" />
                </div>
                <div>
                  <p className="font-heading text-[13px] font-bold text-[#242824] mb-0.5">Response Time</p>
                  <p className="font-body text-[12px] text-[#777]">Typically within 24–48 hours.</p>
                </div>
              </div>

              {/* Common questions */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-5 flex gap-4 items-start hover:border-[#203A2B]/40 hover:shadow-sm transition-all duration-200">
                <div className="w-9 h-9 rounded-sm bg-[#203A2B]/8 border border-[#203A2B]/15 flex items-center justify-center shrink-0">
                  <MessageSquare size={15} className="text-[#203A2B]" />
                </div>
                <div>
                  <p className="font-heading text-[13px] font-bold text-[#242824] mb-2">Common Topics</p>
                  <ul className="flex flex-col gap-1.5">
                    {[
                      "Download issues after purchase",
                      "Refund & cancellation requests",
                      "Account access problems",
                      "Book content feedback",
                    ].map((q) => (
                      <li key={q} className="flex items-center gap-2 font-body text-[12px] text-[#777]">
                        <span className="w-1 h-1 rounded-full bg-[#C6A66B] shrink-0" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tip */}
              <div className="bg-[#203A2B]/6 border border-[#203A2B]/15 rounded-sm p-5">
                <p className="font-heading text-[13px] font-bold text-[#242824] mb-1">💡 Purchase Support Tip</p>
                <p className="font-body text-[12px] text-[#555] leading-relaxed">
                  Include your order number (e.g. <span className="font-semibold text-[#203A2B]">ARB-...</span>) so I can assist you faster.
                </p>
              </div>

            </aside>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-t border-[#E6DFD5] py-12 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-sm bg-[#203A2B] px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#315B55] rounded-full blur-3xl opacity-25 -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-px bg-[#C6A66B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">While You&apos;re Here</p>
              </div>
              <h2 className="font-heading text-[26px] sm:text-[32px] font-bold text-[#FFFCF7] leading-tight">
                Browse the book catalog.
              </h2>
            </div>
            <Link
              href="/books"
              className="relative z-10 shrink-0 inline-flex items-center gap-2.5 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-[#d4b77e] transition-colors rounded-sm"
            >
              Explore Books <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
