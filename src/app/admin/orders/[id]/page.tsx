import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookCover } from "@/components/book/BookCover";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Order } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Detail" };

interface Props { params: Promise<{ id: string }> }

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  failed: "bg-red-50 text-red-700 ring-1 ring-red-200",
  refunded: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const doc = await adminDb.collection("orders").doc(id).get();
  if (!doc.exists) notFound();
  const order = { id: doc.id, ...doc.data() } as Order;

  return (
    <AdminShell
      title={order.orderNumber}
      subtitle={`Placed on ${formatDate(order.createdAt)}`}
      action={
        <Link href="/admin/orders" className="text-xs font-body text-[#888] hover:text-[#0a0a0a] transition-colors font-medium">
          ← Back to Orders
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Order details */}
          <div className="bg-white border border-[#E9E7E2] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E9E7E2]">
              <h2 className="font-heading text-sm font-bold text-[#0a0a0a]">Order Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#F7F6F3]">
              {[
                { label: "Customer", value: order.customerName },
                { label: "Email", value: order.customerEmail },
                { label: "Payment Status", value: order.paymentStatus, badge: true },
                { label: "Fulfillment", value: order.fulfillmentStatus, badge: true },
                { label: "Total", value: formatINR(order.totalPaise) },
                { label: "Date", value: formatDate(order.createdAt) },
              ].map(({ label, value, badge }) => (
                <div key={label} className="bg-white px-5 py-4">
                  <p className="text-[11px] font-body uppercase tracking-wider text-[#bbb] mb-1.5">{label}</p>
                  {badge ? (
                    <span className={`px-2.5 py-1 text-[11px] rounded-full font-medium ${statusStyles[value] ?? "bg-gray-100 text-gray-600"}`}>{value}</span>
                  ) : (
                    <p className="text-sm font-body font-semibold text-[#0a0a0a] break-all">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-[#E9E7E2] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E9E7E2]">
              <h2 className="font-heading text-sm font-bold text-[#0a0a0a]">Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-[#F7F6F3]">
              {order.items.map((item) => (
                <div key={item.bookId} className="flex gap-4 items-center px-5 py-4">
                  <BookCover src={item.coverImageUrl} title={item.title} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm font-semibold text-[#0a0a0a] truncate">{item.title}</p>
                    <p className="text-xs font-body text-[#aaa] mt-0.5">ID: {item.bookId}</p>
                  </div>
                  <p className="font-semibold text-[#0a0a0a] shrink-0 text-sm">{formatINR(item.pricePaise)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment reference */}
        <div className="bg-white border border-[#E9E7E2] rounded-xl overflow-hidden self-start">
          <div className="px-5 py-4 border-b border-[#E9E7E2]">
            <h2 className="font-heading text-sm font-bold text-[#0a0a0a]">Payment Reference</h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {[
              { label: "Razorpay Order ID", value: order.razorpayOrderId ?? "—" },
              { label: "Razorpay Payment ID", value: order.razorpayPaymentId ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] font-body uppercase tracking-wider text-[#bbb] mb-1">{label}</p>
                <p className="text-xs font-mono text-[#0a0a0a] break-all">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
