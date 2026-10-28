import { PolicyLayout } from "@/components/shared/PolicyLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AR Books collects, uses, stores, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How we collect, use, store, and protect your personal information."
      lastUpdated="January 2025"
      effectiveDate="January 2025"
      relatedLinks={[
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Download Policy", href: "/download-policy" },
        { label: "Contact Us", href: "/contact" },
      ]}
      sections={[
        {
          title: "Information We Collect",
          content: (
            <>
              <p>When you create an account, make a purchase, or interact with this website, we may collect the following categories of personal information:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li><strong>Identity Data:</strong> Full name, username, or similar identifier.</li>
                <li><strong>Contact Data:</strong> Email address.</li>
                <li><strong>Transaction Data:</strong> Details of purchases, order numbers, and payment references. We do <strong>not</strong> store payment card numbers, CVVs, or full bank details — all payment processing is handled exclusively by Razorpay.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device type, operating system, and session identifiers collected automatically via server logs and cookies.</li>
                <li><strong>Usage Data:</strong> Pages visited, links clicked, download activity, and time spent on the website.</li>
                <li><strong>Account Data:</strong> Your account preferences, purchase history, and download entitlements.</li>
              </ul>
              <p className="mt-2">We do <strong>not</strong> collect sensitive personal data such as government IDs, financial account numbers, health information, or biometric data.</p>
            </>
          ),
        },
        {
          title: "How We Use Your Information",
          content: (
            <>
              <p>We use your personal information only for the following lawful purposes:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>To create and manage your account.</li>
                <li>To process and fulfil your orders and deliver purchased eBooks.</li>
                <li>To send transactional emails (order confirmations, download links, support responses).</li>
                <li>To provide customer support and resolve disputes.</li>
                <li>To detect, prevent, and investigate fraud, abuse, or security incidents.</li>
                <li>To comply with applicable legal obligations.</li>
                <li>To improve website functionality and user experience (using aggregated, anonymised data).</li>
              </ul>
              <p className="mt-2">We do <strong>not</strong> sell, rent, trade, or share your personal information with third parties for marketing or advertising purposes.</p>
            </>
          ),
        },
        {
          title: "Data Storage & Third-Party Services",
          content: (
            <>
              <p>Your data is stored and processed using the following trusted third-party infrastructure providers:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li><strong>Firebase / Google Cloud (Firestore & Storage):</strong> Account data, order records, and download entitlements are stored in Google Cloud infrastructure. PDF files are stored in private Firebase Storage buckets with no public access.</li>
                <li><strong>Razorpay:</strong> All payment processing is handled by Razorpay. We receive only a payment reference ID and status — never raw card or bank data.</li>
                <li><strong>Resend:</strong> Transactional emails are sent via Resend. Your email address is shared with Resend solely for the purpose of delivering emails you have requested.</li>
                <li><strong>Vercel:</strong> The website is hosted on Vercel. Server logs including IP addresses may be retained by Vercel per their own privacy policy.</li>
              </ul>
              <p className="mt-2">Each of these providers operates under their own privacy policies and data processing agreements. We encourage you to review their policies independently.</p>
            </>
          ),
        },
        {
          title: "Cookies & Session Data",
          content: (
            <>
              <p>We use a single, secure HTTP-only session cookie to keep you signed in to your account. This cookie:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Is set only after you sign in.</li>
                <li>Is marked <code>HttpOnly</code> (inaccessible to JavaScript) and <code>Secure</code> (transmitted only over HTTPS in production).</li>
                <li>Does not contain your password or payment information.</li>
                <li>Expires when you sign out or after a defined inactivity period.</li>
              </ul>
              <p className="mt-2">We do <strong>not</strong> use third-party tracking cookies, advertising cookies, or analytics cookies that identify you personally.</p>
            </>
          ),
        },
        {
          title: "Data Security Measures",
          content: (
            <>
              <p>We implement industry-standard technical and organisational security measures to protect your data, including:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>All data transmitted between your browser and our servers is encrypted using HTTPS/TLS.</li>
                <li>Passwords are never stored in plain text — authentication is managed by Firebase Authentication using industry-standard hashing.</li>
                <li>PDF files are stored in private cloud storage; download URLs are short-lived, server-generated signed URLs (valid for 1 hour) tied to your verified account.</li>
                <li>Admin access to the platform is restricted to accounts with server-side verified custom claims — no client-side privilege escalation is possible.</li>
                <li>All API routes that handle sensitive operations require server-side authentication verification.</li>
                <li>Payment signatures from Razorpay are cryptographically verified on the server before any order is fulfilled.</li>
                <li>Webhook payloads are verified using HMAC-SHA256 signatures before processing.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Limitation of Liability for Data Incidents",
          content: (
            <>
              <p>While we take all reasonable and commercially practicable steps to protect your personal data, <strong>no system connected to the internet can be guaranteed to be completely secure.</strong></p>
              <p>By using this website and providing your personal information, you acknowledge and agree that:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>We are not liable for any unauthorised access, data breach, data loss, or data theft that occurs despite our reasonable security measures, including incidents caused by third-party infrastructure providers (Firebase, Razorpay, Vercel, Resend), cyberattacks, zero-day vulnerabilities, or events beyond our reasonable control.</li>
                <li>We are not responsible for the security practices of third-party services linked from or integrated into this website.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials. We are not liable for any loss or damage arising from your failure to keep your password secure or from unauthorised use of your account.</li>
                <li>In the event of a data security incident that affects your personal data, we will make reasonable efforts to notify you in accordance with applicable law.</li>
              </ul>
              <p className="mt-2">Our total liability in connection with any data incident shall not exceed the amount you paid for purchases on this platform in the 12 months preceding the incident.</p>
            </>
          ),
        },
        {
          title: "Data Retention",
          content: (
            <>
              <p>We retain your personal data for as long as your account is active or as necessary to provide services, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Account data is retained until you request deletion.</li>
                <li>Order and transaction records may be retained for up to 7 years for tax and legal compliance purposes, even after account deletion.</li>
                <li>Server logs are retained for a limited period as determined by our hosting provider (Vercel).</li>
              </ul>
            </>
          ),
        },
        {
          title: "Your Rights",
          content: (
            <>
              <p>Subject to applicable law, you have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated personal data, subject to legal retention requirements.</li>
                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
                <li><strong>Objection:</strong> Object to processing of your data in certain circumstances.</li>
              </ul>
              <p className="mt-2">To exercise any of these rights, contact us via the <a href="/contact" className="text-[#203A2B] underline">Contact page</a>. We will respond within 30 days. We may require identity verification before processing your request.</p>
            </>
          ),
        },
        {
          title: "Children's Privacy",
          content: (
            <p>This website is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately and we will take steps to delete such information.</p>
          ),
        },
        {
          title: "Changes to This Policy",
          content: (
            <p>We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of the website after any changes constitutes your acceptance of the revised policy. We encourage you to review this page periodically.</p>
          ),
        },
        {
          title: "Contact & Grievance",
          content: (
            <p>For any privacy-related questions, data requests, or grievances, please contact us via the <a href="/contact" className="text-[#203A2B] underline">Contact page</a>. We are committed to resolving privacy concerns promptly and in good faith.</p>
          ),
        },
      ]}
    />
  );
}
