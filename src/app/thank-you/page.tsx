import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { adminDb } from "@/lib/firebase/admin";
import { formatDate } from "@/lib/utils";
import { formatINR } from "@/lib/currency";
import {
  Download, BookOpen, XCircle, Clock, Sparkles,
  Mail, ArrowRight, Library, ShoppingBag, Star,
} from "lucide-react";
import type { Order } from "@/types";
import type { Metadata } from "next";
import { CopyButton } from "@/components/shared/CopyButton";
import { DownloadCard } from "@/components/shared/DownloadCard";

export const metadata: Metadata = { title: "Thank You for Your Purchase — AR Books" };

interface Props {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const { order_id } = await searchParams;
  if (!order_id) redirect("/books");

  const doc = await adminDb.collection("orders").doc(order_id).get();
  if (!doc.exists) notFound();

  const order = { id: doc.id, ...doc.data() } as Order;
  const firstName = order.customerName?.split(" ")[0] ?? "Friend";
  const isPaid     = order.paymentStatus === "paid";
  const isPending  = order.paymentStatus === "pending";
  const isFailed   = order.paymentStatus === "failed";

  /* ── Non-paid states (pending / failed / refunded) ───────────────────────── */
  if (!isPaid) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E9E7E2] p-8 text-center flex flex-col items-center gap-4">
          {isPending ? (
            <Clock size={48} className="text-[#FFC928]" strokeWidth={1.5} />
          ) : (
            <XCircle size={48} className="text-[#F12F43]" strokeWidth={1.5} />
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#080808] mb-2">
              {isPending ? "Payment Processing…" : isFailed ? "Payment Failed" : "Order Refunded"}
            </h1>
            <p className="font-body text-sm text-[#777777]">
              {isPending
                ? "Your payment is being verified. This usually takes a few seconds — please refresh the page."
                : isFailed
                ? "Your payment could not be completed. Your cart has been saved."
                : "This order has been refunded. Please allow 5–7 business days."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            {isFailed && (
              <Link
                href="/checkout"
                className="flex-1 text-center bg-[#F12F43] text-white font-body text-[11px] font-bold uppercase tracking-widest px-6 py-3.5 hover:opacity-90 transition-opacity"
              >
                Try Again
              </Link>
            )}
            <Link
              href="/books"
              className="flex-1 text-center border border-[#E9E7E2] text-[#080808] font-body text-[11px] font-bold uppercase tracking-widest px-6 py-3.5 hover:bg-[#FAF9F6] transition-colors"
            >
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Paid state ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#FAF9F6]">

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — full-width forest green
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative bg-[#203A2B] overflow-hidden">
        {/* Faded watermark text */}
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <span className="font-heading text-[22vw] font-bold text-[#FFFCF7]/[0.03] leading-none whitespace-nowrap">
            THANK YOU
          </span>
        </div>

        {/* Decorative circles */}
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#315B55]/60" />
        <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#315B55]/40" />
        <div aria-hidden className="pointer-events-none absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-[#C6A66B]/60" />
        <div aria-hidden className="pointer-events-none absolute top-10 left-1/3 w-1.5 h-1.5 rounded-full bg-[#FFC928]/50" />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-14 pb-16 text-center">
          {/* Sparkle icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FFC928] mb-5">
            <Sparkles size={24} className="text-[#203A2B]" strokeWidth={2} />
          </div>

          {/* Eyebrow */}
          <p className="text-[10px] font-body font-semibold uppercase tracking-[0.35em] text-[#A8B5A0] mb-3">
            Order Confirmed · Payment Successful
          </p>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FFFCF7] leading-[1.05] mb-4">
            Thank you,{" "}
            <em className="not-italic text-[#FFC928]">{firstName}!</em>
          </h1>

          {/* Sub */}
          <p className="font-body text-[#A8B5A0] text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-7">
            Your eBooks are ready to download below. We&apos;ve also sent a receipt and download link to your inbox.
          </p>

          {/* Email pill */}
          <div className="inline-flex items-center gap-2 bg-[#FFFCF7]/10 border border-[#FFFCF7]/20 px-4 py-2">
            <Mail size={13} className="text-[#A8B5A0] shrink-0" />
            <span className="text-[12px] font-body text-[#FFFCF7]/80">{order.customerEmail}</span>
          </div>
        </div>

        {/* Fade into page bg */}
        <div aria-hidden className="h-8 bg-gradient-to-b from-[#203A2B] to-[#FAF9F6]" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BODY
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16 -mt-2 flex flex-col gap-6">

        {/* ── Order receipt strip ───────────────────────────────────────────── */}
        <div className="bg-white border border-[#E6DFD5] overflow-hidden">
          {/* Gold header bar */}
          <div className="bg-gradient-to-r from-[#C6A66B]/20 via-[#FFC928]/15 to-[#C6A66B]/20 border-b border-[#E6DFD5] px-5 py-3 flex items-center justify-between">
            <span className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-[#777970]">
              Order Receipt
            </span>
            <span className="text-[10px] font-body font-bold text-[#203A2B] bg-[#203A2B]/8 px-2.5 py-1 uppercase tracking-wider">
              Paid ✓
            </span>
          </div>

          <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-3">
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1">Order No.</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-body font-semibold text-[#080808] font-mono tracking-tight">
                  {order.orderNumber}
                </span>
                <CopyButton text={order.orderNumber} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1">Date</p>
              <p className="text-[13px] font-body font-semibold text-[#080808]">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1">Customer</p>
              <p className="text-[13px] font-body font-semibold text-[#080808]">{order.customerName}</p>
            </div>
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1">Total Paid</p>
              <p className="text-[15px] font-heading font-bold text-[#203A2B] tabular-nums">
                {formatINR(order.totalPaise)}
              </p>
            </div>
          </div>

          {/* Discount row — only if a coupon was applied */}
          {order.discountPaise > 0 && (
            <div className="px-5 pb-4 flex items-center gap-2 text-[11px] font-body text-emerald-700">
              <span className="font-mono text-xs font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                {order.appliedDiscount?.couponCode ?? "DISCOUNT"}
              </span>
              <span>applied — you saved {formatINR(order.discountPaise)}</span>
            </div>
          )}
        </div>

        {/* ── Downloads ─────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-0.5">
                Ready to read
              </p>
              <h2 className="font-heading text-2xl font-bold text-[#242824]">Your Downloads</h2>
            </div>
            <span className="text-[11px] font-body text-[#A8B5A0] pb-0.5">
              {order.items.length} {order.items.length === 1 ? "book" : "books"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {order.items.map((item, i) => (
              <DownloadCard
                key={item.bookId}
                title={item.title}
                coverImageUrl={item.coverImageUrl}
                pricePaise={item.pricePaise}
                downloadUrl={`/api/downloads/secure?bookId=${item.bookId}`}
                index={i}
              />
            ))}
          </div>

          {/* Library tip */}
          <div className="mt-3 flex items-start gap-2.5 px-4 py-3 bg-[#203A2B]/6 border border-[#203A2B]/12">
            <Library size={13} className="text-[#203A2B] mt-0.5 shrink-0" strokeWidth={2} />
            <p className="text-[11px] font-body text-[#555]">
              All purchases are saved in{" "}
              <Link
                href="/account/library"
                className="font-semibold text-[#203A2B] underline underline-offset-2 hover:text-[#315B55]"
              >
                My Library
              </Link>{" "}
              — re-download anytime, on any device.
            </p>
          </div>
        </div>

        {/* ── Rating / review band ──────────────────────────────────────────── */}
        <div className="relative bg-[#242824] overflow-hidden">
          {/* Faint quote mark */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-4 -left-2 font-heading text-[120px] leading-none text-[#FFFCF7]/[0.04] select-none"
          >
            &ldquo;
          </div>
          <div className="relative px-6 py-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            <div className="flex flex-col items-center sm:items-start gap-1.5 shrink-0">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className="text-[#FFC928] fill-[#FFC928]" />
                ))}
              </div>
              <span className="text-[10px] font-body text-[#777970] uppercase tracking-wider">5 stars</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-heading text-lg font-bold text-[#FFFCF7] leading-snug">
                Enjoying what you&apos;re reading?
              </p>
              <p className="text-[12px] font-body text-[#777970] mt-1">
                A quick review helps other readers discover the book.
              </p>
            </div>
            <Link
              href="/books"
              className="shrink-0 flex items-center gap-2 bg-[#FFC928] text-[#080808] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-3 hover:bg-[#F2B916] transition-colors"
            >
              Write a Review <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* ── What's next CTAs ──────────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-3 text-center">
            What&apos;s next?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/account/library"
              className="group flex items-center gap-4 bg-[#203A2B] px-5 py-4 hover:bg-[#315B55] transition-colors"
            >
              <div className="w-9 h-9 bg-[#FFFCF7]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FFFCF7]/15 transition-colors">
                <Library size={16} className="text-[#FFC928]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-[#FFFCF7]">My Library</p>
                <p className="font-body text-[11px] text-[#A8B5A0] mt-0.5">All your books in one place</p>
              </div>
              <ArrowRight size={14} className="text-[#A8B5A0] group-hover:text-[#FFC928] transition-colors shrink-0" />
            </Link>

            <Link
              href="/books"
              className="group flex items-center gap-4 bg-white border border-[#E6DFD5] px-5 py-4 hover:border-[#C6A66B] transition-colors"
            >
              <div className="w-9 h-9 bg-[#FAF9F6] flex items-center justify-center shrink-0 group-hover:bg-[#F5EFE6] transition-colors">
                <ShoppingBag size={16} className="text-[#203A2B]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-[#242824]">Browse More</p>
                <p className="font-body text-[11px] text-[#777970] mt-0.5">Explore the full collection</p>
              </div>
              <ArrowRight size={14} className="text-[#D0CEC9] group-hover:text-[#203A2B] transition-colors shrink-0" />
            </Link>
          </div>
        </div>

        {/* ── Footer note ───────────────────────────────────────────────────── */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-body text-[#A8B5A0]">
            <BookOpen size={12} strokeWidth={1.5} />
            <span>Happy reading — we hope it stays with you.</span>
            <BookOpen size={12} strokeWidth={1.5} />
          </div>
          <p className="mt-2 text-[11px] font-body text-[#C0BDB8]">
            Questions?{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-[#080808] transition-colors">
              Contact support
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
