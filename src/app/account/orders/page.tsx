import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrdersByCustomer } from "@/lib/firebase/firestore";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import type { PaymentStatus } from "@/types";

export const metadata: Metadata = { title: "My Orders" };

const STATUS_CONFIG: Record<PaymentStatus, { label: string; dot: string; text: string; bg: string }> = {
  paid:     { label: "Paid",     dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  pending:  { label: "Pending",  dot: "bg-[#FFC928]",   text: "text-yellow-700", bg: "bg-yellow-50  border-yellow-200"  },
  failed:   { label: "Failed",   dot: "bg-[#F12F43]",   text: "text-red-700",    bg: "bg-red-50     border-red-200"     },
  refunded: { label: "Refunded", dot: "bg-[#A8B5A0]",   text: "text-gray-600",  bg: "bg-gray-50    border-gray-200"    },
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const user      = await getSessionUser();
  const allOrders = await getOrdersByCustomer(user!.uid);
  const orders    = status ? allOrders.filter((o) => o.paymentStatus === status) : allOrders;

  const filters = [
    { label: "All",      value: "" },
    { label: "Paid",     value: "paid" },
    { label: "Pending",  value: "pending" },
    { label: "Failed",   value: "failed" },
    { label: "Refunded", value: "refunded" },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Purchase history</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808] leading-none">My Orders</h1>
        </div>
        {allOrders.length > 0 && (
          <span className="font-body text-[12px] text-[#A8B5A0] pb-0.5">{allOrders.length} total</span>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => {
          const active = (status ?? "") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value ? `/account/orders?status=${f.value}` : "/account/orders"}
              className={`text-[11px] font-body font-semibold uppercase tracking-[0.12em] px-4 py-2 border transition-colors
                ${active
                  ? "bg-[#203A2B] text-[#FFFCF7] border-[#203A2B]"
                  : "border-[#E6DFD5] text-[#777777] bg-white hover:border-[#203A2B] hover:text-[#203A2B]"
                }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {orders.length === 0 ? (
        <div className="bg-white border border-[#E6DFD5] flex flex-col items-center justify-center py-20 px-4 text-center gap-5">
          <div className="w-16 h-16 bg-[#F5EFE6] flex items-center justify-center">
            <ShoppingBag size={24} className="text-[#C6A66B]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[#080808] mb-1">
              {status ? `No ${status} orders` : "No orders yet"}
            </h3>
            <p className="font-body text-sm text-[#777777]">Your orders will appear here after purchase.</p>
          </div>
          <Link
            href="/books"
            className="flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3 hover:bg-[#315B55] transition-colors"
          >
            <ShoppingBag size={13} /> Browse Books
          </Link>
        </div>
      ) : (
        /* ── Order list ─────────────────────────────────────────────────── */
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const s = STATUS_CONFIG[order.paymentStatus];
            return (
              <div
                key={order.id}
                className="group bg-white border border-[#E6DFD5] hover:border-[#C6A66B] hover:shadow-sm transition-all duration-200"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

                  {/* Left: order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="font-mono text-[13px] font-semibold text-[#080808] tracking-tight">
                        {order.orderNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-body font-bold uppercase tracking-wider border px-2 py-0.5 ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-body text-[#A8B5A0]">
                      {formatDate(order.createdAt)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {order.items.map((item, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-body text-[#555] bg-[#FAF9F6] border border-[#F0EEE9] px-2 py-0.5"
                        >
                          <BookOpen size={10} className="text-[#A8B5A0]" />
                          {item.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: price + action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                    <span className="font-heading text-lg font-bold text-[#203A2B] tabular-nums">
                      {formatINR(order.totalPaise)}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="flex items-center gap-1.5 text-[11px] font-body font-semibold text-[#789185] hover:text-[#203A2B] transition-colors"
                    >
                      View Details <ArrowRight size={11} />
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
