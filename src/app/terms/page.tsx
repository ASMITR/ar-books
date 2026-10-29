import { PolicyLayout } from "@/components/shared/PolicyLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions governing your use of AR Books and purchase of digital products.",
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using this website or making a purchase."
      lastUpdated="October 2026"
      effectiveDate="January 2025"
      relatedLinks={[
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookie-policy" },
        { label: "Refund Policy", href: "/refund-policy" },
        { label: "Download Policy", href: "/download-policy" },
        { label: "Contact Us", href: "/contact" },
      ]}
      sections={[
        {
          title: "Acceptance of Terms",
          content: (
            <p>By accessing or using this website (<strong>arbooks.in</strong> or any associated domain), creating an account, or purchasing any product, you agree to be legally bound by these Terms & Conditions in their entirety. If you do not agree with any part of these terms, you must immediately discontinue use of this website. These terms apply to all visitors, users, and customers.</p>
          ),
        },
        {
          title: "Digital Products — Nature of Sale",
          content: (
            <>
              <p>All products sold on this website are digital eBooks delivered in PDF format. No physical goods are shipped at any time. By completing a purchase, you explicitly acknowledge and agree that:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>You are purchasing a digital product that is delivered electronically.</li>
                <li>Digital products cannot be physically returned.</li>
                <li>Delivery is considered complete once the eBook is made available in your account library, regardless of whether you have downloaded it.</li>
                <li>You have verified that your device supports PDF files before purchasing.</li>
              </ul>
            </>
          ),
        },
        {
          title: "License Grant & Restrictions",
          content: (
            <>
              <p>Upon verified payment, you are granted a <strong>personal, non-exclusive, non-transferable, revocable licence</strong> to access and read the purchased eBook for your own private, non-commercial use only.</p>
              <p className="mt-2">You expressly agree that you will <strong>not</strong>:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Copy, reproduce, duplicate, or create derivative works from any part of the eBook.</li>
                <li>Distribute, share, upload, or transmit the eBook to any third party by any means.</li>
                <li>Sell, resell, sublicense, rent, or lend the eBook.</li>
                <li>Remove, alter, or obscure any copyright, watermark, or proprietary notices.</li>
                <li>Use the content for commercial purposes, training AI/ML models, or any automated data extraction.</li>
                <li>Share your account credentials to allow others to access purchased content.</li>
              </ul>
              <p className="mt-2">Violation of this licence will result in immediate termination of your access and may result in legal action.</p>
            </>
          ),
        },
        {
          title: "Payments & Pricing",
          content: (
            <>
              <p>All transactions are processed in Indian Rupees (INR) via Razorpay, a PCI-DSS compliant payment gateway. By making a payment, you also agree to Razorpay's terms of service.</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Prices displayed are inclusive of applicable taxes unless explicitly stated otherwise.</li>
                <li>We reserve the right to change prices at any time without prior notice. Price changes do not affect orders already completed.</li>
                <li>We are not responsible for any additional charges imposed by your bank, card issuer, or payment provider.</li>
                <li>In the event of a pricing error, we reserve the right to cancel the order and issue a full refund.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Account Responsibility",
          content: (
            <>
              <p>You are solely responsible for:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Maintaining the confidentiality and security of your account credentials.</li>
                <li>All activity that occurs under your account, whether authorised by you or not.</li>
                <li>Notifying us immediately of any suspected unauthorised access to your account.</li>
                <li>Ensuring that all information you provide is accurate, current, and complete.</li>
              </ul>
              <p className="mt-2">We are not liable for any loss or damage arising from your failure to comply with these obligations. Each purchase is tied to your individual account and is non-transferable.</p>
            </>
          ),
        },
        {
          title: "Intellectual Property",
          content: (
            <>
              <p>All content on this website — including but not limited to book text, cover designs, graphics, logos, website layout, and written content — is the exclusive intellectual property of <strong>Asmit Rajaramkar</strong> and is protected by applicable copyright, trademark, and intellectual property laws.</p>
              <p className="mt-2">Nothing in these terms grants you any right, title, or interest in any intellectual property owned by us. Unauthorised use, reproduction, or distribution of any content is strictly prohibited and may result in civil and/or criminal liability.</p>
            </>
          ),
        },
        {
          title: "Disclaimer of Warranties",
          content: (
            <>
              <p>This website and all products are provided on an <strong>"as is" and "as available"</strong> basis without any warranties of any kind, either express or implied, including but not limited to:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Warranties of merchantability or fitness for a particular purpose.</li>
                <li>Warranties that the website will be uninterrupted, error-free, or free of viruses.</li>
                <li>Warranties regarding the accuracy, completeness, or reliability of any content.</li>
              </ul>
              <p className="mt-2">The information and content in our eBooks is provided for general informational and educational purposes only. It does not constitute professional advice (financial, legal, medical, or otherwise). You should seek independent professional advice before acting on any information contained in our products.</p>
            </>
          ),
        },
        {
          title: "Limitation of Liability",
          content: (
            <>
              <p>To the maximum extent permitted by applicable law, <strong>Asmit Rajaramkar and AR Books shall not be liable</strong> for any:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Indirect, incidental, special, consequential, or punitive damages.</li>
                <li>Loss of profits, revenue, data, goodwill, or business opportunities.</li>
                <li>Damages arising from unauthorised access to or alteration of your data.</li>
                <li>Damages arising from reliance on information or content in our products.</li>
                <li>Damages caused by third-party services, including payment processors, hosting providers, or email services.</li>
                <li>Damages resulting from events beyond our reasonable control (force majeure), including natural disasters, cyberattacks, government actions, or infrastructure failures.</li>
              </ul>
              <p className="mt-2">Our total aggregate liability to you for any claim arising out of or relating to these terms or your use of this website shall not exceed the total amount you paid to us in the 12 months preceding the claim.</p>
            </>
          ),
        },
        {
          title: "Indemnification",
          content: (
            <p>You agree to indemnify, defend, and hold harmless Asmit Rajaramkar, AR Books, and any associated parties from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of this website; (b) your violation of these Terms; (c) your violation of any third-party rights, including intellectual property rights; or (d) any content you submit or transmit through the website.</p>
          ),
        },
        {
          title: "Termination",
          content: (
            <p>We reserve the right to suspend or terminate your account and access to all purchased content at our sole discretion, without notice, if we determine that you have violated these Terms, engaged in fraudulent activity, or acted in a manner harmful to other users or to us. Upon termination for cause, no refund will be issued. Provisions of these Terms that by their nature should survive termination shall survive, including intellectual property rights, disclaimers, and limitations of liability.</p>
          ),
        },
        {
          title: "Business Information",
          content: (
            <>
              <p>This website is owned and operated by an individual publisher:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li><strong>Name:</strong> Asmit Rajaramkar</li>
                <li><strong>Trading as:</strong> AR Books</li>
                <li><strong>Country:</strong> India</li>
                <li><strong>Contact:</strong> <a href="/contact" className="text-[#203A2B] underline">Contact page</a> or support@arbooks.in</li>
              </ul>
              <p className="mt-2">
                For any legal notices or formal correspondence, please use the contact email above. We will
                acknowledge formal correspondence within 5 business days.
              </p>
            </>
          ),
        },
        {
          title: "Governing Law & Dispute Resolution",
          content: (
            <>
              <p>These Terms & Conditions are governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.</p>
              <p className="mt-2">Before initiating any legal proceedings, you agree to first attempt to resolve any dispute informally by contacting us via the <a href="/contact" className="text-[#203A2B] underline">Contact page</a>. We will make reasonable efforts to resolve disputes amicably within 30 days.</p>
            </>
          ),
        },
        {
          title: "Changes to Terms",
          content: (
            <p>We reserve the right to modify these Terms & Conditions at any time. Updated terms will be posted on this page with a revised "Last Updated" date. Your continued use of the website after any modifications constitutes your acceptance of the updated terms. It is your responsibility to review these terms periodically.</p>
          ),
        },
      ]}
    />
  );
}
