"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookCover } from "./BookCover";
import { useCart } from "@/hooks/useCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatINR } from "@/lib/currency";
import { ShoppingCart, Zap, Flame, Sparkles } from "lucide-react";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    addItem(cartItem);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!inCart) addItem(cartItem);
    router.push("/checkout");
  };

  const discount = book.originalPricePaise
    ? Math.round((1 - book.pricePaise / book.originalPricePaise) * 100)
    : null;

  const isNew = (Date.now() - new Date(book.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;
  const isBestseller = book.featured;

  return (
    <div className="group relative flex flex-col bg-[#FFFCF7] rounded-sm overflow-hidden
      border border-[#E6DFD5]
      hover:border-[#203A2B]/40
      hover:shadow-[0_8px_32px_rgba(32,58,43,0.12)]
      transition-all duration-300">

      {/* ── Gold top accent line (slides in on hover) ── */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
        scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left z-10" />

      {/* ── Cover area ── */}
      <Link
        href={`/books/${book.slug}`}
        className="block relative overflow-hidden bg-gradient-to-b from-[#F0E8DC] to-[#E8DDD0]"
      >
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {discount && (
            <span className="bg-[#203A2B] text-[#FFFCF7] text-[9px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
              -{discount}%
            </span>
          )}
          {isBestseller && (
            <span className="flex items-center gap-1 bg-[#C6A66B] text-[#242824] text-[9px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
              <Flame size={8} /> Bestseller
            </span>
          )}
          {isNew && !isBestseller && (
            <span className="flex items-center gap-1 border border-[#203A2B] text-[#203A2B] bg-[#FFFCF7]/90 text-[9px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
              <Sparkles size={8} /> New
            </span>
          )}
        </div>

        {/* Book cover image */}
        <div className="flex items-center justify-center py-7 px-5 h-[210px] sm:h-[230px]">
          <div className="transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.04] drop-shadow-xl">
            <BookCover src={book.coverImageUrl} title={book.title} size="md" perspective />
          </div>
        </div>

        {/* Bottom fade into info section */}
        <div className="absolute bottom-0 left-0 right-0 h-8
          bg-gradient-to-t from-[#FFFCF7] to-transparent" />
      </Link>

      {/* ── Divider ── */}
      <div className="h-px bg-[#E6DFD5] group-hover:bg-[#203A2B]/20 transition-colors duration-300" />

      {/* ── Info section ── */}
      <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3.5 gap-2">

        {/* Title */}
        <Link href={`/books/${book.slug}`}>
          <h3 className="font-heading text-[15px] leading-snug text-[#242824]
            group-hover:text-[#203A2B] transition-colors duration-200 line-clamp-2">
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-[0.1em]">
          {book.author}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto pt-2
          border-t border-dashed border-[#E6DFD5]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-body text-[14px] font-bold text-[#203A2B]">
              {formatINR(book.pricePaise)}
            </span>
            {book.originalPricePaise && (
              <span className="font-body text-[11px] text-[#A8B5A0] line-through">
                {formatINR(book.originalPricePaise)}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-[1fr_auto] gap-1.5 mt-1">
          {/* Buy Now */}
          <button
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-1.5
              text-[10px] font-body font-bold uppercase tracking-[0.12em]
              bg-[#203A2B] text-[#FFFCF7] py-2.5 px-3
              hover:bg-[#315B55] active:scale-[0.98]
              transition-all duration-200 rounded-sm"
          >
            <Zap size={10} className="shrink-0" />
            Buy Now
          </button>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={inCart}
            aria-label={inCart ? "Added to cart" : "Add to cart"}
            className={`w-9 flex items-center justify-center rounded-sm border transition-all duration-200
              ${inCart
                ? "border-[#203A2B] bg-[#203A2B]/10 text-[#203A2B] cursor-default"
                : "border-[#E6DFD5] text-[#777970] hover:border-[#203A2B] hover:bg-[#203A2B] hover:text-[#FFFCF7] active:scale-[0.95]"
              }`}
          >
            <ShoppingCart size={12} strokeWidth={inCart ? 2.5 : 1.8} />
          </button>
        </div>

      </div>
    </div>
  );
}
