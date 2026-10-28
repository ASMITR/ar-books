"use client";

import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    label: "Purchasing",
    faqs: [
      {
        q: "How do I purchase an eBook?",
        a: "Browse the books catalog, click on a book you'd like to buy, and click 'Buy Now' or 'Add to Cart'. You'll need to be signed in to complete a purchase. Payments are processed securely via Razorpay.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit and debit cards, UPI, net banking, and wallets via Razorpay. All transactions are processed in Indian Rupees (INR).",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. We never store your card or bank details. All payment processing is handled exclusively by Razorpay, a PCI-DSS compliant payment gateway. We only receive a payment reference ID and status after your transaction.",
      },
      {
        q: "Will I receive a receipt or invoice?",
        a: "Yes. An order confirmation email is sent to your registered email address after every successful purchase. You can also view your order history in your account under My Orders.",
      },
      {
        q: "Can I purchase a book as a gift for someone else?",
        a: "Currently, purchases are tied to individual accounts. Each buyer must have their own account to access purchased eBooks. We do not support gift purchases at this time.",
      },
    ],
  },
  {
    label: "Downloads & Access",
    faqs: [
      {
        q: "How do I download my purchased eBook?",
        a: "After a successful payment, your eBook will appear in My Library (under your account). Sign in, go to My Library, and click the download button next to your book. A secure, time-limited download link will be generated.",
      },
      {
        q: "What format are the eBooks in?",
        a: "All eBooks are delivered as PDF files. PDFs can be read on any device using free software such as Adobe Acrobat Reader, Apple Books, Google Drive, or any modern web browser.",
      },
      {
        q: "How long do I have access to my purchased eBooks?",
        a: "Your purchased eBooks remain in your library indefinitely as long as your account is active and in good standing. There is no expiry on access to purchased titles.",
      },
      {
        q: "Can I re-download a book I've already downloaded?",
        a: "Yes. You can re-download any purchased eBook at any time from My Library. There is no limit on the number of times you can download a title you've purchased.",
      },
      {
        q: "My eBook hasn't appeared after payment. What should I do?",
        a: "In most cases, your eBook will appear within a few minutes of payment. If it hasn't appeared after 15 minutes, please contact us via the Contact page with your order number (ARB-...) and we'll resolve it promptly.",
      },
      {
        q: "Can I read my eBook offline?",
        a: "Yes. Once you download the PDF to your device, you can read it offline using any PDF reader app without an internet connection.",
      },
    ],
  },
  {
    label: "Account & Security",
    faqs: [
      {
        q: "How do I create an account?",
        a: "Click 'Register' in the top navigation. You can sign up with your email and a password, or use Google Sign-In for a faster experience.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "Click 'Sign In', then 'Forgot Password'. Enter your registered email address and we'll send you a password reset link. Check your spam folder if you don't see it within a few minutes.",
      },
      {
        q: "How do I update my account details?",
        a: "Sign in and go to My Account → Profile to update your display name. To change your email or password, go to My Account → Security.",
      },
      {
        q: "Can I share my account with someone else?",
        a: "No. Each account is for individual use only. Sharing your account credentials is a violation of our Terms & Conditions and may result in account suspension.",
      },
      {
        q: "How do I delete my account?",
        a: "To request account deletion, contact us via the Contact page. Please note that order and transaction records may be retained for up to 7 years for legal and tax compliance purposes, even after account deletion.",
      },
      {
        q: "Is my account data secure?",
        a: "Yes. Your account data is stored in Google Firebase infrastructure. Passwords are never stored in plain text — authentication uses industry-standard hashing. All data is transmitted over HTTPS/TLS encryption.",
      },
    ],
  },
  {
    label: "Refunds & Cancellations",
    faqs: [
      {
        q: "Can I get a refund on a digital eBook?",
        a: "All sales of digital products are generally final. We only consider refunds in specific circumstances: if you were charged but didn't receive access due to a technical error on our end, if you were charged twice, or if the file is corrupted and we cannot provide a replacement. See our full Refund Policy for details.",
      },
      {
        q: "I accidentally purchased the wrong book. Can I get a refund?",
        a: "If you have not yet accessed or downloaded the file, contact us immediately via the Contact page. We will review such requests on a case-by-case basis. Once a file has been accessed, we are unable to issue a refund.",
      },
      {
        q: "How long does a refund take?",
        a: "Approved refunds are processed via Razorpay to your original payment method. Processing typically takes 5–10 business days depending on your bank.",
      },
      {
        q: "Can I cancel an order?",
        a: "Orders cannot be cancelled once payment has been processed and the eBook is available in your library. Contact us immediately if you believe you made a purchase in error and have not yet accessed the file.",
      },
    ],
  },
  {
    label: "Privacy & Data",
    faqs: [
      {
        q: "What personal data do you collect?",
        a: "We collect your name, email address, and order/payment reference information. We do not store payment card details. See our full Privacy Policy for a complete breakdown.",
      },
      {
        q: "Do you sell my personal data?",
        a: "No. We do not sell, rent, or share your personal information with third parties for marketing or advertising purposes.",
      },
      {
        q: "How can I request my data or have it deleted?",
        a: "Contact us via the Contact page to request a copy of your data or to request deletion. We will respond within 30 days. Note that transaction records may be retained for legal compliance purposes.",
      },
      {
        q: "Do you use tracking cookies?",
        a: "No. We only use a single secure session cookie to keep you signed in. We do not use third-party tracking, advertising, or analytics cookies that identify you personally.",
      },
    ],
  },
  {
    label: "Technical",
    faqs: [
      {
        q: "Which devices can I read the eBooks on?",
        a: "Any device that can open PDF files — smartphones, tablets, laptops, desktops, and e-readers. Free PDF readers are available for all platforms.",
      },
      {
        q: "The download link expired. What do I do?",
        a: "Download links are valid for 1 hour for security reasons. Simply go back to My Library and click the download button again to generate a fresh link.",
      },
      {
        q: "I'm having trouble signing in. What should I do?",
        a: "Try resetting your password via the 'Forgot Password' link on the Sign In page. If you signed up with Google, make sure you're using the 'Sign in with Google' option. If the issue persists, contact us.",
      },
      {
        q: "The website isn't loading correctly. What should I do?",
        a: "Try clearing your browser cache and cookies, or try a different browser. If the issue persists, contact us with details of the problem and your browser/device information.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E6DFD5] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
        aria-expanded={open}
      >
        <span className="font-body text-[13px] font-semibold text-[#242824] group-hover:text-[#203A2B] transition-colors leading-snug">
          {q}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 mt-0.5 text-[#A8B5A0] transition-transform duration-200 ${open ? "rotate-180 text-[#203A2B]" : ""}`}
        />
      </button>
      {open && (
        <p className="font-body text-[13px] text-[#666] leading-relaxed pb-4 pr-6">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FaqsPage() {
  const [active, setActive] = useState(0);

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
                  FAQs
                </h1>
                <p className="font-body text-[11px] text-[#A8B5A0] mt-1 tracking-wide">
                  Frequently asked questions
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">
                {categories.reduce((n, c) => n + c.faqs.length, 0)}
              </p>
              <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">Questions</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-10 items-start">

            {/* Category nav */}
            <aside className="lg:sticky lg:top-28 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none">
              {categories.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => setActive(i)}
                  className={`shrink-0 lg:shrink text-left px-4 py-2.5 rounded-sm font-body text-[12px] font-semibold transition-all duration-200 whitespace-nowrap lg:whitespace-normal
                    ${active === i
                      ? "bg-[#203A2B] text-[#FFFCF7]"
                      : "bg-[#FFFCF7] border border-[#E6DFD5] text-[#555] hover:border-[#203A2B]/40 hover:text-[#203A2B]"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </aside>

            {/* FAQ list */}
            <div className="flex flex-col gap-4">
              <div key={active} className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-6 py-2">
                <div className="flex items-center gap-2 py-4 border-b border-[#E6DFD5] mb-1">
                  <span className="w-1 h-5 rounded-full bg-[#203A2B]" />
                  <h2 className="font-heading text-[17px] font-bold text-[#242824]">
                    {categories[active].label}
                  </h2>
                  <span className="ml-auto text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">
                    {categories[active].faqs.length} questions
                  </span>
                </div>
                {categories[active].faqs.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>

              {/* Still need help */}
              <div className="relative overflow-hidden bg-[#203A2B] rounded-sm px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#315B55] rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10">
                  <p className="font-heading text-[16px] font-bold text-[#FFFCF7] mb-0.5">Still have a question?</p>
                  <p className="font-body text-[12px] text-[#A8B5A0]">We typically respond within 24–48 hours.</p>
                </div>
                <Link
                  href="/contact"
                  className="relative z-10 shrink-0 inline-flex items-center gap-2 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-[#d4b77e] transition-colors rounded-sm"
                >
                  Contact Us <ArrowRight size={12} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
