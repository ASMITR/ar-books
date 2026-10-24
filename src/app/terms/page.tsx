import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="bg-[#789185] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-bold text-white">Terms & Conditions</h1>
          <p className="font-body text-white/70 mt-2">Last updated: January 2025</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-[#E9E7E2] p-8 flex flex-col gap-8 font-body text-[#777777] leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">1. Digital Products</h2>
            <p>All products sold on this website are digital eBooks in PDF format. No physical goods are shipped. By purchasing, you acknowledge that you are buying a digital product.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">2. License</h2>
            <p>Upon verified payment, you receive a personal, non-transferable license to read the purchased eBook. You may not reproduce, distribute, resell, or share the content without written permission from the author.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">3. Payments</h2>
            <p>All payments are processed in Indian Rupees (INR) via Razorpay. Prices are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">4. Account Responsibility</h2>
            <p>You are responsible for maintaining the security of your account credentials. Do not share your account with others. Each purchase is tied to your individual account.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">5. Intellectual Property</h2>
            <p>All content, including book text, cover designs, and website content, is the intellectual property of Asmit Rajaramkar. Unauthorized use is prohibited.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">6. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">7. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
