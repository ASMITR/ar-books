"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/currency";
import { EmptyState } from "@/components/shared/EmptyState";

export default function CartPage() {
  const { items, removeItem, totalPaise } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen">
        <EmptyState
          title="Your cart is empty"
          description="Browse my books and add something you love."
          actionLabel="Explore My Books"
          actionHref="/books"
        />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-heading text-4xl font-bold text-[#080808] mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.bookId} className="bg-white border border-[#E9E7E2] flex gap-4 p-4">
                <div className="relative w-16 h-24 shrink-0 bg-[#FAF9F6]">
                  {item.coverImageUrl ? (
                    <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#789185]" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/books/${item.slug}`} className="font-heading text-lg font-semibold text-[#080808] hover:text-[#789185] transition-colors">
                      {item.title}
                    </Link>
                    <p className="text-xs text-[#777777] font-body mt-0.5">{item.author}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body font-semibold text-[#080808]">{formatINR(item.pricePaise)}</span>
                    <button
                      onClick={() => removeItem(item.bookId)}
                      className="text-[#777777] hover:text-[#F12F43] transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white border border-[#E9E7E2] p-6 h-fit">
            <h2 className="font-heading text-2xl font-bold text-[#080808] mb-6">Order Summary</h2>
            <div className="flex flex-col gap-3 mb-6">
              {items.map((item) => (
                <div key={item.bookId} className="flex justify-between text-sm font-body">
                  <span className="text-[#777777] truncate max-w-[180px]">{item.title}</span>
                  <span className="text-[#080808] shrink-0">{formatINR(item.pricePaise)}</span>
                </div>
              ))}
              <div className="border-t border-[#E9E7E2] pt-3 flex justify-between font-body font-semibold">
                <span>Total</span>
                <span>{formatINR(totalPaise)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full text-center bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#789185] transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/books"
              className="block w-full text-center mt-3 text-xs font-body text-[#777777] hover:text-[#080808] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
