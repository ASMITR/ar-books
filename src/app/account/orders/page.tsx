import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrdersByCustomer } from "@/lib/firebase/firestore";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";
import type { PaymentStatus } from "@/types";

export const metadata: Metadata = { title: "My Orders" };

const statusColors: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const user = await getSessionUser();
  const allOrders = await getOrdersByCustomer(user!.uid);

  const orders = status
    ? allOrders.filter((o) => o.paymentStatus === status)
    : allOrders;

  const filters: { label: string; value: string }[] = [
    { label: "All", value: "" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-4xl font-bold text-[#080808]">My Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/account/orders?status=${f.value}` : "/account/orders"}
            className={`text-xs font-body font-medium uppercase tracking-wider px-4 py-2 border transition-colors ${
              (status ?? "") === f.value
                ? "bg-[#080808] text-white border-[#080808]"
                : "border-[#E9E7E2] text-[#777777] hover:border-[#080808] hover:text-[#080808]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Your orders will appear here after purchase."
          actionLabel="Browse Books"
          actionHref="/books"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-[#E9E7E2] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-body font-semibold text-[#080808]">{order.orderNumber}</p>
                  <p className="text-xs text-[#777777] font-body mt-0.5">{formatDate(order.createdAt)}</p>
                  <p className="text-xs text-[#777777] font-body mt-1">
                    {order.items.map((i) => i.title).join(", ")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-body font-semibold text-[#080808]">{formatINR(order.totalPaise)}</span>
                  <span className={`text-xs font-body px-2 py-0.5 rounded-full ${statusColors[order.paymentStatus]}`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-xs font-body text-[#789185] underline hover:text-[#080808]"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
