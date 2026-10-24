import { getStoreSettings } from "@/lib/firebase/firestore";
import { Mail, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Asmit Rajaramkar for support, feedback, or inquiries.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const supportEmail = settings?.supportEmail ?? "support@arbooks.in";

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Header */}
      <div className="bg-[#789185] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-bold text-white">Contact & Support</h1>
          <p className="font-body text-white/70 mt-2">Get in touch — I&apos;m happy to help.</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-heading text-3xl font-bold text-[#080808] mb-4">How Can I Help?</h2>
              <p className="font-body text-[#777777] leading-relaxed">
                Whether you have a question about a purchase, need help downloading your eBook, or just want to share feedback — reach out and I&apos;ll get back to you as soon as possible.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white border border-[#E9E7E2] p-6 flex gap-4 items-start">
                <div className="bg-[#FAF9F6] p-3 shrink-0">
                  <Mail size={20} className="text-[#789185]" />
                </div>
                <div>
                  <p className="font-body font-semibold text-[#080808] mb-1">Email Support</p>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-body text-[#789185] hover:text-[#080808] transition-colors text-sm underline"
                  >
                    {supportEmail}
                  </a>
                  <p className="text-xs text-[#777777] mt-1">Typical response within 24–48 hours.</p>
                </div>
              </div>

              <div className="bg-white border border-[#E9E7E2] p-6 flex gap-4 items-start">
                <div className="bg-[#FAF9F6] p-3 shrink-0">
                  <MessageSquare size={20} className="text-[#789185]" />
                </div>
                <div>
                  <p className="font-body font-semibold text-[#080808] mb-1">Common Questions</p>
                  <ul className="text-sm font-body text-[#777777] flex flex-col gap-1 mt-1">
                    <li>• Download issues after purchase</li>
                    <li>• Refund and cancellation requests</li>
                    <li>• Account access problems</li>
                    <li>• Book content feedback</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#FFC928] p-6">
              <p className="font-heading text-xl font-bold text-[#080808] mb-2">Purchase Support</p>
              <p className="font-body text-sm text-[#080808]/70">
                If you have a payment or download issue, please include your order number in your message so I can assist you quickly.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white border border-[#E9E7E2] p-8">
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-6">Send a Message</h2>
            <form
              action={`mailto:${supportEmail}`}
              method="GET"
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">
                  Your Name
                </label>
                <input
                  name="name"
                  required
                  className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">
                  Subject
                </label>
                <input
                  name="subject"
                  required
                  className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                  placeholder="e.g. Download issue with order ARB-..."
                />
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">
                  Message
                </label>
                <textarea
                  name="body"
                  required
                  rows={5}
                  className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185] resize-none"
                  placeholder="Describe your question or issue..."
                />
              </div>
              <button
                type="submit"
                className="bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#789185] transition-colors"
              >
                Send Message
              </button>
              <p className="text-xs text-[#777777] font-body">
                This will open your email client. Alternatively, email directly to{" "}
                <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
