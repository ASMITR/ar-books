"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, Zap, Star } from "lucide-react";
import { formatINR } from "@/lib/currency";
import type { MembershipPlan } from "@/types/subscription";

interface Props {
  plans: MembershipPlan[];
  isLoggedIn: boolean;
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>)["Razorpay"]) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type RazorpayCheckout = new (options: Record<string, unknown>) => { open(): void };

function getRazorpayConstructor(): RazorpayCheckout | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as Record<string, unknown>)["Razorpay"] as RazorpayCheckout | null;
}

export function MembershipPricingCards({ plans, isLoggedIn }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const handleSubscribe = async (plan: MembershipPlan) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/membership`);
      return;
    }

    setLoading(plan.id);
    setError(null);

    try {
      // Step 1: Create subscription on server
      const res = await fetch("/api/membership/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to start subscription. Please try again.");
        return;
      }

      const { razorpaySubscriptionId, razorpayKeyId, subscriptionId } = json.data;

      // Step 2: Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Payment gateway failed to load. Please refresh and try again.");
        return;
      }

      // Step 3: Open Razorpay subscription checkout
      const RazorpayConstructor = getRazorpayConstructor();
      if (!RazorpayConstructor) {
        setError("Payment gateway failed to load. Please refresh and try again.");
        return;
      }
      const rzp = new RazorpayConstructor({
        key:             razorpayKeyId,
        subscription_id: razorpaySubscriptionId,
        name:            "AR Books Membership",
        description:     `${plan.name} — ${formatINR(plan.pricePaise)}/month`,
        image:           "/Favicon_and_App_Icon.png",
        prefill: {},
        theme: { color: "#203A2B" },
        modal: {
          ondismiss: () => setLoading(null),
        },
        handler: () => {
          // Payment authorised — redirect to success page
          // Access is granted only after webhook confirms subscription.authenticated/charged
          router.push(`/membership/success?subscriptionId=${subscriptionId}`);
        },
      });

      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-body text-[#777970]">Membership plans are being set up. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 font-body text-[13px] px-5 py-3 rounded-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col bg-[#FFFCF7] border rounded-sm overflow-hidden
              transition-all duration-300
              ${plan.highlighted
                ? "border-[#203A2B] shadow-[0_8px_40px_rgba(32,58,43,0.18)]"
                : "border-[#E6DFD5] hover:border-[#203A2B]/40 hover:shadow-[0_6px_28px_rgba(32,58,43,0.10)]"
              }`}
          >
            {/* Gold top accent */}
            <div className={`h-[3px] w-full bg-gradient-to-r from-[#C6A66B] via-[#dfc080] to-[#C6A66B]
              ${plan.highlighted ? "opacity-100" : "opacity-0 hover:opacity-100"} transition-opacity duration-300`} />

            {plan.highlighted && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 bg-[#C6A66B] text-[#1a1a1a]
                  font-body text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full shadow-sm">
                  <Star size={8} fill="currentColor" /> Most Popular
                </span>
              </div>
            )}

            <div className="px-7 pt-7 pb-5">
              {/* Plan name */}
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-[#A8B5A0] mb-2">
                {plan.badgeLabel}
              </p>
              <h3 className="font-heading text-[28px] font-bold text-[#1a1a1a] leading-none mb-4">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-end gap-1.5 mb-2">
                <span className="font-heading text-[42px] font-bold text-[#203A2B] leading-none">
                  ₹{plan.priceRupees}
                </span>
                <span className="font-body text-[14px] text-[#A8B5A0] mb-1.5">/month</span>
              </div>
              <p className="font-body text-[12px] text-[#A8B5A0] mb-5">
                Billed monthly · Cancel anytime
              </p>

              <p className="font-body text-[13px] text-[#555] leading-relaxed mb-6">
                {plan.description}
              </p>

              {/* CTA */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading !== null}
                className={`w-full flex items-center justify-center gap-2.5
                  font-body text-[11px] font-black uppercase tracking-[0.18em]
                  px-6 py-4 rounded-sm transition-all duration-200
                  active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                  ${plan.highlighted
                    ? "bg-[#203A2B] text-[#FFFCF7] hover:bg-[#2c5040] shadow-md"
                    : "border-2 border-[#203A2B] text-[#203A2B] hover:bg-[#203A2B] hover:text-[#FFFCF7]"
                  }`}
              >
                {loading === plan.id ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap size={13} />
                )}
                {isLoggedIn ? "Subscribe Now" : "Sign In to Subscribe"}
                {loading !== plan.id && <ArrowRight size={11} className="ml-auto" />}
              </button>

              {!isLoggedIn && (
                <p className="text-center font-body text-[11px] text-[#A8B5A0] mt-2">
                  <Link href="/register" className="text-[#315B55] hover:underline">Create a free account</Link>
                  {" "}to get started
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="mx-7 h-px bg-[#EDEBE6]" />

            {/* Benefits */}
            <div className="px-7 py-5 flex flex-col gap-2.5 flex-1">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[#A8B5A0] mb-1">
                What&apos;s included
              </p>
              {plan.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={9} strokeWidth={3} className="text-emerald-700" />
                  </div>
                  <span className="font-body text-[12px] text-[#555] leading-snug">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
