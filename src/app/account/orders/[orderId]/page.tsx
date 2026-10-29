import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrderById } from "@/lib/firebase/firestore";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Download, Tag } from "lucide-react";
import type { Metadata } from "next";
import type { PaymentStatus } from "@/types";

export const metadata: Metadata = { title: "Order Details" };

interface Props { params: Promise<{ orderId: string }> }

const STATUS_CONFIG: Record<PaymentStatus, { label: string; dot: string; text: string; bg: string }> = {
  paid:     { label: "Paid",     dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  pending:  { label: "Pending",  dot: "bg-[#FFC928]",   text: "text-yellow-700", bg: "bg-yellow-50  border-yellow-200"  },
  failed:   { label: "Failed",   dot: "bg-[#F12F43]",   text: "text-red-700",    bg: "bg-red-50     border-red-200"     },
  refunded: { label: "Refunded", dot: "bg-[#A8B5A0]",   text: "text-gray-600",  bg: "bg-gray-50    border-gray-200"    },
};

export default async function OrderDetailPage({ params }: Props) {
  const { orderId }   = await params;
  const [user, order] = await Promise.all([getSessionUser(), getOrderById(orderId)]);

  if (!order) notFound();
  if (order.customerId !== user!.uid) notFound();

  const s           = STATUS_CONFIG[order.paymentStatus];
  const isPaid      = order.paymentStatus === "paid";
  const hasDiscount = order.discountPaise > 0;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Back + heading ─────────────────────────────────────────────── */}
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-[11px] font-body text-[#A8B5A0] hover:text-[#203A2B] transition-colors mb-4"
        >
          <ArrowLeft size={12} /> Back to orders
        </Link>
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Order details</p>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080808] font-mono tracking-tight">
              {order.orderNumber}
            </h1>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-body font-bold uppercase tracking-wider border px-3 py-1.5 ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>
      </div>

      {/* ── Meta grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Order Date",  value: formatDate(order.createdAt) },
          { label: "Customer",    value: order.customerName },
          { label: "Email",       value: order.customerEmail },
          { label: "Currency",    value: order.currency.toUpperCase() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E6DFD5] p-4">
            <p className="text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1">{label}</p>
            <p className="text-[13px] font-body font-semibold text-[#080808] truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Items ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6DFD5]">
        <div className="px-5 py-4 border-b border-[#E6DFD5] flex items-center gap-2">
          <BookOpen size={14} className="text-[#203A2B]" strokeWidth={2} />
          <h2 className="font-heading text-base font-semibold text-[#080808]">
            {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
          </h2>
        </div>

        <div className="divide-y divide-[#F0EEE9]">
          {order.items.map((item) => (
            <div key={item.bookId} className="p-5 flex gap-4 items-center">
              <div className="relative w-[46px] h-[64px] shrink-0 overflow-hidden bg-gradient-to-br from-[#203A2B] to-[#315B55] shadow-sm">
                {item.coverImageUrl ? (
                  <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" sizes="46px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={14} className="text-[#A8B5A0]" strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-[15px] font-bold text-[#080808] line-clamp-2 leading-snug">
                  {item.title}
                </p>
                <p className="font-body text-[13px] font-bold text-[#203A2B] mt-1 tabular-nums">
                  {formatINR(item.pricePaise)}
                </p>
              </div>
              {isPaid && (
                <a
                  href={`/api/downloads/secure?bookId=${item.bookId}`}
                  className="shrink-0 flex items-center gap-1.5 bg-[#203A2B] text-[#FFC928] font-body text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-2.5 hover:bg-[#315B55] transition-colors"
                >
                  <Download size={12} /> Download
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Pricing breakdown */}
        <div className="border-t border-[#E6DFD5] px-5 py-4 flex flex-col gap-2">
          <div className="flex justify-between text-sm font-body text-[#777777]">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatINR(order.subtotalPaise)}</span>
          </div>
          {hasDiscount && (
            <div className="flex justify-between text-sm font-body text-emerald-700">
              <span className="flex items-center gap-1.5">
                <Tag size={11} />
                {order.appliedDiscount?.couponCode
                  ? <span className="font-mono text-xs tracking-wide">{order.appliedDiscount.couponCode}</span>
                  : "Discount"}
              </span>
              <span className="tabular-nums">−{formatINR(order.discountPaise)}</span>
            </div>
          )}
          <div className="flex justify-between font-heading font-bold text-[#080808] text-base border-t border-[#E6DFD5] pt-3 mt-1">
            <span>Total Paid</span>
            <span className="text-[#203A2B] tabular-nums">{formatINR(order.totalPaise)}</span>
          </div>
        </div>
      </div>

      {/* ── Payment ref ────────────────────────────────────────────────── */}
      {order.razorpayPaymentId && (
        <p className="text-[11px] font-body text-[#A8B5A0]">
          Payment reference: <span className="font-mono text-[#555]">{order.razorpayPaymentId}</span>
        </p>
      )}

    </div>
  );
}
