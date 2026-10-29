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
import { Tag, X, ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";
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
  const [code, setCode]             = useState("");
  const [validating, setValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [showOffers, setShowOffers]   = useState(false);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load available public offers for display
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
    <div className="bg-white border border-[#E9E7E2] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={15} className="text-[#203A2B]" />
        <h2 className="font-heading text-lg font-semibold text-[#080808]">Offers &amp; Coupons</h2>
      </div>

      {appliedDiscount ? (
        /* ── Applied state ──────────────────────────────────── */
        <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-body font-semibold text-emerald-800 truncate">
                {appliedDiscount.couponCode
                  ? <span className="font-mono">{appliedDiscount.couponCode}</span>
                  : appliedDiscount.title}
                {" "}applied
              </p>
              <p className="text-xs font-body text-emerald-600">
                You save {formatINR(appliedDiscount.discountPaise)}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="shrink-0 text-[#aaa] hover:text-red-500 transition-colors"
            aria-label="Remove coupon"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        /* ── Input state ────────────────────────────────────── */
        <>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setCouponError(null); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter coupon code"
              className="flex-1 border border-[#E9E7E2] px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-[#789185] bg-white rounded-lg"
              aria-label="Coupon code"
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={!code.trim() || validating}
              className="bg-[#203A2B] text-white font-body text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-[#315B55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {validating ? <Loader2 size={13} className="animate-spin" /> : null}
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

      {/* ── Available offers accordion ───────────────────────────── */}
      <div className="mt-4">
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
              <p className="text-xs font-body text-[#bbb] py-2">Loading offers…</p>
            ) : availableOffers.length === 0 ? (
              <p className="text-xs font-body text-[#bbb] py-2">No public offers available right now.</p>
            ) : (
              availableOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="border border-[#E6DFD5] rounded-lg p-3 bg-[#FAF9F6] flex items-start justify-between gap-3"
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
                      className="shrink-0 font-mono text-[11px] font-bold bg-[#203A2B] text-white px-2.5 py-1 rounded-md hover:bg-[#315B55] transition-colors whitespace-nowrap"
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
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, totalPaise, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon / discount state
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [appliedCode, setAppliedCode]         = useState<string>("");

  // Recalculate totals if cart changes after coupon is applied
  useEffect(() => {
    if (appliedDiscount) {
      // Re-validate on cart change (safety — actual validation is server-side in create-order)
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
      customerName: user?.displayName ?? "",
      customerEmail: user?.email ?? "",
    },
  });

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
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

      // Create order — server re-validates coupon and calculates authoritative total
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ bookId: i.bookId })),
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          phone: data.phone,
          couponCode: appliedCode || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create order");

      const { razorpayOrderId, amount, currency, orderId, keyId } = json.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "AR Books",
        description: `Order ${orderId}`,
        prefill: {
          name: data.customerName,
          email: data.customerEmail,
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
                razorpayOrderId: response.razorpay_order_id,
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

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center">
        <p className="font-body text-[#777777]">
          Your cart is empty.{" "}
          <a href="/books" className="underline">Browse books</a>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-heading text-4xl font-bold text-[#080808] mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left column: form ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Single checkout form */}
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white border border-[#E9E7E2] p-6">
                <h2 className="font-heading text-xl font-semibold text-[#080808] mb-5">Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-name" className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Full Name *</label>
                    <input
                      id="checkout-name"
                      {...register("customerName")}
                      className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                      placeholder="Your full name"
                    />
                    {errors.customerName && <p className="text-xs text-[#F12F43] mt-1">{errors.customerName.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Email *</label>
                    <input
                      id="checkout-email"
                      {...register("customerEmail")}
                      type="email"
                      className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                      placeholder="your@email.com"
                    />
                    {errors.customerEmail && <p className="text-xs text-[#F12F43] mt-1">{errors.customerEmail.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="checkout-phone" className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Phone (optional)</label>
                    <input
                      id="checkout-phone"
                      {...register("phone")}
                      type="tel"
                      className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Coupon / Offers panel — outside the form to avoid accidental submit */}
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

            {/* Policies */}
            <div className="bg-white border border-[#E9E7E2] p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register("acceptPolicies")} className="mt-0.5" form="checkout-form" />
                <span className="text-sm font-body text-[#777777]">
                  I accept the{" "}
                  <a href="/terms" target="_blank" className="underline text-[#080808]">Terms &amp; Conditions</a>,{" "}
                  <a href="/privacy" target="_blank" className="underline text-[#080808]">Privacy Policy</a>, and{" "}
                  <a href="/refund-policy" target="_blank" className="underline text-[#080808]">Refund Policy</a>.
                  I understand this is a digital product purchase.
                </span>
              </label>
              {errors.acceptPolicies && (
                <p className="text-xs text-[#F12F43] mt-2">{errors.acceptPolicies.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-[#FFF0F0] border border-[#F12F43] text-[#F12F43] text-sm font-body p-4 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#F2B916] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Processing…" : `Pay ${formatINR(finalTotalPaise)}`}
            </button>
          </div>

          {/* ── Right column: order summary ── */}
          <div className="bg-white border border-[#E9E7E2] p-6 h-fit sticky top-4">
            <h2 className="font-heading text-xl font-semibold text-[#080808] mb-5">Order Summary</h2>

            {/* Book list */}
            <div className="flex flex-col gap-4 mb-6">
              {items.map((item) => (
                <div key={item.bookId} className="flex gap-3">
                  <div className="relative w-12 h-16 shrink-0 bg-[#FAF9F6]">
                    {item.coverImageUrl && (
                      <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <p className="text-sm font-body font-medium text-[#080808] line-clamp-2">{item.title}</p>
                    <p className="text-sm font-body font-semibold">{formatINR(item.pricePaise)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-[#E9E7E2] pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm font-body text-[#555]">
                <span>Subtotal</span>
                <span>{formatINR(totalPaise)}</span>
              </div>

              {discountPaise > 0 && appliedDiscount && (
                <div className="flex justify-between text-sm font-body text-emerald-700">
                  <span className="flex items-center gap-1">
                    <Tag size={11} />
                    {appliedDiscount.couponCode
                      ? <span className="font-mono text-xs">{appliedDiscount.couponCode}</span>
                      : appliedDiscount.title}
                  </span>
                  <span>−{formatINR(discountPaise)}</span>
                </div>
              )}

              <div className="flex justify-between font-body font-bold text-[#080808] text-base border-t border-[#E9E7E2] pt-2 mt-1">
                <span>Total</span>
                <span>{formatINR(finalTotalPaise)}</span>
              </div>
            </div>

            <p className="text-xs text-[#777777] mt-4 font-body">
              🔒 Secure payment via Razorpay. Your eBook will be available immediately after payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
