"use client";

import { useCart } from "@/hooks/useCart";
import type { Book } from "@/types";
import Link from "next/link";

export function AddToCartButton({ book }: { book: Book }) {
  const { addItem, items } = useCart();
  const inCart = items.some((i) => i.bookId === book.id);

  return (
    <div className="flex gap-3 w-full">
      <button
        onClick={() =>
          addItem({
            bookId: book.id,
            title: book.title,
            author: book.author,
            coverImageUrl: book.coverImageUrl,
            pricePaise: book.pricePaise,
            slug: book.slug,
          })
        }
        disabled={inCart}
        className="flex-1 bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#F2B916] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {inCart ? "Added to Cart" : "Add to Cart"}
      </button>
      {inCart && (
        <Link
          href="/cart"
          className="flex-1 text-center bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#789185] transition-colors"
        >
          View Cart
        </Link>
      )}
    </div>
  );
}
