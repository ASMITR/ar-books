"use client";

import { useCart } from "@/hooks/useCart";
import type { Book } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AddToCartButton({ book }: { book: Book }) {
  const { addItem, items } = useCart();
  const router = useRouter();
  const inCart = items.some((i) => i.bookId === book.id);

  const handleBuyNow = () => {
    if (!inCart) {
      addItem({
        bookId: book.id,
        title: book.title,
        author: book.author,
        coverImageUrl: book.coverImageUrl,
        pricePaise: book.pricePaise,
        slug: book.slug,
      });
    }
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={handleBuyNow}
        className="w-full bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#789185] transition-colors"
      >
        Buy Now
      </button>
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
        className="w-full border border-[#080808] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#080808] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {inCart ? "✓ Added to Cart" : "Add to Cart"}
      </button>
      {inCart && (
        <Link
          href="/cart"
          className="w-full text-center text-xs font-body text-[#789185] underline underline-offset-2 hover:text-[#080808] transition-colors py-1"
        >
          View Cart
        </Link>
      )}
    </div>
  );
}
