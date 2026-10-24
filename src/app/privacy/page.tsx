import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="bg-[#789185] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-bold text-white">Privacy Policy</h1>
          <p className="font-body text-white/70 mt-2">Last updated: January 2025</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-[#E9E7E2] p-8 flex flex-col gap-8 font-body text-[#777777] leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">1. Information We Collect</h2>
            <p>When you create an account or make a purchase, we collect your name, email address, and payment reference information. We do not store payment card details — all payments are processed securely by Razorpay.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">2. How We Use Your Information</h2>
            <p>We use your information to process orders, deliver purchased eBooks, send order confirmations, and provide customer support. We do not sell or share your personal information with third parties for marketing purposes.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">3. Data Storage</h2>
            <p>Your account data is stored securely using Firebase (Google Cloud). Purchased PDF files are stored in private cloud storage and are only accessible to verified purchasers.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">4. Cookies</h2>
            <p>We use a secure, HTTP-only session cookie to keep you signed in. We do not use third-party tracking cookies.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">5. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data by contacting us. Account deletion requests will be processed subject to applicable legal requirements.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">6. Contact</h2>
            <p>For privacy-related inquiries, please use the <a href="/contact" className="text-[#789185] underline">Contact page</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
