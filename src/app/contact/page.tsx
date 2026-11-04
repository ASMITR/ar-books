"use client";

import { useState } from "react";
import { Mail, Clock, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader, CtaBanner } from "@/components/shared/PageHeader";

export default function ContactPage() {
  const supportEmail = "support@arbooks.in";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), subject: fd.get("subject"), message: fd.get("body") }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  const inputCls = "w-full border border-[#E8E4DF] bg-white px-3.5 py-2.5 text-[13px] font-body text-[#222] placeholder:text-[#C0BBB3] focus:outline-none focus:border-[#203A2B] focus:ring-2 focus:ring-[#203A2B]/8 transition-colors rounded-xl";

  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      <PageHeader
        eyebrow="Get in Touch"
        title="Contact"
        subtitle="Questions, feedback, or purchase support"
      />

      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

            {/* Form */}
            <div className="bg-white border border-[#ECEAE5] rounded-2xl px-6 sm:px-8 py-8">
              <div className="mb-7">
                <h2 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#111] leading-tight">
                  How can I help you?
                </h2>
                <p className="font-body text-[13px] text-[#888] mt-1.5 leading-relaxed">
                  Whether it&apos;s a purchase issue, download problem, or just feedback — I&apos;ll get back to you within 24–48 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#B8B3AB] mb-1.5">Your Name</label>
                    <input id="contact-name" name="name" required placeholder="Full name" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#B8B3AB] mb-1.5">Email Address</label>
                    <input id="contact-email" name="email" type="email" required placeholder="your@email.com" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#B8B3AB] mb-1.5">Subject</label>
                  <input id="contact-subject" name="subject" required placeholder="e.g. Download issue with order ARB-..." className={inputCls} />
                </div>
                <div>
                  <label htmlFor="contact-body" className="block text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#B8B3AB] mb-1.5">Message</label>
                  <textarea id="contact-body" name="body" required rows={5} placeholder="Describe your question or issue in detail..." className={`${inputCls} resize-none`} />
                </div>

                <button type="submit" disabled={status === "sending" || status === "sent"}
                  className="inline-flex items-center justify-center gap-2 bg-[#0D1F17] text-white font-body text-[11.5px] font-bold uppercase tracking-[0.12em] px-6 py-3 rounded-xl hover:bg-[#203A2B] active:scale-[0.98] transition-all disabled:opacity-60">
                  {status === "sending" ? "Sending…" : status === "sent" ? "Message Sent ✓" : <>{" Send Message"} <ArrowRight size={13} /></>}
                </button>

                {status === "error" && (
                  <p className="text-[11px] font-body text-red-600">Something went wrong. Please email directly at{" "}
                    <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>.
                  </p>
                )}
                {status !== "error" && (
                  <p className="text-[11px] font-body text-[#B8B3AB]">
                    Or write directly to{" "}
                    <a href={`mailto:${supportEmail}`} className="text-[#203A2B] hover:underline">{supportEmail}</a>
                  </p>
                )}
              </form>
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-3 lg:sticky lg:top-28">
              {[
                { icon: Mail, title: "Email Support", content: <a href={`mailto:${supportEmail}`} className="font-body text-[12px] text-[#203A2B] hover:underline break-all">{supportEmail}</a> },
                { icon: Clock, title: "Response Time", content: <p className="font-body text-[12px] text-[#888]">Typically within 24–48 hours.</p> },
                { icon: MessageSquare, title: "Common Topics", content: (
                  <ul className="flex flex-col gap-1.5 mt-1">
                    {["Download issues after purchase", "Refund & cancellation requests", "Account access problems", "Book content feedback"].map((q) => (
                      <li key={q} className="flex items-center gap-2 font-body text-[12px] text-[#888]">
                        <span className="w-1 h-1 rounded-full bg-[#C6A66B] shrink-0" />{q}
                      </li>
                    ))}
                  </ul>
                )},
              ].map(({ icon: Icon, title, content }) => (
                <div key={title} className="bg-white border border-[#ECEAE5] rounded-2xl p-5 flex gap-4 items-start hover:border-[#203A2B]/20 hover:shadow-sm transition-all duration-200">
                  <div className="w-9 h-9 rounded-xl bg-[#0D1F17]/6 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#203A2B]" />
                  </div>
                  <div>
                    <p className="font-heading text-[13.5px] font-bold text-[#111] mb-1">{title}</p>
                    {content}
                  </div>
                </div>
              ))}

              <div className="bg-[#0D1F17]/5 border border-[#0D1F17]/10 rounded-2xl p-5">
                <p className="font-heading text-[13.5px] font-bold text-[#111] mb-1">💡 Purchase Support Tip</p>
                <p className="font-body text-[12px] text-[#666] leading-relaxed">
                  Include your order number (e.g. <span className="font-semibold text-[#203A2B]">ARB-...</span>) so I can assist you faster.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CtaBanner eyebrow="While You're Here" title="Browse the book catalog." href="/books" label="Explore Books →" />
    </div>
  );
}
