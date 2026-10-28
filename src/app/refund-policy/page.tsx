import { PolicyLayout } from "@/components/shared/PolicyLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Our policy on refunds and cancellations for digital eBook purchases.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      subtitle="Please read this policy carefully before making a purchase. All sales of digital products are subject to the terms below."
      lastUpdated="January 2025"
      effectiveDate="January 2025"
      relatedLinks={[
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Download Policy", href: "/download-policy" },
        { label: "Contact Us", href: "/contact" },
      ]}
      sections={[
        {
          title: "General Policy — All Sales Final",
          content: (
            <>
              <p>All sales of digital eBooks on this website are <strong>generally final and non-refundable.</strong> Because digital products are:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Delivered instantly upon verified payment,</li>
                <li>Accessible immediately in your account library,</li>
                <li>Incapable of being physically returned,</li>
                <li>Susceptible to being copied or retained even after a refund,</li>
              </ul>
              <p className="mt-2">we do not offer refunds based on change of mind, dissatisfaction with content, accidental purchase after the file has been accessed, or failure to read the product description before purchasing.</p>
              <p className="mt-2">By completing a purchase, you explicitly acknowledge that you understand and accept this policy.</p>
            </>
          ),
        },
        {
          title: "Eligible Refund Circumstances",
          content: (
            <>
              <p>We will consider a refund request <strong>only</strong> in the following limited circumstances:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>You were charged but the eBook was <strong>not made available</strong> in your account library due to a verified technical error on our end, and we are unable to resolve the issue within 5 business days.</li>
                <li>You were <strong>charged twice</strong> for the same order (duplicate charge).</li>
                <li>The delivered PDF file is <strong>corrupted, unreadable, or materially incomplete</strong>, and we are unable to provide a working replacement within 5 business days.</li>
                <li>A payment was processed but the order was <strong>not fulfilled</strong> due to a system failure, and we cannot fulfil it.</li>
              </ul>
              <p className="mt-2">We reserve the right to determine, at our sole discretion, whether a refund request meets these criteria.</p>
            </>
          ),
        },
        {
          title: "Non-Eligible Refund Circumstances",
          content: (
            <>
              <p>Refunds will <strong>not</strong> be issued in the following circumstances:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Change of mind after purchase.</li>
                <li>Dissatisfaction with the content, style, or length of the eBook.</li>
                <li>Accidental purchase where the eBook has already been accessed or downloaded.</li>
                <li>Failure to read the product description, preview, or table of contents before purchasing.</li>
                <li>Incompatibility with your device (PDF readers are freely available for all devices).</li>
                <li>Requests made more than 7 days after the purchase date.</li>
                <li>Accounts found to be in violation of our Terms & Conditions.</li>
              </ul>
            </>
          ),
        },
        {
          title: "How to Request a Refund",
          content: (
            <>
              <p>To submit a refund request, contact us via the <a href="/contact" className="text-[#203A2B] underline">Contact page</a> within <strong>7 days</strong> of your purchase date. Your request must include:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Your registered email address.</li>
                <li>Your order number (format: <strong>ARB-...</strong>).</li>
                <li>A clear description of the issue with supporting evidence (e.g. screenshot of error).</li>
              </ul>
              <p className="mt-2">We will review your request and respond within <strong>3–5 business days</strong>. Incomplete requests may be rejected or delayed.</p>
            </>
          ),
        },
        {
          title: "Cancellations",
          content: (
            <p>Orders <strong>cannot be cancelled</strong> once payment has been processed and the eBook has been made available in your account library. If you believe you made a purchase in error and have <strong>not yet accessed or downloaded</strong> the file, contact us immediately via the <a href="/contact" className="text-[#203A2B] underline">Contact page</a>. We will review such requests on a case-by-case basis at our sole discretion.</p>
          ),
        },
        {
          title: "Refund Processing",
          content: (
            <>
              <p>Approved refunds will be processed to the <strong>original payment method</strong> via Razorpay. Please note:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Processing time is typically <strong>5–10 business days</strong> after approval, depending on your bank or card issuer.</li>
                <li>We are not responsible for delays caused by your bank or payment provider.</li>
                <li>Refunds will be issued in INR for the exact amount charged, excluding any bank fees or currency conversion charges applied by your provider.</li>
                <li>Upon issuing a refund, your access to the refunded eBook will be revoked immediately.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Chargebacks & Disputes",
          content: (
            <p>If you initiate a chargeback or payment dispute with your bank or card issuer without first contacting us, we reserve the right to: (a) contest the chargeback with evidence of delivery; (b) suspend or permanently terminate your account; and (c) pursue recovery of any amounts reversed through a chargeback. We strongly encourage you to contact us first — we are committed to resolving legitimate issues fairly and promptly.</p>
          ),
        },
        {
          title: "Limitation of Liability",
          content: (
            <p>Our liability in connection with any purchase is strictly limited to the amount paid for that specific order. We are not liable for any indirect, consequential, or incidental losses arising from a purchase or from our decision to approve or deny a refund request. This policy does not affect any statutory rights you may have under applicable consumer protection laws in India.</p>
          ),
        },
      ]}
    />
  );
}
