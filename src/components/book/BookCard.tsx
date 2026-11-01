"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatINR } from "@/lib/currency";
import { ShoppingCart, Zap, Flame, Sparkles, Minus, Plus, Trash2, BookOpen, Check } from "lucide-react";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const requireAuth = useRequireAuth();
  const router = useRouter();

  const cartItem = items.find((i) => i.bookId === book.id);
  const inCart = !!cartItem;
  const quantity = cartItem?.quantity ?? 0;

  const payload = {
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
    addItem(payload);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!inCart) addItem(payload);
    router.push("/checkout");
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    quantity <= 1 ? removeItem(book.id) : updateQuantity(book.id, quantity - 1);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    updateQuantity(book.id, quantity + 1);
  };

  const discount = book.originalPricePaise
    ? Math.round((1 - book.pricePaise / book.originalPricePaise) * 100)
    : null;
  const isNew = Date.now() - new Date(book.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
  const isBestseller = book.featured;

  return (
    <div className="group relative flex flex-col bg-[#FFFCF7] overflow-hidden
      border border-[#E6DFD5] rounded-sm
      hover:border-[#203A2B]/35 hover:shadow-[0_8px_36px_rgba(32,58,43,0.13)]
      transition-all duration-300">

      {/* Gold top bar — slides in on hover */}
      <div className="absolute top-0 inset-x-0 h-[3px] z-10
        bg-gradient-to-r from-[#C6A66B] via-[#dbb96a] to-[#C6A66B]
        scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {/* ── COVER ──────────────────────────────────────────────────────── */}
      <Link
        href={`/books/${book.slug}`}
        className="relative block overflow-hidden bg-gradient-to-b from-[#EDE5D8] to-[#E3D9CC]"
        tabIndex={-1}
        aria-hidden
      >
        {/* Badges — top-left stack */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {discount && (
            <span className="flex items-center bg-[#203A2B] text-[#FFFCF7]
              text-[9px] font-body font-black uppercase tracking-[0.14em] px-2 py-[3px] rounded-sm shadow">
              -{discount}%
            </span>
          )}
          {isBestseller && (
            <span className="flex items-center gap-1 bg-[#C6A66B] text-[#1a1a1a]
              text-[9px] font-body font-black uppercase tracking-[0.14em] px-2 py-[3px] rounded-sm shadow">
              <Flame size={8} strokeWidth={2.5} /> Best
            </span>
          )}
          {isNew && !isBestseller && (
            <span className="flex items-center gap-1 bg-[#FFFCF7]/95 border border-[#203A2B]/30 text-[#203A2B]
              text-[9px] font-body font-black uppercase tracking-[0.14em] px-2 py-[3px] rounded-sm">
              <Sparkles size={8} strokeWidth={2.5} /> New
            </span>
          )}
        </div>

        {/* Cover image */}
        <div className="relative h-[200px] sm:h-[220px] flex items-center justify-center px-6 py-5">
          {book.coverImageUrl ? (
            <div className="relative w-full h-full transition-transform duration-500
              group-hover:-translate-y-2 group-hover:scale-[1.03]"
              style={{ filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.30))" }}>
              <Image
                src={book.coverImageUrl}
                alt={book.title}
                fill
                className="object-contain"
                sizes="240px"
              />
            </div>
          ) : (
            <div className="w-[110px] h-[155px] bg-[#789185] flex items-end p-3 rounded-sm
              shadow-xl transition-transform duration-500 group-hover:-translate-y-2">
              <span className="font-heading text-white text-xs font-bold leading-tight line-clamp-3">
                {book.title}
              </span>
            </div>
          )}
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-10
          bg-gradient-to-t from-[#FFFCF7] to-transparent pointer-events-none" />
      </Link>

      {/* ── INFO BODY ──────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-4 pt-3.5 pb-4 gap-3">

        {/* Title + author */}
        <div className="flex flex-col gap-1">
          <Link href={`/books/${book.slug}`}>
            <h3 className="font-heading text-[14.5px] font-bold leading-snug text-[#1a1a1a]
              group-hover:text-[#203A2B] transition-colors duration-200 line-clamp-2">
              {book.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5">
            <BookOpen size={9} className="text-[#A8B5A0] shrink-0" strokeWidth={1.8} />
            <p className="font-body text-[10px] text-[#A8B5A0] uppercase tracking-[0.1em] truncate">
              {book.author}
            </p>
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#EDEBE6]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-[17px] font-bold text-[#203A2B] leading-none">
              {formatINR(book.pricePaise)}
            </span>
            {book.originalPricePaise && (
              <span className="font-body text-[11px] text-[#C0BAB2] line-through leading-none">
                {formatINR(book.originalPricePaise)}
              </span>
            )}
          </div>
          {discount && (
            <span className="font-body text-[10px] font-bold text-emerald-700 bg-emerald-50
              border border-emerald-200 px-1.5 py-0.5 rounded-sm">
              Save {discount}%
            </span>
          )}
        </div>

        {/* ── ACTION ZONE ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 mt-auto">

          {/* Buy Now — always full width */}
          <button
            onClick={handleBuyNow}
            className="w-full flex items-center justify-center gap-2
              font-body text-[10.5px] font-bold uppercase tracking-[0.14em]
              bg-[#203A2B] text-[#FFFCF7] py-[10px] px-4 rounded-sm
              hover:bg-[#2c5040] active:scale-[0.98]
              transition-all duration-200 shadow-sm"
          >
            <Zap size={10} className="shrink-0" />
            Buy Now
          </button>

          {/* Cart row — stepper OR add-to-cart button */}
          {inCart ? (
            /* In-cart: quantity stepper + view cart */
            <div className="flex items-stretch gap-2">
              {/* Stepper */}
              <div className="flex items-center flex-1 border border-[#203A2B]/25 rounded-sm overflow-hidden bg-[#F9F7F4]">
                <button
                  onClick={handleDecrease}
                  aria-label={quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                  className={`flex items-center justify-center w-8 h-8 shrink-0 transition-colors
                    ${quantity === 1
                      ? "text-[#C0BAB2] hover:text-red-500 hover:bg-red-50"
                      : "text-[#777] hover:text-[#203A2B] hover:bg-[#EEF3EF]"
                    }`}
                >
                  {quantity === 1 ? <Trash2 size={10} /> : <Minus size={10} />}
                </button>
                <span className="flex-1 text-center font-body text-[12px] font-bold text-[#203A2B] tabular-nums select-none">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  aria-label="Increase quantity"
                  className="flex items-center justify-center w-8 h-8 shrink-0 text-[#777] hover:text-[#203A2B] hover:bg-[#EEF3EF] transition-colors"
                >
                  <Plus size={10} />
                </button>
              </div>

              {/* View Cart button */}
              <Link
                href="/cart"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1.5
                  font-body text-[10px] font-bold uppercase tracking-[0.1em]
                  border border-[#203A2B] text-[#203A2B] px-3 rounded-sm
                  hover:bg-[#203A2B] hover:text-[#FFFCF7] transition-all duration-200 shrink-0"
              >
                <Check size={10} strokeWidth={2.5} />
                Cart
              </Link>
            </div>
          ) : (
            /* Not in cart: Add to Cart button */
            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className="w-full flex items-center justify-center gap-2
                font-body text-[10.5px] font-bold uppercase tracking-[0.14em]
                border border-[#203A2B]/40 text-[#203A2B] py-[10px] px-4 rounded-sm
                hover:border-[#203A2B] hover:bg-[#203A2B]/6
                active:scale-[0.98] transition-all duration-200"
            >
              <ShoppingCart size={11} strokeWidth={1.8} />
              Add to Cart
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
