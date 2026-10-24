import type { Metadata } from "next";

export const metadata: Metadata = { title: "Digital Download Policy" };

export default function DownloadPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="bg-[#789185] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-bold text-white">Digital Download Policy</h1>
          <p className="font-body text-white/70 mt-2">Last updated: January 2025</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-[#E9E7E2] p-8 flex flex-col gap-8 font-body text-[#777777] leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">How Downloads Work</h2>
            <p>After your payment is verified, your purchased eBook is immediately available in your personal library at <a href="/account/library" className="text-[#789185] underline">My Library</a>. You can download it at any time by signing in to your account.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">File Format</h2>
            <p>All eBooks are delivered as PDF files. PDFs can be read on any device using a free PDF reader such as Adobe Acrobat Reader, Apple Books, Google Drive, or any modern browser.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">Download Access</h2>
            <p>Your purchased eBooks remain in your library as long as your account is active. You may re-download your purchases at any time from My Library or Download History. There is no expiry on your access to purchased titles.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">Security</h2>
            <p>Download links are generated securely on the server and are tied to your verified account. PDF files are stored in private cloud storage and are never publicly accessible. Each download request is authenticated and logged.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">Personal Use Only</h2>
            <p>Downloaded eBooks are licensed for your personal use only. Sharing, redistributing, or reselling downloaded files is strictly prohibited and constitutes a violation of copyright law.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-3">Download Issues</h2>
            <p>If you experience any issues downloading your eBook, please contact us via the <a href="/contact" className="text-[#789185] underline">Contact page</a> with your order number and we will assist you promptly.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
