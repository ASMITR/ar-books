import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrdersByCustomer, getEntitlementsByCustomer } from "@/lib/firebase/firestore";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountDashboardPage() {
  const user = await getSessionUser();
  const [orders, entitlements] = await Promise.all([
    getOrdersByCustomer(user!.uid),
    getEntitlementsByCustomer(user!.uid),
  ]);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const totalSpent = paidOrders.reduce((s, o) => s + o.totalPaise, 0);
  const recentOrders = paidOrders.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-[#080808]">
          HELLO, {(user!.displayName ?? user!.email ?? "Reader").toUpperCase()}
        </h1>
        <p className="font-body text-[#777777] text-sm mt-1">Welcome to your personal library dashboard.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard label="eBooks Owned" value={entitlements.length} />
        <DashboardStatCard label="Completed Orders" value={paidOrders.length} />
        <DashboardStatCard label="Total Spent" value={formatINR(totalSpent)} />
        <DashboardStatCard label="All Orders" value={orders.length} />
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-[#E9E7E2] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-semibold text-[#080808]">Recent Purchases</h2>
          <Link href="/account/orders" className="text-xs font-body text-[#777777] underline hover:text-[#080808]">
            View All
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm font-body text-[#777777]">
            No purchases yet.{" "}
            <Link href="/books" className="underline text-[#080808]">Browse books</Link>
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[#E9E7E2]">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-body font-medium text-[#080808]">{order.orderNumber}</p>
                  <p className="text-xs font-body text-[#777777]">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-body font-semibold">{formatINR(order.totalPaise)}</span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-xs font-body text-[#789185] underline hover:text-[#080808]"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/account/library"
          className="bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#F2B916] transition-colors"
        >
          Go to My Library
        </Link>
        <Link
          href="/books"
          className="border border-[#E9E7E2] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-white transition-colors"
        >
          Browse More Books
        </Link>
      </div>
    </div>
  );
}
