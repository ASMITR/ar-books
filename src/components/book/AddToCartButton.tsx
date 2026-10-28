"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { Book } from "@/types";

export function AddToCartButton({ book }: { book: Book }) {
  const { addItem, items } = useCart();
  const requireAuth = useRequireAuth();
  const router = useRouter();
  const inCart = items.some((i) => i.bookId === book.id);

  const cartItem = {
    bookId: book.id,
    title: book.title,
    author: book.author,
    coverImageUrl: book.coverImageUrl,
    pricePaise: book.pricePaise,
    slug: book.slug,
  };

  const handleBuyNow = () => {
    if (!requireAuth()) return;
    if (!inCart) addItem(cartItem);
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    if (!requireAuth()) return;
    addItem(cartItem);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={handleBuyNow}
        className="w-full bg-[#203A2B] text-[#FFFCF7] font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#315B55] transition-colors"
      >
        Buy Now
      </button>
      <button
        onClick={handleAddToCart}
        disabled={inCart}
        className="w-full border border-[#203A2B] text-[#203A2B] font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#203A2B] hover:text-[#FFFCF7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {inCart ? "✓ Added to Cart" : "Add to Cart"}
      </button>
      {inCart && (
        <Link
          href="/cart"
          className="w-full text-center text-xs font-body text-[#315B55] underline underline-offset-2 hover:text-[#203A2B] transition-colors py-1"
        >
          View Cart →
        </Link>
      )}
    </div>
  );
}
