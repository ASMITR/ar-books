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
  PlusCircle, Tag, FileText, Settings, ArrowRight,
} from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { ClearCacheButton } from "@/components/admin/ClearCacheButton";

export const metadata: Metadata = { title: "Admin Dashboard" };

const statusStyles: Record<string, { cls: string; dot: string }> = {
  paid:     { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80", dot: "bg-emerald-500" },
  pending:  { cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",       dot: "bg-amber-400"   },
  refunded: { cls: "bg-red-50 text-red-700 ring-1 ring-red-200/80",             dot: "bg-red-500"     },
};

const quickActions = [
  { href: "/admin/books",      label: "Add Book",    icon: PlusCircle, color: "#203A2B" },
  { href: "/admin/categories", label: "Categories",  icon: Tag,        color: "#6366f1" },
  { href: "/admin/articles",   label: "New Article", icon: FileText,   color: "#f59e0b" },
  { href: "/admin/settings",   label: "Settings",    icon: Settings,   color: "#64748b" },
];

export default async function AdminDashboardPage() {
  const [booksSnap, ordersSnap, customersSnap] = await Promise.all([
    adminDb.collection("books").get(),
    adminDb.collection("orders").orderBy("createdAt", "desc").get(),
    adminDb.collection("users").get(),
  ]);

  const books  = booksSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
  const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));

  const publishedBooks  = books.filter((b) => b.published).length;
  const draftBooks      = books.filter((b) => !b.published).length;
  const paidOrders      = orders.filter((o) => o.paymentStatus === "paid");
  const pendingOrders   = orders.filter((o) => o.paymentStatus === "pending");
  const refundedOrders  = orders.filter((o) => o.paymentStatus === "refunded");
  const netSales        = paidOrders.reduce((s, o) => s + o.totalPaise, 0);
  const refundTotal     = refundedOrders.reduce((s, o) => s + o.totalPaise, 0);
  const recentOrders    = orders.slice(0, 8);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const primaryStats = [
    { label: "Net Revenue",     value: formatINR(netSales - refundTotal), icon: DollarSign, accent: "#0a0a0a",  bg: "#FFC928" },
    { label: "Verified Sales",  value: paidOrders.length,                 icon: TrendingUp, accent: "#16a34a",  bg: "#16a34a" },
    { label: "Customers",       value: customersSnap.size,                icon: Users,      accent: "#6366f1",  bg: "#6366f1" },
    { label: "Total Orders",    value: orders.length,                     icon: ShoppingBag,accent: "#789185",  bg: "#789185" },
  ];

  const secondaryStats = [
    { label: "Published",  value: publishedBooks,       icon: BookOpen,   accent: "#203A2B", bg: "#203A2B" },
    { label: "Drafts",     value: draftBooks,           icon: BookMarked, accent: "#94a3b8", bg: "#94a3b8" },
    { label: "Pending",    value: pendingOrders.length, icon: Clock,      accent: "#d97706", bg: "#d97706" },
    { label: "Refunds",    value: refundedOrders.length,icon: RefreshCw,  accent: "#dc2626", bg: "#dc2626" },
  ];

  return (
    <AdminShell
      title="Dashboard"
      subtitle={`${greeting} 👋`}
      action={
        <div className="flex items-center gap-2">
          <ClearCacheButton />
          <Link href="/admin/books">
            <AdminButton icon={<PlusCircle />}>Add Book</AdminButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-5">

        {/* Primary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {primaryStats.map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#E8E4DE] p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg + "15" }}>
                <Icon size={17} style={{ color: accent }} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10.5px] font-body font-semibold uppercase tracking-[0.09em] text-[#b5b0a9] leading-none mb-1.5">{label}</p>
                <p className="font-heading text-[20px] sm:text-[24px] font-bold text-[#0a0a0a] leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {secondaryStats.map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} className="bg-white/60 rounded-xl border border-[#E8E4DE] px-4 py-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg + "12" }}>
                <Icon size={14} style={{ color: accent }} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-body font-semibold uppercase tracking-[0.09em] text-[#b5b0a9] leading-none mb-1">{label}</p>
                <p className="font-heading text-[17px] font-bold text-[#0a0a0a] leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white border border-[#E8E4DE] rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#EDE9E3]">
              <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a] tracking-tight">Recent Orders</h2>
              <Link href="/admin/orders"
                className="inline-flex items-center gap-1 text-[12px] font-body text-[#999] hover:text-[#0a0a0a] font-semibold transition-colors">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <ShoppingBag size={26} className="text-[#ddd] mx-auto mb-3" />
                <p className="text-[13px] font-body text-[#bbb]">No orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-body min-w-[520px]">
                  <thead>
                    <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                      {["Order", "Customer", "Date", "Total", "Status"].map(h => (
                        <th key={h} className="text-left px-5 sm:px-6 py-3 text-[10.5px] uppercase tracking-[0.09em] text-[#b5b0a9] font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F1EC]">
                    {recentOrders.map((order) => {
                      const s = statusStyles[order.paymentStatus];
                      return (
                        <tr key={order.id} className="hover:bg-[#FAF9F6] transition-colors">
                          <td className="px-5 sm:px-6 py-3.5">
                            <Link href={`/admin/orders/${order.id}`} className="text-[#789185] hover:text-[#203A2B] font-semibold text-[12.5px] transition-colors">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3.5 text-[#777] max-w-[140px] truncate text-[12.5px]">{order.customerEmail}</td>
                          <td className="px-4 py-3.5 text-[#aaa] whitespace-nowrap text-[12.5px]">{formatDate(order.createdAt)}</td>
                          <td className="px-4 py-3.5 font-semibold text-[#0a0a0a] text-[12.5px]">{formatINR(order.totalPaise)}</td>
                          <td className="px-4 py-3.5">
                            {s ? (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] rounded-full font-semibold ${s.cls}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                {order.paymentStatus}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10.5px] rounded-full font-semibold bg-gray-100 text-gray-600">
                                {order.paymentStatus}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Quick actions */}
            <div className="bg-white border border-[#E8E4DE] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#EDE9E3]">
                <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a] tracking-tight">Quick Actions</h2>
              </div>
              <div className="p-2">
                {quickActions.map(({ href, label, icon: Icon, color }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#FAF9F6] transition-colors group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "15" }}>
                      <Icon size={14} style={{ color }} strokeWidth={2} />
                    </div>
                    <span className="text-[13px] font-body text-[#666] group-hover:text-[#0a0a0a] font-medium transition-colors">{label}</span>
                    <ArrowRight size={11} className="ml-auto text-[#D0CCC6] group-hover:text-[#999] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Catalog summary */}
            <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 shadow-sm">
              <p className="text-[10.5px] font-body font-semibold text-[#b5b0a9] uppercase tracking-[0.09em] mb-4">Catalog Summary</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Published books",  value: publishedBooks       },
                  { label: "Draft books",       value: draftBooks           },
                  { label: "Total customers",   value: customersSnap.size   },
                  { label: "Total orders",      value: orders.length        },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[12.5px] font-body text-[#999]">{label}</span>
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
