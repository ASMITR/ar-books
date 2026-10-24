import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { BookCover } from "@/components/book/BookCover";
import { formatDate } from "@/lib/utils";
import { formatINR } from "@/lib/currency";
import { CheckCircle, Clock, XCircle, Download } from "lucide-react";
import type { Order } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Thank You for Your Purchase" };

interface Props {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const { order_id } = await searchParams;
  if (!order_id) redirect("/books");

  const doc = await adminDb.collection("orders").doc(order_id).get();
  if (!doc.exists) notFound();

  const order = { id: doc.id, ...doc.data() } as Order;

  const statusIcon = {
    paid: <CheckCircle size={48} className="text-green-500" />,
    pending: <Clock size={48} className="text-[#FFC928]" />,
    failed: <XCircle size={48} className="text-[#F12F43]" />,
    refunded: <XCircle size={48} className="text-[#777777]" />,
  }[order.paymentStatus];

  const statusMessage = {
    paid: "Your payment was successful!",
    pending: "Your payment is being processed. Please wait a moment.",
    failed: "Your payment could not be completed.",
    refunded: "This order has been refunded.",
  }[order.paymentStatus];

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        {/* Status */}
        <div className="bg-white border border-[#E9E7E2] p-8 text-center mb-6">
          <div className="flex justify-center mb-4">{statusIcon}</div>
          <h1 className="font-heading text-4xl font-bold text-[#080808] mb-2">
            {order.paymentStatus === "paid" ? "THANK YOU FOR YOUR PURCHASE!" : "Order Status"}
          </h1>
          <p className="font-body text-[#777777]">{statusMessage}</p>
          {order.paymentStatus === "paid" && (
            <p className="font-body text-sm text-[#777777] mt-1">
              Thank you for supporting my work. Your eBook is ready to download.
            </p>
          )}
        </div>

        {/* Order details */}
        <div className="bg-white border border-[#E9E7E2] p-6 mb-6">
          <h2 className="font-heading text-xl font-semibold text-[#080808] mb-4">Order Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm font-body mb-6">
            <div>
              <p className="text-[#777777] text-xs uppercase tracking-wider">Order Number</p>
              <p className="font-medium text-[#080808]">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-[#777777] text-xs uppercase tracking-wider">Date</p>
              <p className="font-medium text-[#080808]">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-[#777777] text-xs uppercase tracking-wider">Customer</p>
              <p className="font-medium text-[#080808]">{order.customerName}</p>
            </div>
            <div>
              <p className="text-[#777777] text-xs uppercase tracking-wider">Total Paid</p>
              <p className="font-medium text-[#080808]">{formatINR(order.totalPaise)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-4">
            {order.items.map((item) => (
              <div key={item.bookId} className="flex gap-4 items-center border-t border-[#E9E7E2] pt-4">
                <BookCover src={item.coverImageUrl} title={item.title} size="sm" />
                <div className="flex-1">
                  <p className="font-heading text-lg font-semibold text-[#080808]">{item.title}</p>
                  <p className="text-sm font-body text-[#777777]">{formatINR(item.pricePaise)}</p>
                </div>
                {order.paymentStatus === "paid" && (
                  <a
                    href={`/api/downloads/secure?bookId=${item.bookId}`}
                    className="flex items-center gap-2 bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-[#F2B916] transition-colors shrink-0"
                  >
                    <Download size={14} />
                    Download PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {order.paymentStatus === "paid" && (
            <Link
              href="/account/library"
              className="flex-1 text-center bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#789185] transition-colors"
            >
              Go to My Library
            </Link>
          )}
          {order.paymentStatus === "failed" && (
            <Link
              href="/checkout"
              className="flex-1 text-center bg-[#F12F43] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:opacity-90 transition-opacity"
            >
              Try Again
            </Link>
          )}
          <Link
            href="/books"
            className="flex-1 text-center border border-[#E9E7E2] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#FAF9F6] transition-colors"
          >
            Continue Exploring My Books
          </Link>
        </div>

        <p className="text-center text-xs text-[#777777] font-body mt-6">
          Need help? Contact{" "}
          <a href="/contact" className="underline hover:text-[#080808]">support</a>.
        </p>
      </div>
    </div>
  );
}
