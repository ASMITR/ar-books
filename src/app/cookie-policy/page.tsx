import { PolicyLayout } from "@/components/shared/PolicyLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How AR Books uses cookies and similar technologies on this website.",
};

export default function CookiePolicyPage() {
  return (
    <PolicyLayout
      title="Cookie Policy"
      subtitle="This page explains how we use cookies and similar technologies, and what choices you have."
      lastUpdated="October 2026"
      effectiveDate="October 2026"
      relatedLinks={[
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Contact Us", href: "/contact" },
      ]}
      sections={[
        {
          title: "What Are Cookies?",
          content: (
            <p>
              Cookies are small text files placed on your device by a website when you visit it.
              They allow the website to remember your actions and preferences over a period of time,
              so you don&apos;t have to re-enter them every time you come back or browse between pages.
            </p>
          ),
        },
        {
          title: "How We Use Cookies",
          content: (
            <>
              <p>
                This website uses <strong>only strictly necessary cookies</strong>. We do not use advertising
                cookies, behavioural tracking cookies, or third-party analytics cookies that identify you
                personally.
              </p>
              <p className="mt-2">
                The only cookie we set is a <strong>session authentication cookie</strong> (named{" "}
                <code>session</code>) that is placed on your device when you sign in to your account. This cookie:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>Is <strong>strictly necessary</strong> for the website to function — without it, you cannot remain signed in.</li>
                <li>Is marked <code>HttpOnly</code> (not accessible to JavaScript) and <code>Secure</code> (transmitted only over HTTPS).</li>
                <li>Contains a cryptographically signed session token — it does not contain your password, payment details, or any sensitive personal data.</li>
                <li>Expires automatically after 7 days, or immediately when you sign out.</li>
                <li>Is set only after you actively choose to sign in — it is not placed on your device if you browse as a guest.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Third-Party Cookies",
          content: (
            <>
              <p>
                We do <strong>not</strong> use any third-party cookies for advertising or analytics. However, the
                following third-party services may set their own cookies in limited circumstances:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>
                  <strong>Razorpay:</strong> When you proceed to payment, the Razorpay checkout modal loads from
                  Razorpay&apos;s servers. Razorpay may set cookies necessary for the payment session. These are
                  governed by{" "}
                  <a
                    href="https://razorpay.com/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#203A2B] underline"
                  >
                    Razorpay&apos;s Privacy Policy
                  </a>
                  .
                </li>
                <li>
                  <strong>Google / Firebase Authentication:</strong> When you use &quot;Continue with Google&quot;,
                  Google&apos;s sign-in flow may set cookies governed by{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#203A2B] underline"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </li>
              </ul>
              <p className="mt-2">
                These third-party cookies are only activated when you actively choose to use their respective
                features (payment, Google sign-in). We do not control these cookies.
              </p>
            </>
          ),
        },
        {
          title: "Do We Use Analytics Cookies?",
          content: (
            <p>
              <strong>No.</strong> We do not use Google Analytics, Facebook Pixel, Hotjar, Mixpanel, or any
              other analytics or behavioural tracking tool that places cookies on your device. Aggregate,
              non-identifying server-side access logs may be retained by our hosting provider (Vercel) for
              infrastructure and security purposes, but this does not involve cookies on your device.
            </p>
          ),
        },
        {
          title: "Cookie Consent",
          content: (
            <>
              <p>
                Because the only cookie we set is strictly necessary for the operation of the website (user
                authentication), we are not required under applicable law to seek your prior consent before
                setting this cookie. You are informed of this use through this Cookie Policy and our{" "}
                <a href="/privacy" className="text-[#203A2B] underline">
                  Privacy Policy
                </a>
                .
              </p>
              <p className="mt-2">
                If you do not wish to accept this cookie, you can choose not to sign in to an account, in
                which case no session cookie will be set. You can browse the website and view book listings
                without signing in.
              </p>
            </>
          ),
        },
        {
          title: "Managing & Deleting Cookies",
          content: (
            <>
              <p>
                You can control and delete cookies through your browser settings. The following links explain
                how to manage cookies in popular browsers:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 mt-2">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#203A2B] underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#203A2B] underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#203A2B] underline"
                  >
                    Apple Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#203A2B] underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
              <p className="mt-2">
                Please note that deleting or blocking the session cookie will sign you out of your account and
                you will need to sign in again on your next visit.
              </p>
            </>
          ),
        },
        {
          title: "Changes to This Policy",
          content: (
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with
              an updated &quot;Last Updated&quot; date. We encourage you to review this page periodically.
            </p>
          ),
        },
        {
          title: "Contact",
          content: (
            <p>
              If you have any questions about our use of cookies, please contact us via the{" "}
              <a href="/contact" className="text-[#203A2B] underline">
                Contact page
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
