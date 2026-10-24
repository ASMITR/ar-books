import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="bg-[#789185] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-bold text-white">Refund & Cancellation Policy</h1>
          <p className="font-body text-white/70 mt-2">Last updated: January 2025</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-[#E9E7E2] p-8 flex flex-col gap-8 font-body text-[#777777] leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">Digital Product Policy</h2>
            <p>All sales of digital eBooks are generally final. Because digital products are delivered instantly upon verified payment and cannot be returned, we do not offer refunds except in the circumstances described below.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">Eligible Refund Circumstances</h2>
            <ul className="flex flex-col gap-2 list-disc list-inside">
              <li>You were charged but did not receive access to the purchased eBook due to a technical error on our end.</li>
              <li>You were charged twice for the same order.</li>
              <li>The delivered file is corrupted or unreadable and we are unable to provide a working replacement.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">How to Request a Refund</h2>
            <p>Contact us via the <a href="/contact" className="text-[#789185] underline">Contact page</a> within 7 days of your purchase. Include your order number and a description of the issue. We will review your request and respond within 3–5 business days.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">Cancellations</h2>
            <p>Orders cannot be cancelled once payment has been processed and the eBook has been made available for download. If you have not yet downloaded the file and believe you made a purchase in error, contact us immediately.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">Refund Processing</h2>
            <p>Approved refunds will be processed to the original payment method via Razorpay. Processing time is typically 5–10 business days depending on your bank.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
