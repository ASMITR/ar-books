import { adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import type { Order } from "@/types";
import { DollarSign, CheckCircle } from "lucide-react";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const snap = await adminDb.collection("orders").where("paymentStatus", "==", "paid").orderBy("paidAt", "desc").get();
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  const totalRevenue = orders.reduce((s, o) => s + o.totalPaise, 0);

  const stats = [
    { label: "Total Revenue", value: formatINR(totalRevenue), icon: DollarSign, accent: "#080808", bg: "#FFC928" },
    { label: "Verified Payments", value: orders.length, icon: CheckCircle, accent: "#16a34a", bg: "#16a34a" },
  ];

  return (
    <AdminShell title="Payments" subtitle="All verified payments from Razorpay">
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mb-5">
          {stats.map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-[#E6E3DD] p-4 sm:p-5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg + "18" }}>
                <Icon size={18} style={{ color: accent }} />
              </div>
              <div>
                <p className="text-[11px] font-body uppercase tracking-[0.07em] text-[#b0aca6] leading-none mb-1">{label}</p>
                <p className="font-heading text-xl font-bold text-[#080808] leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-body text-[#bbb]">No verified payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body min-w-[560px]">
                <thead>
                  <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Order</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Customer</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Razorpay ID</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Amount</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Paid At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F0EC]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-[#080808] text-xs">{order.orderNumber}</td>
                      <td className="px-4 py-3.5 text-[#666] max-w-[160px] truncate text-xs">{order.customerEmail}</td>
                      <td className="px-4 py-3.5 text-[#aaa] font-mono text-xs">{order.razorpayPaymentId ?? "—"}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#080808] text-xs">{formatINR(order.totalPaise)}</td>
                      <td className="px-4 py-3.5 text-[#aaa] whitespace-nowrap text-xs">{order.paidAt ? formatDate(order.paidAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
