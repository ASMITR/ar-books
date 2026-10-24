"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { formatINR } from "@/lib/currency";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

export default function CheckoutPage() {
  const { items, totalPaise, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Create order on server
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ bookId: i.bookId })),
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          phone: data.phone,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create order");

      const { razorpayOrderId, amount, currency, orderId, keyId } = json.data;

      // Open Razorpay checkout
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
          ondismiss: () => setLoading(false),
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
        <p className="font-body text-[#777777]">Your cart is empty. <a href="/books" className="underline">Browse books</a></p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-heading text-4xl font-bold text-[#080808] mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-white border border-[#E9E7E2] p-6">
              <h2 className="font-heading text-xl font-semibold text-[#080808] mb-5">Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Full Name *</label>
                  <input
                    {...register("customerName")}
                    className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                    placeholder="Your full name"
                  />
                  {errors.customerName && <p className="text-xs text-[#F12F43] mt-1">{errors.customerName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Email *</label>
                  <input
                    {...register("customerEmail")}
                    type="email"
                    className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                    placeholder="your@email.com"
                  />
                  {errors.customerEmail && <p className="text-xs text-[#F12F43] mt-1">{errors.customerEmail.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Phone (optional)</label>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E9E7E2] p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("acceptPolicies")}
                  className="mt-0.5"
                />
                <span className="text-sm font-body text-[#777777]">
                  I accept the{" "}
                  <a href="/terms" target="_blank" className="underline text-[#080808]">Terms & Conditions</a>,{" "}
                  <a href="/privacy" target="_blank" className="underline text-[#080808]">Privacy Policy</a>, and{" "}
                  <a href="/refund-policy" target="_blank" className="underline text-[#080808]">Refund Policy</a>.
                  I understand this is a digital product purchase.
                </span>
              </label>
              {errors.acceptPolicies && <p className="text-xs text-[#F12F43] mt-2">{errors.acceptPolicies.message}</p>}
            </div>

            {error && (
              <div className="bg-[#FFF0F0] border border-[#F12F43] text-[#F12F43] text-sm font-body p-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#F2B916] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processing…" : `Pay ${formatINR(totalPaise)}`}
            </button>
          </form>

          {/* Order summary */}
          <div className="bg-white border border-[#E9E7E2] p-6 h-fit">
            <h2 className="font-heading text-xl font-semibold text-[#080808] mb-5">Order Summary</h2>
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
            <div className="border-t border-[#E9E7E2] pt-4 flex justify-between font-body font-bold text-[#080808]">
              <span>Total</span>
              <span>{formatINR(totalPaise)}</span>
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
