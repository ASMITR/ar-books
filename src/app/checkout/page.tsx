"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { formatINR } from "@/lib/currency";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Tag, X, ChevronDown, ChevronUp, Check, Loader2,
  ShoppingCart, Shield, Zap, BookOpen, ArrowRight, ArrowLeft, User, Mail, Phone,
} from "lucide-react";
import type { Offer, AppliedDiscount } from "@/types";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open(): void;
      on(
        event: "payment.failed",
        handler: (response: { error?: { description?: string } }) => void
      ): void;
    };
  }
}

// ─── Coupon / Offer Panel ─────────────────────────────────────────────────────
interface CouponPanelProps {
  cartItems: { bookId: string; pricePaise: number }[];
  subtotalPaise: number;
  appliedDiscount: AppliedDiscount | null;
  onApply: (discount: AppliedDiscount, code: string) => void;
  onRemove: () => void;
}

function CouponPanel({ cartItems, subtotalPaise, appliedDiscount, onApply, onRemove }: CouponPanelProps) {
  const [code, setCode]               = useState("");
  const [validating, setValidating]   = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [showOffers, setShowOffers]   = useState(false);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showOffers && !offersLoaded) {
      fetch("/api/offers")
        .then((r) => r.json())
        .then((j) => {
          if (j.success) {
            setAvailableOffers(
              (j.data as Offer[]).filter(
                (o) => o.showOnCheckout && o.couponCode && o.displayCouponPublicly
              )
            );
          }
        })
        .catch(() => {})
        .finally(() => setOffersLoaded(true));
    }
  }, [showOffers, offersLoaded]);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setValidating(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/checkout/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmed,
          bookIds: cartItems.map((i) => i.bookId),
          categoryIds: [],
          subtotalPaise,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setCouponError(json.error ?? "Invalid coupon code. Please check and try again.");
        return;
      }

      onApply(
        {
          offerId:       json.data.offerId,
          couponCode:    json.data.code,
          discountType:  json.data.discountType,
          discountValue: json.data.discountValue,
          discountPaise: json.data.discountPaise,
          title:         json.data.title,
          offerType:     json.data.type === "coupon" ? "coupon" : json.data.offerType ?? "percent",
        },
        trimmed
      );
      setCode("");
    } catch {
      setCouponError("Something went wrong. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleApply(); }
  };

  const useOfferCode = (offerCode: string) => {
    setCode(offerCode);
    setShowOffers(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="bg-white border border-[#E9E7E2]">
      <div className="px-5 py-4 border-b border-[#E9E7E2] flex items-center gap-2">
        <Tag size={14} className="text-[#203A2B]" strokeWidth={2} />
        <h2 className="font-heading text-base font-semibold text-[#080808]">Offers &amp; Coupons</h2>
      </div>

      <div className="px-5 py-4">
        {appliedDiscount ? (
          /* ── Applied ──────────────────────────────────────────────── */
          <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-5 h-5 bg-emerald-500 flex items-center justify-center shrink-0">
                <Check size={11} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-body font-semibold text-emerald-800 truncate">
                  {appliedDiscount.couponCode ? (
                    <span className="font-mono tracking-wide">{appliedDiscount.couponCode}</span>
                  ) : appliedDiscount.title} applied
                </p>
                <p className="text-xs font-body text-emerald-600 mt-0.5">
                  You save {formatINR(appliedDiscount.discountPaise)}
                </p>
              </div>
            </div>
            <button
              onClick={onRemove}
              className="shrink-0 w-6 h-6 flex items-center justify-center text-[#bbb] hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Remove coupon"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          /* ── Input ────────────────────────────────────────────────── */
          <>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setCouponError(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter coupon code"
                className="flex-1 border border-[#E9E7E2] px-4 py-2.5 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-[#789185] bg-white placeholder:text-[#ccc] placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
                aria-label="Coupon code"
              />
              <button
                type="button"
                onClick={handleApply}
                disabled={!code.trim() || validating}
                className="bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-[#315B55] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                {validating ? <Loader2 size={12} className="animate-spin" /> : null}
                Apply
              </button>
            </div>
            {couponError && (
              <p className="mt-2 text-xs font-body text-red-600 flex items-center gap-1.5">
                <X size={11} />
                {couponError}
              </p>
            )}
          </>
        )}

        {/* Available offers accordion */}
        <div className="mt-3 pt-3 border-t border-[#F0EEE9]">
          <button
            type="button"
            onClick={() => setShowOffers((s) => !s)}
            className="flex items-center gap-1.5 text-[11px] font-body font-semibold text-[#203A2B] hover:text-[#315B55] transition-colors"
          >
            {showOffers ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showOffers ? "Hide available offers" : "View available offers"}
          </button>

          {showOffers && (
            <div className="mt-3 flex flex-col gap-2">
              {!offersLoaded ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 size={12} className="animate-spin text-[#bbb]" />
                  <p className="text-xs font-body text-[#bbb]">Loading offers…</p>
                </div>
              ) : availableOffers.length === 0 ? (
                <p className="text-xs font-body text-[#bbb] py-2">No public offers available right now.</p>
              ) : (
                availableOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="border border-[#E6DFD5] p-3 bg-[#FAF9F6] flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-body font-semibold text-[#242824] truncate">{offer.title}</p>
                      <p className="text-[11px] font-body text-[#777970] mt-0.5 line-clamp-2">{offer.description}</p>
                      {offer.minCartValuePaise && (
                        <p className="text-[10px] text-[#A8B5A0] mt-0.5">
                          Min. order: {formatINR(offer.minCartValuePaise)}
                        </p>
                      )}
                    </div>
                    {offer.couponCode && (
                      <button
                        type="button"
                        onClick={() => useOfferCode(offer.couponCode!)}
                        className="shrink-0 font-mono text-[11px] font-bold bg-[#203A2B] text-white px-2.5 py-1 hover:bg-[#315B55] transition-colors whitespace-nowrap"
                      >
                        {offer.couponCode}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, totalPaise, clearCart } = useCart();
  const { user }  = useAuth();
  const router    = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [appliedCode, setAppliedCode]         = useState<string>("");

  useEffect(() => {
    if (appliedDiscount) {
      setAppliedDiscount(null);
      setAppliedCode("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const discountPaise   = appliedDiscount?.discountPaise ?? 0;
  const finalTotalPaise = Math.max(totalPaise - discountPaise, 100);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName:  user?.displayName ?? "",
      customerEmail: user?.email ?? "",
    },
  });

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script   = document.createElement("script");
      script.src     = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const onSubmit = async (data: CheckoutInput) => {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Payment gateway failed to load. Please try again.");

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items:         items.map((i) => ({ bookId: i.bookId })),
          customerName:  data.customerName,
          customerEmail: data.customerEmail,
          phone:         data.phone,
          couponCode:    appliedCode || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create order");

      const { razorpayOrderId, amount, currency, orderId, keyId } = json.data;

      const rzp = new window.Razorpay({
        key:      keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name:        "AR Books",
        description: `Order ${orderId}`,
        prefill: {
          name:    data.customerName,
          email:   data.customerEmail,
          contact: data.phone ?? "",
        },
        theme: { color: "#FFC928" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok || !verifyJson.success) {
              throw new Error(verifyJson.error ?? "Payment verification failed");
            }
            clearCart();
            router.push(`/thank-you?order_id=${orderId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. Your cart has been saved.");
            setLoading(false);
            router.push("/cart");
          },
        },
      });

      rzp.on("payment.failed", (response) => {
        setError(response.error?.description ?? "Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  /* ── Empty cart ──────────────────────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-5 max-w-xs">
          <div className="w-16 h-16 bg-[#E9E7E2] flex items-center justify-center">
            <ShoppingCart size={22} className="text-[#aaa]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-[#080808] mb-2">Nothing to checkout</h2>
            <p className="font-body text-sm text-[#777777]">Your cart is empty. Add some books first.</p>
          </div>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-[#315B55] transition-colors"
          >
            Browse Books <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-[#E9E7E2] bg-[#FFFCF7]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 border border-[#E6DFD5] text-[#555] font-body text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-2 hover:border-[#789185] hover:text-[#203A2B] transition-colors"
            >
              <ArrowLeft size={12} /> Cart
            </Link>
            <span className="text-[#D0CEC9] text-xs">›</span>
            <span className="text-[11px] font-body text-[#080808] font-semibold uppercase tracking-[0.1em]">Checkout</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808] leading-none">Checkout</h1>
        </div>
      </div>

      {/* ── Progress Steps ─────────────────────────────────────────────────── */}
      <div className="bg-[#FFFCF7] border-b border-[#E9E7E2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-11 gap-0">
            {[
              { label: "Cart",    done: true },
              { label: "Details", done: false, active: true },
              { label: "Payment", done: false },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-0">
                {i > 0 && <div className="w-8 h-px bg-[#E9E7E2] mx-1" />}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 flex items-center justify-center text-[9px] font-bold
                      ${step.done   ? "bg-[#203A2B] text-white"                  : ""}
                      ${step.active ? "border-2 border-[#203A2B] text-[#203A2B]" : ""}
                      ${!step.done && !step.active ? "border border-[#D0CEC9] text-[#bbb]" : ""}
                    `}
                  >
                    {step.done ? <Check size={9} strokeWidth={3} /> : i + 1}
                  </div>
                  <span
                    className={`text-[11px] font-body hidden sm:inline
                      ${step.active ? "text-[#080808] font-semibold" : step.done ? "text-[#203A2B]" : "text-[#bbb]"}
                    `}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 xl:gap-12 items-start">

          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* ── Contact Details ─────────────────────────────────────── */}
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white border border-[#E9E7E2]">
                <div className="px-5 py-4 border-b border-[#E9E7E2] flex items-center gap-2">
                  <User size={14} className="text-[#789185]" strokeWidth={2} />
                  <h2 className="font-heading text-base font-semibold text-[#080808]">Contact Details</h2>
                </div>

                <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label htmlFor="checkout-name" className="block text-[10px] font-body uppercase tracking-[0.15em] text-[#999] mb-1.5">
                        Full Name <span className="text-[#F12F43]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="checkout-name"
                          {...register("customerName")}
                          className={`w-full border px-4 py-3 text-sm font-body focus:outline-none transition-colors bg-white
                            ${errors.customerName ? "border-[#F12F43] bg-[#FFF8F8]" : "border-[#E9E7E2] focus:border-[#789185]"}`}
                          placeholder="Your full name"
                        />
                      </div>
                      {errors.customerName && (
                        <p className="text-[11px] text-[#F12F43] mt-1 flex items-center gap-1">
                          <X size={10} />{errors.customerName.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="checkout-phone" className="block text-[10px] font-body uppercase tracking-[0.15em] text-[#999] mb-1.5">
                        Phone <span className="text-[#bbb] normal-case tracking-normal font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccc] pointer-events-none" />
                        <input
                          id="checkout-phone"
                          {...register("phone")}
                          type="tel"
                          className="w-full border border-[#E9E7E2] pl-9 pr-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185] bg-white transition-colors"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label htmlFor="checkout-email" className="block text-[10px] font-body uppercase tracking-[0.15em] text-[#999] mb-1.5">
                      Email Address <span className="text-[#F12F43]">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccc] pointer-events-none" />
                      <input
                        id="checkout-email"
                        {...register("customerEmail")}
                        type="email"
                        className={`w-full border pl-9 pr-4 py-3 text-sm font-body focus:outline-none transition-colors bg-white
                          ${errors.customerEmail ? "border-[#F12F43] bg-[#FFF8F8]" : "border-[#E9E7E2] focus:border-[#789185]"}`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.customerEmail && (
                      <p className="text-[11px] text-[#F12F43] mt-1 flex items-center gap-1">
                        <X size={10} />{errors.customerEmail.message}
                      </p>
                    )}
                    <p className="text-[11px] font-body text-[#aaa] mt-1.5">
                      Download link &amp; receipt will be sent to this address.
                    </p>
                  </div>
                </div>
              </div>
            </form>

            {/* ── Coupon Panel ──────────────────────────────────────────── */}
            <CouponPanel
              cartItems={items}
              subtotalPaise={totalPaise}
              appliedDiscount={appliedDiscount}
              onApply={(discount, code) => {
                setAppliedDiscount(discount);
                setAppliedCode(code);
              }}
              onRemove={() => {
                setAppliedDiscount(null);
                setAppliedCode("");
              }}
            />

            {/* ── Policies ──────────────────────────────────────────────── */}
            <div className="bg-white border border-[#E9E7E2] px-5 py-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    {...register("acceptPolicies")}
                    form="checkout-form"
                    className="peer w-4 h-4 border border-[#D0CEC9] appearance-none checked:bg-[#203A2B] checked:border-[#203A2B] focus:outline-none cursor-pointer transition-colors"
                  />
                  <Check
                    size={10}
                    className="absolute inset-0 m-auto text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                    strokeWidth={3}
                  />
                </div>
                <span className="text-sm font-body text-[#555] leading-relaxed">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" className="underline text-[#203A2B] hover:text-[#315B55]">Terms &amp; Conditions</a>,{" "}
                  <a href="/privacy" target="_blank" className="underline text-[#203A2B] hover:text-[#315B55]">Privacy Policy</a>, and{" "}
                  <a href="/refund-policy" target="_blank" className="underline text-[#203A2B] hover:text-[#315B55]">Refund Policy</a>.
                  I understand this is a digital product and no physical item will be shipped.
                </span>
              </label>
              {errors.acceptPolicies && (
                <p className="text-[11px] text-[#F12F43] mt-2 flex items-center gap-1">
                  <X size={10} />{errors.acceptPolicies.message}
                </p>
              )}
            </div>

            {/* ── Error Banner ──────────────────────────────────────────── */}
            {error && (
              <div className="border border-[#F12F43] bg-[#FFF5F5] px-4 py-3 flex items-start gap-2.5">
                <X size={14} className="text-[#F12F43] mt-0.5 shrink-0" />
                <p className="text-sm font-body text-[#F12F43]">{error}</p>
              </div>
            )}

            {/* ── Pay Button ────────────────────────────────────────────── */}
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-[#FFC928] text-[#080808] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-8 py-4 hover:bg-[#F2B916] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  Pay {formatINR(finalTotalPaise)}
                  <ArrowRight size={13} />
                </>
              )}
            </button>

            <p className="text-[11px] font-body text-[#aaa] text-center flex items-center justify-center gap-1.5">
              <Shield size={11} />
              Secured by Razorpay · 256-bit SSL encryption
            </p>
          </div>

          {/* ── Right Column: Order Summary ──────────────────────────────── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">

            {/* Summary Card */}
            <div className="bg-white border border-[#E9E7E2]">
              <div className="px-5 py-4 border-b border-[#E9E7E2] flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#080808]">Order Summary</h2>
                <span className="text-[11px] font-body text-[#aaa]">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Book list */}
              <div className="px-5 py-4 flex flex-col gap-4 border-b border-[#F0EEE9]">
                {items.map((item) => (
                  <div key={item.bookId} className="flex gap-3">
                    <div className="relative w-10 h-[56px] shrink-0 bg-[#F5EFE6] overflow-hidden">
                      {item.coverImageUrl ? (
                        <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={14} className="text-[#789185]/50" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between flex-1 py-0.5 min-w-0">
                      <p className="text-[13px] font-body font-medium text-[#080808] line-clamp-2 leading-snug">
                        {item.title}
                      </p>
                      <p className="text-[13px] font-body font-semibold text-[#080808] tabular-nums mt-1">
                        {formatINR(item.pricePaise)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="px-5 py-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm font-body text-[#777777]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatINR(totalPaise)}</span>
                </div>

                {discountPaise > 0 && appliedDiscount && (
                  <div className="flex justify-between text-sm font-body text-emerald-700">
                    <span className="flex items-center gap-1.5">
                      <Tag size={11} />
                      {appliedDiscount.couponCode
                        ? <span className="font-mono text-xs tracking-wide">{appliedDiscount.couponCode}</span>
                        : appliedDiscount.title}
                    </span>
                    <span className="tabular-nums">−{formatINR(discountPaise)}</span>
                  </div>
                )}

                <div className="flex justify-between font-body font-bold text-[#080808] text-base border-t border-[#E9E7E2] pt-3 mt-1">
                  <span>Total</span>
                  <span className="tabular-nums">{formatINR(finalTotalPaise)}</span>
                </div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="border border-[#E9E7E2] bg-[#FFFCF7] divide-y divide-[#F0EEE9]">
              <div className="flex items-start gap-3 px-4 py-3">
                <Zap size={14} className="text-[#C6A66B] mt-0.5 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[11px] font-body font-semibold text-[#080808] uppercase tracking-wide">Instant Delivery</p>
                  <p className="text-[11px] font-body text-[#777777] mt-0.5">Your eBook is available immediately after payment</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <Shield size={14} className="text-[#C6A66B] mt-0.5 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[11px] font-body font-semibold text-[#080808] uppercase tracking-wide">Secure Checkout</p>
                  <p className="text-[11px] font-body text-[#777777] mt-0.5">Payments processed by Razorpay</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <BookOpen size={14} className="text-[#C6A66B] mt-0.5 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[11px] font-body font-semibold text-[#080808] uppercase tracking-wide">Any Device</p>
                  <p className="text-[11px] font-body text-[#777777] mt-0.5">Read on mobile, tablet, or desktop</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
