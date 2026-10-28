import { adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";
import type { Order } from "@/types";

export const metadata: Metadata = { title: "Orders" };

interface Props { searchParams: Promise<{ status?: string }> }

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  failed: "bg-red-50 text-red-700 ring-1 ring-red-200",
  refunded: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
};

const filters = [
  { value: "", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  let query = adminDb.collection("orders").orderBy("createdAt", "desc") as FirebaseFirestore.Query;
  if (status) query = query.where("paymentStatus", "==", status);
  const snap = await query.get();
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));

  return (
    <AdminShell
      title="Orders"
      subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}${status ? ` · ${status}` : ""}`}
    >
      <div className="flex gap-1.5 flex-wrap mb-5">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/orders?status=${f.value}` : "/admin/orders"}
            className={`text-[12px] font-body font-semibold px-3.5 py-2 rounded-lg border transition-all ${
              (status ?? "") === f.value
                ? "bg-[#FFC928] text-[#080808] border-[#FFC928] shadow-sm"
                : "border-[#E6E3DD] text-[#888] hover:border-[#FFC928] hover:text-[#080808] bg-white"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-body text-[#bbb]">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[560px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Order</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Customer</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Date</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Total</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Status</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-[#080808] text-xs">{order.orderNumber}</td>
                    <td className="px-4 py-3.5 text-[#666] max-w-[180px] truncate text-xs">{order.customerEmail}</td>
                    <td className="px-4 py-3.5 text-[#aaa] whitespace-nowrap text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#080808] text-xs">{formatINR(order.totalPaise)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold ${statusStyles[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs text-[#789185] hover:text-[#080808] hover:underline font-semibold transition-colors">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
