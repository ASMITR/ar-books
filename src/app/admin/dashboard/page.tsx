import { adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";
import type { Order, Book } from "@/types";
import {
  BookOpen, ShoppingBag, Users, TrendingUp,
  Clock, RefreshCw, DollarSign, BookMarked,
  PlusCircle, Tag, FileText, Settings,
} from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard" };

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  refunded: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const quickActions = [
  { href: "/admin/books", label: "Add Book", icon: PlusCircle, color: "#789185" },
  { href: "/admin/categories", label: "Categories", icon: Tag, color: "#6366f1" },
  { href: "/admin/articles", label: "New Article", icon: FileText, color: "#f59e0b" },
  { href: "/admin/settings", label: "Settings", icon: Settings, color: "#64748b" },
];

export default async function AdminDashboardPage() {
  const [booksSnap, ordersSnap, customersSnap] = await Promise.all([
    adminDb.collection("books").get(),
    adminDb.collection("orders").orderBy("createdAt", "desc").get(),
    adminDb.collection("users").get(),
  ]);

  const books = booksSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
  const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));

  const publishedBooks = books.filter((b) => b.published).length;
  const draftBooks = books.filter((b) => !b.published).length;
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const pendingOrders = orders.filter((o) => o.paymentStatus === "pending");
  const refundedOrders = orders.filter((o) => o.paymentStatus === "refunded");
  const netSales = paidOrders.reduce((s, o) => s + o.totalPaise, 0);
  const refundTotal = refundedOrders.reduce((s, o) => s + o.totalPaise, 0);
  const recentOrders = orders.slice(0, 8);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Net Revenue", value: formatINR(netSales - refundTotal), icon: DollarSign, accent: "#0a0a0a", bg: "#0a0a0a" },
    { label: "Verified Sales", value: paidOrders.length, icon: TrendingUp, accent: "#16a34a", bg: "#16a34a" },
    { label: "Customers", value: customersSnap.size, icon: Users, accent: "#6366f1", bg: "#6366f1" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, accent: "#789185", bg: "#789185" },
    { label: "Published", value: publishedBooks, icon: BookOpen, accent: "#789185", bg: "#789185" },
    { label: "Drafts", value: draftBooks, icon: BookMarked, accent: "#94a3b8", bg: "#94a3b8" },
    { label: "Pending", value: pendingOrders.length, icon: Clock, accent: "#d97706", bg: "#d97706" },
    { label: "Refunds", value: refundedOrders.length, icon: RefreshCw, accent: "#dc2626", bg: "#dc2626" },
  ];

  return (
    <AdminShell
      title="Dashboard"
      subtitle={`${greeting} 👋`}
      action={
        <Link
          href="/admin/books"
          className="flex items-center gap-2 bg-[#0a0a0a] text-white text-[14px] font-body font-semibold px-5 py-2.5 rounded-lg hover:bg-[#222] transition-colors shadow-sm"
        >
          <PlusCircle size={15} />
          Add Book
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-[#E8E6E1] p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg + "15" }}>
                <Icon size={18} style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-[12px] font-body font-semibold uppercase tracking-[0.07em] text-[#b0aca6] leading-none mb-1.5">{label}</p>
                <p className="font-heading text-[18px] sm:text-[22px] font-bold text-[#0a0a0a] leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white border border-[#E8E6E1] rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#F0EEE9] bg-[#FAFAF8]">
              <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a] tracking-tight">Recent Orders</h2>
              <Link href="/admin/orders" className="text-[13px] font-body text-[#789185] hover:underline font-semibold">View all →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <ShoppingBag size={30} className="text-[#e0e0e0] mx-auto mb-3" />
                <p className="text-[14px] font-body text-[#bbb]">No orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-body min-w-[520px]">
                  <thead>
                    <tr className="border-b border-[#F0EEE9] bg-[#FAFAF8]">
                      {["Order", "Customer", "Date", "Total", "Status"].map(h => (
                        <th key={h} className="text-left px-4 sm:px-6 py-3 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold first:pl-4 sm:first:pl-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F3F0]">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-4 sm:px-6 py-3">
                          <Link href={`/admin/orders/${order.id}`} className="text-[#789185] hover:underline font-semibold text-[13px]">{order.orderNumber}</Link>
                        </td>
                        <td className="px-4 py-3 text-[#666] max-w-[140px] truncate text-[13px]">{order.customerEmail}</td>
                        <td className="px-4 py-3 text-[#aaa] whitespace-nowrap text-[13px]">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3 font-semibold text-[#0a0a0a] text-[13px]">{formatINR(order.totalPaise)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold ${statusStyles[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick actions + catalog summary */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#F0EEE9] bg-[#FAFAF8]">
                <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a] tracking-tight">Quick Actions</h2>
              </div>
              <div className="p-2">
                {quickActions.map(({ href, label, icon: Icon, color }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#F4F3F0] transition-colors group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <span className="text-[14px] font-body text-[#444] group-hover:text-[#0a0a0a] font-medium">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 shadow-sm">
              <p className="text-[12px] font-body font-semibold text-[#b0aca6] uppercase tracking-[0.07em] mb-3">Catalog</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Published books", value: publishedBooks },
                  { label: "Draft books", value: draftBooks },
                  { label: "Total customers", value: customersSnap.size },
                  { label: "Total orders", value: orders.length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[13px] font-body text-[#888]">{label}</span>
                    <span className="text-[15px] font-heading font-bold text-[#0a0a0a]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
