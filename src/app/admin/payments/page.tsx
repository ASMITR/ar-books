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
    { label: "Total Revenue", value: formatINR(totalRevenue), icon: DollarSign, accent: "#0a0a0a" },
    { label: "Verified Payments", value: orders.length, icon: CheckCircle, accent: "#16a34a" },
  ];

  return (
    <AdminShell title="Payments" subtitle="All verified payments from Razorpay">
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mb-5">
          {stats.map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="bg-white rounded-xl border border-[#E9E7E2] p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accent + "15" }}>
                <Icon size={18} style={{ color: accent }} />
              </div>
              <div>
                <p className="text-[11px] font-body uppercase tracking-wider text-[#aaa] leading-none mb-1">{label}</p>
                <p className="font-heading text-xl font-bold text-[#0a0a0a] leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E9E7E2] rounded-xl overflow-hidden">
          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-body text-[#bbb]">No verified payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body min-w-[560px]">
                <thead>
                  <tr className="border-b border-[#F0EFEB]">
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Order</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Customer</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Razorpay ID</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Amount</th>
                    <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-wider text-[#bbb] font-medium">Paid At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F6F3]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-[#0a0a0a] text-xs">{order.orderNumber}</td>
                      <td className="px-4 py-3.5 text-[#666] max-w-[160px] truncate text-xs">{order.customerEmail}</td>
                      <td className="px-4 py-3.5 text-[#aaa] font-mono text-xs">{order.razorpayPaymentId ?? "—"}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#0a0a0a] text-xs">{formatINR(order.totalPaise)}</td>
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
