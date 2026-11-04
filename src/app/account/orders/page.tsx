import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrdersByCustomer } from "@/lib/firebase/firestore";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import type { PaymentStatus } from "@/types";

export const metadata: Metadata = { title: "My Orders" };

const STATUS: Record<PaymentStatus, { label: string; cls: string; dot: string }> = {
  paid:     { label: "Paid",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-500" },
  pending:  { label: "Pending",  cls: "bg-amber-50  text-amber-700  border-amber-200/80",    dot: "bg-amber-400"   },
  failed:   { label: "Failed",   cls: "bg-red-50    text-red-700    border-red-200/80",      dot: "bg-red-500"     },
  refunded: { label: "Refunded", cls: "bg-gray-50   text-gray-600   border-gray-200/80",     dot: "bg-gray-400"    },
};

interface Props { searchParams: Promise<{ status?: string }>; }

export default async function OrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const user       = await getSessionUser();
  const allOrders  = await getOrdersByCustomer(user!.uid);
  const orders     = status ? allOrders.filter((o) => o.paymentStatus === status) : allOrders;

  const filters = [
    { label: "All",      value: "" },
    { label: "Paid",     value: "paid" },
    { label: "Pending",  value: "pending" },
    { label: "Failed",   value: "failed" },
    { label: "Refunded", value: "refunded" },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.28em] text-[#B8B3AB] mb-1.5">Purchase history</p>
          <h1 className="font-heading text-[28px] sm:text-[32px] font-bold text-[#111] leading-none">My Orders</h1>
        </div>
        {allOrders.length > 0 && (
          <span className="font-body text-[12px] text-[#B8B3AB] shrink-0">{allOrders.length} total</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {filters.map((f) => {
          const active = (status ?? "") === f.value;
          return (
            <Link key={f.value}
              href={f.value ? `/account/orders?status=${f.value}` : "/account/orders"}
              className={`shrink-0 text-[11px] font-body font-semibold uppercase tracking-[0.09em] px-4 py-2 rounded-xl border transition-colors ${
                active
                  ? "bg-[#0D1F17] text-white border-[#0D1F17]"
                  : "border-black/[0.08] text-[#777] bg-white hover:border-black/[0.15] hover:text-[#111]"
              }`}>
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Empty */}
      {orders.length === 0 ? (
        <div className="bg-white border border-black/[0.06] rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center gap-4">
          <div className="w-11 h-11 bg-[#F5F2EE] rounded-2xl flex items-center justify-center">
            <ShoppingBag size={18} className="text-[#C8C3BC]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-[17px] font-bold text-[#111] mb-1">
              {status ? `No ${status} orders` : "No orders yet"}
            </h3>
            <p className="font-body text-[13px] text-[#999]">Your orders will appear here after purchase.</p>
          </div>
          <Link href="/books"
            className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.14em] px-5 py-2.5 rounded-xl hover:bg-[#203A2B] transition-colors">
            <ShoppingBag size={12} /> Browse Books
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {orders.map((order) => {
            const s = STATUS[order.paymentStatus];
            return (
              <Link key={order.id} href={`/account/orders/${order.id}`}
                className="group bg-white border border-black/[0.06] hover:border-black/[0.1] hover:shadow-sm transition-all duration-200 rounded-2xl p-4 sm:p-5 block">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[13px] font-bold text-[#111] tracking-tight">{order.orderNumber}</span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-body font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${s.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-body text-[#B8B3AB] mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-heading text-[16px] sm:text-[18px] font-bold text-[#203A2B] tabular-nums">{formatINR(order.totalPaise)}</span>
                    <ArrowRight size={13} className="text-[#D0CCC6] group-hover:text-[#203A2B] transition-colors" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {order.items.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-body text-[#666] bg-[#F5F2EE] px-2.5 py-1 rounded-lg">
                      <BookOpen size={9} className="text-[#B8B3AB] shrink-0" />
                      <span className="truncate max-w-[140px] sm:max-w-none">{item.title}</span>
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
