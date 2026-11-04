import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { formatDate } from "@/lib/utils";
import { formatINR } from "@/lib/currency";
import {
  Download, BookOpen, XCircle, Clock, CheckCircle2,
  Mail, ArrowRight, Library, ShoppingBag, Check, RefreshCw,
  Tag,
} from "lucide-react";
import type { Order } from "@/types";
import type { Metadata } from "next";
import { CopyButton } from "@/components/shared/CopyButton";
import { DownloadCard } from "@/components/shared/DownloadCard";

export const metadata: Metadata = { title: "Thank You for Your Purchase — AR Books" };

interface Props { searchParams: Promise<{ order_id?: string }> }

export default async function ThankYouPage({ searchParams }: Props) {
  const { order_id } = await searchParams;
  if (!order_id) redirect("/books");

  const doc = await adminDb.collection("orders").doc(order_id).get();
  if (!doc.exists) notFound();

  const order     = { id: doc.id, ...doc.data() } as Order;
  const firstName = order.customerName?.split(" ")[0] ?? "Friend";
  const isPaid    = order.paymentStatus === "paid";
  const isPending = order.paymentStatus === "pending";
  const isFailed  = order.paymentStatus === "failed";

  /* ── Non-paid ──────────────────────────────────────────────────────────── */
  if (!isPaid) {
    return (
      <div className="bg-[#F5EFE6] min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-[#FFFCF7] border border-[#E6DFD5] overflow-hidden">
            <div className={`h-1 ${isPending ? "bg-[#FFC928]" : isFailed ? "bg-[#F12F43]" : "bg-[#789185]"}`} />
            <div className="px-8 py-10 flex flex-col items-center text-center gap-5">
              <div className={`w-16 h-16 flex items-center justify-center border-2
                ${isPending ? "border-[#FFC928]/40 bg-[#FFC928]/8" : isFailed ? "border-[#F12F43]/30 bg-[#F12F43]/6" : "border-[#E6DFD5] bg-[#F5EFE6]"}`}>
                {isPending
                  ? <Clock size={28} className="text-[#FFC928]" strokeWidth={1.5} />
                  : isFailed
                  ? <XCircle size={28} className="text-[#F12F43]" strokeWidth={1.5} />
                  : <RefreshCw size={28} className="text-[#789185]" strokeWidth={1.5} />}
              </div>
              <div>
                <p className="text-[9px] font-body font-bold uppercase tracking-[0.22em] text-[#A8B5A0] mb-2">
                  {isPending ? "Processing" : isFailed ? "Failed" : "Refunded"}
                </p>
                <h1 className="font-heading text-[28px] font-bold text-[#242824] leading-tight mb-2">
                  {isPending ? "Payment in progress…" : isFailed ? "Payment unsuccessful" : "Order refunded"}
                </h1>
                <p className="font-body text-[13px] text-[#777970] leading-relaxed">
                  {isPending
                    ? "Your payment is being verified. This usually takes a few seconds — please refresh."
                    : isFailed
                    ? "Your payment could not be completed. Your cart is still saved."
                    : "This order has been refunded. Please allow 5–7 business days."}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#F5EFE6] border border-[#E6DFD5] px-4 py-2.5 w-full justify-center">
                <span className="text-[10px] font-body uppercase tracking-[0.15em] text-[#A8B5A0]">Order</span>
                <span className="font-mono text-[13px] font-bold text-[#242824]">{order.orderNumber}</span>
                <CopyButton text={order.orderNumber} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-1">
                {isPending && (
                  <Link href={`/thank-you?order_id=${order_id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FFC928] text-[#080808]
                      font-body text-[10px] font-bold uppercase tracking-[0.18em] px-5 py-3.5
                      hover:bg-[#F2B916] transition-colors">
                    <RefreshCw size={12} /> Refresh
                  </Link>
                )}
                {isFailed && (
                  <Link href="/checkout"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#F12F43] text-white
                      font-body text-[10px] font-bold uppercase tracking-[0.18em] px-5 py-3.5
                      hover:opacity-90 transition-opacity">
                    Try Again
                  </Link>
                )}
                <Link href="/books"
                  className="flex-1 flex items-center justify-center gap-2
                    border border-[#E6DFD5] bg-[#FFFCF7] text-[#242824]
                    font-body text-[10px] font-bold uppercase tracking-[0.18em] px-5 py-3.5
                    hover:border-[#203A2B] hover:bg-[#F5EFE6] transition-colors">
                  Browse Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Paid / success ─────────────────────────────────────────────────────── */
  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Breadcrumb bar ──────────────────────────────────────────────── */}
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">
          <Link href="/" className="text-[11px] font-body text-[#A8B5A0] hover:text-[#242824] transition-colors">Home</Link>
          <span className="text-[#D0CEC9] text-[11px]">›</span>
          <span className="text-[11px] font-body font-semibold text-[#242824]">Order Confirmed</span>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col gap-7">

        {/* ── Hero confirmation block ──────────────────────────────────── */}
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] overflow-hidden">

          {/* Gold top accent */}
          <div className="h-[3px] bg-gradient-to-r from-[#C6A66B]/40 via-[#C6A66B] to-[#C6A66B]/40" />

          <div className="px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center text-center gap-5">

            {/* Checkmark icon */}
            <div className="relative">
              <div className="w-16 h-16 bg-[#F5EFE6] border-2 border-[#C6A66B]/40 flex items-center justify-center">
                <CheckCircle2 size={30} className="text-[#203A2B]" strokeWidth={1.6} />
              </div>
              {/* Small gold corner dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#C6A66B]" />
            </div>

            {/* Headline */}
            <div>
              <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#A8B5A0] mb-2">
                Payment successful · Order confirmed
              </p>
              <h1 className="font-heading text-[38px] sm:text-[50px] font-bold text-[#242824] leading-[1.04]">
                Thank you,{" "}
                <span className="text-[#203A2B]">{firstName}!</span>
              </h1>
              <p className="font-body text-[13px] sm:text-[14px] text-[#777970] leading-relaxed mt-3 max-w-md mx-auto">
                Your {order.items.length === 1 ? "eBook is" : "eBooks are"} ready to download. A receipt
                and download link have been emailed to you.
              </p>
            </div>

            {/* Email pill */}
            <div className="flex items-center gap-2.5 bg-[#F5EFE6] border border-[#E6DFD5] px-5 py-2.5">
              <Mail size={12} className="text-[#A8B5A0] shrink-0" />
              <span className="font-body text-[12px] text-[#555]">{order.customerEmail}</span>
            </div>

          </div>
        </div>

        {/* ── Order receipt ────────────────────────────────────────────── */}
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] overflow-hidden">

          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#F5EFE6] border-b border-[#E6DFD5]">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#203A2B] flex items-center justify-center shrink-0">
                <Check size={10} className="text-[#FFFCF7]" strokeWidth={3} />
              </div>
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#777970]">
                Order Receipt
              </span>
            </div>
            <span className="font-body text-[9px] font-bold uppercase tracking-[0.15em] text-[#203A2B] bg-[#203A2B]/8 border border-[#203A2B]/15 px-3 py-1">
              Paid ✓
            </span>
          </div>

          {/* Receipt grid */}
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-4">
            <div>
              <p className="text-[9px] font-body font-bold uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">Order No.</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[13px] font-bold text-[#242824]">{order.orderNumber}</span>
                <CopyButton text={order.orderNumber} />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-body font-bold uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">Date</p>
              <p className="font-body text-[13px] font-semibold text-[#242824]">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-[9px] font-body font-bold uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">Customer</p>
              <p className="font-body text-[13px] font-semibold text-[#242824] truncate">{order.customerName}</p>
            </div>
            <div>
              <p className="text-[9px] font-body font-bold uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">Total Paid</p>
              <p className="font-heading text-[20px] font-bold text-[#203A2B] tabular-nums leading-none">
                {formatINR(order.totalRupees)}
              </p>
            </div>
          </div>

          {/* Discount / tax row */}
          {(order.discountRupees > 0 || order.taxRupees > 0) && (
            <div className="px-6 pb-5 border-t border-[#EDE9E0] pt-4 flex flex-col gap-2.5">
              {order.discountRupees > 0 && (
                <div className="flex items-center justify-between text-[12px] font-body">
                  <div className="flex items-center gap-2">
                    <Tag size={11} className="text-[#16a34a]" strokeWidth={2} />
                    <span className="font-mono text-[11px] font-bold bg-[#F0FAF4] border border-[#6ECC8E]/40 text-emerald-700 px-2 py-0.5">
                      {order.appliedDiscount?.couponCode ?? "DISCOUNT"}
                    </span>
                    <span className="text-emerald-700">discount applied</span>
                  </div>
                  <span className="text-emerald-700 font-semibold tabular-nums">−{formatINR(order.discountRupees)}</span>
                </div>
              )}
              {order.taxRupees > 0 && (
                <div className="flex items-center justify-between text-[12px] font-body text-[#777970]">
                  <span>Tax included</span>
                  <span className="tabular-nums">{formatINR(order.taxRupees)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Downloads ────────────────────────────────────────────────── */}
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] overflow-hidden">

          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#F5EFE6] border-b border-[#E6DFD5]">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#203A2B] flex items-center justify-center shrink-0">
                <Download size={10} className="text-[#FFFCF7]" strokeWidth={2.5} />
              </div>
              <h2 className="font-heading text-[17px] font-bold text-[#242824]">Your Downloads</h2>
            </div>
            <span className="font-body text-[10px] font-semibold text-[#A8B5A0] bg-[#FFFCF7] border border-[#E6DFD5] px-2.5 py-1">
              {order.items.length} {order.items.length === 1 ? "eBook" : "eBooks"}
            </span>
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-3">
            {order.items.map((item, i) => (
              <DownloadCard
                key={item.bookId}
                title={item.title}
                coverImageUrl={item.coverImageUrl}
                priceRupees={item.priceRupees}
                downloadUrl={`/api/downloads/secure?bookId=${item.bookId}`}
                index={i}
              />
            ))}

            {/* Library tip */}
            <div className="flex items-start gap-3 mt-1 px-4 py-3.5 bg-[#F5EFE6] border border-[#E6DFD5]">
              <Library size={13} className="text-[#203A2B] mt-0.5 shrink-0" strokeWidth={2} />
              <p className="font-body text-[11px] text-[#555] leading-relaxed">
                All purchases are saved to{" "}
                <Link href="/account/library"
                  className="font-semibold text-[#203A2B] underline underline-offset-2 hover:text-[#315B55]">
                  My Library
                </Link>
                {" "}— re-download anytime, on any device.
              </p>
            </div>
          </div>
        </div>

        {/* ── What's next ──────────────────────────────────────────────── */}
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] overflow-hidden">

          <div className="px-6 py-4 bg-[#F5EFE6] border-b border-[#E6DFD5]">
            <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">What&apos;s next</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#EDE9E0]">
            {[
              {
                href:  "/account/library",
                Icon:  Library,
                title: "My Library",
                sub:   "All your books in one place",
              },
              {
                href:  "/books",
                Icon:  ShoppingBag,
                title: "Browse More",
                sub:   "Explore the full collection",
              },
              {
                href:  "/account/orders",
                Icon:  Download,
                title: "My Orders",
                sub:   "View history & receipts",
              },
              {
                href:  "/account/downloads",
                Icon:  BookOpen,
                title: "Downloads",
                sub:   "Manage all your downloads",
              },
            ].map(({ href, Icon, title, sub }, i) => (
              <Link key={href} href={href}
                className={`group flex items-center gap-4 px-6 py-5
                  hover:bg-[#F5EFE6] transition-colors
                  ${i >= 2 ? "border-t border-[#EDE9E0]" : ""}`}>
                <div className="w-9 h-9 bg-[#203A2B]/8 border border-[#203A2B]/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-[#203A2B]" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[11px] font-bold uppercase tracking-[0.12em] text-[#242824]">{title}</p>
                  <p className="font-body text-[11px] text-[#777970] mt-0.5 leading-snug">{sub}</p>
                </div>
                <ArrowRight size={13} className="text-[#C0BAB2] group-hover:text-[#203A2B] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Footer note ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 pt-2 pb-4 text-center">
          <div className="flex items-center gap-2 text-[11px] font-body text-[#A8B5A0]">
            <BookOpen size={11} strokeWidth={1.5} />
            <span>Happy reading — we hope it stays with you.</span>
            <BookOpen size={11} strokeWidth={1.5} />
          </div>
          <p className="text-[11px] font-body text-[#C0BAB2]">
            Questions?{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-[#242824] transition-colors">
              Contact support
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
