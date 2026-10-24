"use client";

import Link from "next/link";
import { BookCover } from "./BookCover";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/currency";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.some((i) => i.bookId === book.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      bookId: book.id,
      title: book.title,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
      pricePaise: book.pricePaise,
      slug: book.slug,
    });
  };

  return (
    <div className="group flex flex-col bg-white border border-[#E9E7E2] hover:shadow-md transition-shadow duration-200">
      <Link href={`/books/${book.slug}`} className="block overflow-hidden">
        <div className="relative bg-[#FAF9F6] flex items-center justify-center p-6 h-56">
          <BookCover
            src={book.coverImageUrl}
            title={book.title}
            size="md"
            perspective
          />
        </div>
      </Link>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <Link href={`/books/${book.slug}`}>
          <h3 className="font-heading text-lg leading-tight text-[#080808] group-hover:text-[#789185] transition-colors line-clamp-2">
            {book.title}
          </h3>
        </Link>
        <p className="text-xs text-[#777777] uppercase tracking-wide">{book.author}</p>
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="font-body font-semibold text-[#080808]">
            {formatINR(book.pricePaise)}
          </span>
          {book.originalPricePaise && (
            <span className="text-sm text-[#777777] line-through">
              {formatINR(book.originalPricePaise)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <Link
            href={`/books/${book.slug}`}
            className="w-full text-center text-xs font-body font-bold uppercase tracking-wider bg-[#080808] text-white px-3 py-2.5 hover:bg-[#789185] transition-colors"
          >
            Buy Now
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={inCart}
            className="w-full text-xs font-body font-medium uppercase tracking-wider border border-[#080808] text-[#080808] px-3 py-2 hover:bg-[#080808] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inCart ? "✓ In Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
