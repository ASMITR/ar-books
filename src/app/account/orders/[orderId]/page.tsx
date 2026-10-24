import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrderById } from "@/lib/firebase/firestore";
import { BookCover } from "@/components/book/BookCover";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { Download } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Details" };

interface Props { params: Promise<{ orderId: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  const [user, order] = await Promise.all([getSessionUser(), getOrderById(orderId)]);

  if (!order) notFound();
  if (order.customerId !== user!.uid) notFound(); // ownership check

  return (
    <div className="flex flex-col gap-6">
      <Link href="/account/orders" className="text-xs font-body text-[#777777] hover:text-[#080808] underline w-fit">
        ← My Orders
      </Link>

      <h1 className="font-heading text-3xl font-bold text-[#080808]">{order.orderNumber}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Date", value: formatDate(order.createdAt) },
          { label: "Status", value: order.paymentStatus },
          { label: "Total", value: formatINR(order.totalPaise) },
          { label: "Currency", value: order.currency },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E9E7E2] p-4">
            <p className="text-xs font-body uppercase tracking-wider text-[#777777] mb-1">{label}</p>
            <p className="font-body font-semibold text-[#080808] capitalize">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E9E7E2] p-6">
        <h2 className="font-heading text-xl font-semibold text-[#080808] mb-5">Items</h2>
        <div className="flex flex-col divide-y divide-[#E9E7E2]">
          {order.items.map((item) => (
            <div key={item.bookId} className="flex gap-4 items-center py-4">
              <BookCover src={item.coverImageUrl} title={item.title} size="sm" />
              <div className="flex-1">
                <p className="font-heading text-base font-semibold text-[#080808]">{item.title}</p>
                <p className="text-sm font-body text-[#777777]">{formatINR(item.pricePaise)}</p>
              </div>
              {order.paymentStatus === "paid" && (
                <a
                  href={`/api/downloads/secure?bookId=${item.bookId}`}
                  className="flex items-center gap-2 bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-[#F2B916] transition-colors shrink-0"
                >
                  <Download size={12} />
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-[#E9E7E2] pt-4 mt-2 flex justify-between font-body font-bold text-[#080808]">
          <span>Total</span>
          <span>{formatINR(order.totalPaise)}</span>
        </div>
      </div>

      {order.razorpayPaymentId && (
        <p className="text-xs font-body text-[#777777]">Payment ID: {order.razorpayPaymentId}</p>
      )}
    </div>
  );
}
