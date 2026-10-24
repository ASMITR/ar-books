import { getStoreSettings } from "@/lib/firebase/firestore";
import { Mail, MessageSquare, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Asmit Rajaramkar for support, feedback, or inquiries.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const supportEmail = settings?.supportEmail ?? "support@arbooks.in";

  const inputCls = "w-full border border-[#E9E7E2] bg-[#FAF9F6] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-colors";

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E9E7E2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Get in Touch</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#080808]">Contact & Support</h1>
          <p className="font-body text-[#777777] mt-2 max-w-md">
            Questions, feedback, or purchase support — I&apos;m happy to help.
          </p>
        </div>
      </section>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

            {/* Left — Info */}
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#080808] mb-3">How Can I Help?</h2>
                <p className="font-body text-[#777777] leading-relaxed">
                  Whether you have a question about a purchase, need help downloading your eBook, or just want to share feedback — reach out and I&apos;ll get back to you as soon as possible.
                </p>
              </div>

              {/* Info cards */}
              <div className="flex flex-col gap-3">
                <div className="group bg-[#FAF9F6] border border-[#E9E7E2] p-5 flex gap-4 items-start hover:border-[#789185] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#789185]/10 border border-[#789185]/20 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-[#789185]" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-[#080808] mb-1">Email Support</p>
                    <a
                      href={`mailto:${supportEmail}`}
                      className="font-body text-[#789185] hover:text-[#080808] transition-colors text-sm"
                    >
                      {supportEmail}
                    </a>
                  </div>
                </div>

                <div className="group bg-[#FAF9F6] border border-[#E9E7E2] p-5 flex gap-4 items-start hover:border-[#789185] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#789185]/10 border border-[#789185]/20 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-[#789185]" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-[#080808] mb-1">Response Time</p>
                    <p className="font-body text-sm text-[#777777]">Typical response within 24–48 hours.</p>
                  </div>
                </div>

                <div className="group bg-[#FAF9F6] border border-[#E9E7E2] p-5 flex gap-4 items-start hover:border-[#789185] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#789185]/10 border border-[#789185]/20 flex items-center justify-center shrink-0">
                    <MessageSquare size={16} className="text-[#789185]" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-[#080808] mb-2">Common Questions</p>
                    <ul className="text-sm font-body text-[#777777] flex flex-col gap-1">
                      {["Download issues after purchase", "Refund and cancellation requests", "Account access problems", "Book content feedback"].map((q) => (
                        <li key={q} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#789185] shrink-0" />{q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Purchase tip */}
              <div className="bg-[#FFC928]/15 border border-[#FFC928]/40 p-5">
                <p className="font-heading text-base font-bold text-[#080808] mb-1">Purchase Support Tip</p>
                <p className="font-body text-sm text-[#555]">
                  Include your order number (e.g. <span className="font-medium">ARB-...</span>) in your message so I can assist you quickly.
                </p>
              </div>
            </div>

            {/* Right — Form */}
            <div className="bg-[#FAF9F6] border border-[#E9E7E2] p-7 sm:p-9">
              <h2 className="font-heading text-2xl font-bold text-[#080808] mb-6">Send a Message</h2>
              <form action={`mailto:${supportEmail}`} method="GET" className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Your Name</label>
                    <input name="name" required placeholder="Full name" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Email Address</label>
                    <input name="email" type="email" required placeholder="your@email.com" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Subject</label>
                  <input name="subject" required placeholder="e.g. Download issue with order ARB-..." className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Message</label>
                  <textarea name="body" required rows={5} placeholder="Describe your question or issue..." className={`${inputCls} resize-none`} />
                </div>
                <button
                  type="submit"
                  className="bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#789185] transition-colors"
                >
                  Send Message
                </button>
                <p className="text-xs text-[#777777] font-body">
                  This opens your email client. Or email directly:{" "}
                  <a href={`mailto:${supportEmail}`} className="text-[#789185] hover:text-[#080808] transition-colors">{supportEmail}</a>
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFC928] py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-body uppercase tracking-[0.2em] text-[#080808]/60 mb-2">While You&apos;re Here</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808]">Browse the book catalog.</h2>
          </div>
          <Link
            href="/books"
            className="shrink-0 inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#789185] transition-colors"
          >
            Explore My Books <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
