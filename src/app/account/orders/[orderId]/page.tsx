import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrderById } from "@/lib/firebase/firestore";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Download, Tag, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import type { PaymentStatus } from "@/types";

export const metadata: Metadata = { title: "Order Details" };
interface Props { params: Promise<{ orderId: string }> }

const STATUS: Record<PaymentStatus, { label: string; icon: React.ElementType; cls: string; dot: string }> = {
  paid:     { label: "Paid",     icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  pending:  { label: "Pending",  icon: Clock,        cls: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400"   },
  failed:   { label: "Failed",   icon: XCircle,      cls: "bg-red-50    text-red-700    border-red-200",      dot: "bg-red-500"     },
  refunded: { label: "Refunded", icon: RefreshCw,    cls: "bg-gray-50   text-gray-600   border-gray-200",     dot: "bg-gray-400"    },
};

export default async function OrderDetailPage({ params }: Props) {
  const { orderId }   = await params;
  const [user, order] = await Promise.all([getSessionUser(), getOrderById(orderId)]);
  if (!order) notFound();
  if (order.customerId !== user!.uid) notFound();

  const s           = STATUS[order.paymentStatus];
  const StatusIcon  = s.icon;
  const isPaid      = order.paymentStatus === "paid";
  const hasDiscount = order.discountRupees > 0;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">

      {/* ── Back nav ────────────────────────────────────────────────────── */}
      <div>
        <Link href="/account/orders"
          className="inline-flex items-center gap-1.5 text-[11px] font-body text-[#B8B3AB] hover:text-[#111] transition-colors mb-4">
          <ArrowLeft size={12} /> Back to orders
        </Link>

        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#B8B3AB] mb-1">Order details</p>
            <h1 className="font-heading text-[22px] sm:text-[28px] font-bold text-[#111] font-mono tracking-tight">
              {order.orderNumber}
            </h1>
          </div>
          <span className={`inline-flex items-center gap-2 text-[11px] font-body font-bold uppercase tracking-wider border px-3.5 py-2 rounded-2xl ${s.cls}`}>
            <StatusIcon size={13} strokeWidth={2} />
            {s.label}
          </span>
        </div>
      </div>

      {/* ── Meta cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: "Order Date", value: formatDate(order.createdAt) },
          { label: "Customer",   value: order.customerName          },
          { label: "Email",      value: order.customerEmail         },
          { label: "Currency",   value: order.currency.toUpperCase()},
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-black/[0.06] rounded-2xl p-3.5 sm:p-4">
            <p className="text-[9px] sm:text-[10px] font-body uppercase tracking-[0.15em] text-[#B8B3AB] mb-1.5">{label}</p>
            <p className="text-[12px] sm:text-[13px] font-body font-semibold text-[#111] truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Items ───────────────────────────────────────────────────────── */}
      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#F2EFE9] rounded-xl flex items-center justify-center shrink-0">
              <BookOpen size={13} className="text-[#203A2B]" strokeWidth={2} />
            </div>
            <h2 className="font-heading text-[14px] font-semibold text-[#111]">
              {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
            </h2>
          </div>
          {isPaid && (
            <span className="text-[10px] font-body font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
              Ready to download
            </span>
          )}
        </div>

        <div className="divide-y divide-black/[0.04]">
          {order.items.map((item) => (
            <div key={item.bookId} className="p-4 sm:p-5 flex gap-4 items-center">
              <div className="relative w-[44px] h-[60px] sm:w-[50px] sm:h-[68px] shrink-0 overflow-hidden rounded-xl bg-[#0D1F17] shadow-sm">
                {item.coverImageUrl ? (
                  <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" sizes="50px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={12} className="text-white/30" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-[14px] sm:text-[15px] font-bold text-[#111] line-clamp-2 leading-snug">{item.title}</p>
                <p className="font-body text-[12px] font-bold text-[#203A2B] mt-1 tabular-nums">{formatINR(item.priceRupees)}</p>
              </div>
              {isPaid && (
                <a href={`/api/downloads/secure?bookId=${item.bookId}`}
                  className="shrink-0 flex items-center gap-1.5 bg-[#0D1F17] text-[#FFC928] font-body text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-2.5 rounded-xl hover:bg-[#203A2B] transition-colors">
                  <Download size={11} />
                  <span className="hidden sm:inline">Download</span>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Pricing summary */}
        <div className="border-t border-black/[0.05] bg-[#FAFAF8] px-5 sm:px-6 py-4 flex flex-col gap-2.5">
          <div className="flex justify-between text-[13px] font-body text-[#888]">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatINR(order.subtotalRupees)}</span>
          </div>
          {hasDiscount && (
            <div className="flex justify-between text-[13px] font-body text-emerald-700">
              <span className="flex items-center gap-1.5">
                <Tag size={11} />
                {order.appliedDiscount?.couponCode
                  ? <span className="font-mono text-xs">{order.appliedDiscount.couponCode}</span>
                  : "Discount"}
              </span>
              <span className="tabular-nums">−{formatINR(order.discountRupees)}</span>
            </div>
          )}
          {order.taxRupees > 0 && (
            <div className="flex justify-between text-[13px] font-body text-[#888]">
              <span>Tax</span>
              <span className="tabular-nums">{formatINR(order.taxRupees)}</span>
            </div>
          )}
          <div className="flex justify-between font-heading font-bold text-[#111] text-[16px] border-t border-black/[0.06] pt-3 mt-0.5">
            <span>Total Paid</span>
            <span className="text-[#203A2B] tabular-nums">{formatINR(order.totalRupees)}</span>
          </div>
        </div>
      </div>

      {order.razorpayPaymentId && (
        <p className="text-[11px] font-body text-[#B8B3AB]">
          Payment ref: <span className="font-mono text-[#555]">{order.razorpayPaymentId}</span>
        </p>
      )}
    </div>
  );
}
