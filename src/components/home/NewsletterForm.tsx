"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

type NewsletterFormProps = {
  source: "homepage" | "footer";
  variant?: "banner" | "footer";
};

export function NewsletterForm({
  source,
  variant = "footer",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const isBanner = variant === "banner";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, source }),
      });
      const result = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to subscribe right now.");
      }

      setEmail("");
      setConsent(false);
      setMessage(result.message ?? "You’re subscribed.");
    } catch (caught) {
      setError(true);
      setMessage(
        caught instanceof Error
          ? caught.message
          : "Unable to subscribe right now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor={`newsletter-email-${source}`} className="sr-only">
        Email address
      </label>
      <div className={`flex ${isBanner ? "max-w-lg" : "max-w-sm"}`}>
        <input
          id={`newsletter-email-${source}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          className={`min-w-0 flex-1 border px-3.5 py-3 font-body text-sm outline-none transition-colors focus:border-[#C6A66B] ${
            isBanner
              ? "border-[#E6DFD5] bg-white text-[#242824] placeholder:text-[#A8B5A0]"
              : "border-[#FFFCF7]/20 bg-[#162a1f] text-[#FFFCF7] placeholder:text-[#A8B5A0]"
          }`}
        />
        <button
          type="submit"
          disabled={submitting || !consent}
          className={`inline-flex shrink-0 items-center gap-1.5 px-4 py-3 font-body text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isBanner
              ? "bg-[#C6A66B] text-[#242824] hover:bg-[#d4b77e]"
              : "bg-[#C6A66B] text-[#242824] hover:bg-[#d4b77e]"
          }`}
        >
          {submitting ? "Sending…" : "Subscribe"}
          {!submitting && <ArrowRight size={12} aria-hidden="true" />}
        </button>
      </div>
      <label htmlFor={`newsletter-consent-${source}`} className={`mt-2.5 flex items-start gap-2 font-body text-[10px] leading-4 ${isBanner ? "text-[#777970]" : "text-[#FFFCF7]/75"}`}>
        <input
          id={`newsletter-consent-${source}`}
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 accent-[#C6A66B]"
        />
        <span>
          I agree to receive occasional email updates. See our{" "}
          <a href="/privacy" className={`underline underline-offset-2 ${isBanner ? "hover:text-[#203A2B]" : "hover:text-[#FFFCF7]"}`}>
            Privacy Policy
          </a>
          .
        </span>
      </label>
      <p
        role="status"
        aria-live="polite"
        className={`mt-1.5 min-h-4 font-body text-[11px] ${error ? (isBanner ? "text-red-600" : "text-red-200") : (isBanner ? "text-[#203A2B]" : "text-[#FFFCF7]/80")}`}
      >
        {message}
      </p>
    </form>
  );
}
