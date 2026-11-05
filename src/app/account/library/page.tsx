import { getSessionUser } from "@/lib/firebase/auth-server";
import { getEntitlementsByCustomer } from "@/lib/firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { formatDate } from "@/lib/utils";
import { formatINR } from "@/lib/currency";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ShoppingBag, ArrowRight, Download, Layers } from "lucide-react";
import type { Metadata } from "next";
import type { Book } from "@/types";

export const metadata: Metadata = { title: "My Library" };

export default async function LibraryPage() {
  const user         = await getSessionUser();
  const entitlements = await getEntitlementsByCustomer(user!.uid);

  if (entitlements.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader count={0} />
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-5 bg-white border border-black/[0.06] rounded-3xl">
          <div className="relative">
            <div className="w-16 h-16 bg-[#F2EFE9] rounded-3xl flex items-center justify-center">
              <BookOpen size={24} className="text-[#C8C3BC]" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFC928] rounded-full flex items-center justify-center">
              <span className="text-[9px] font-bold text-[#0D1F17]">0</span>
            </div>
          </div>
          <div>
            <h3 className="font-heading text-[20px] font-bold text-[#111] mb-1.5">Your library is empty</h3>
            <p className="font-body text-[13px] text-[#999] max-w-[260px] mx-auto leading-relaxed">
              Purchase eBooks to build your personal digital library.
            </p>
          </div>
          <Link href="/books"
            className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.14em] px-6 py-3 rounded-2xl hover:bg-[#203A2B] transition-colors">
            <ShoppingBag size={12} /> Browse Books
          </Link>
        </div>
      </div>
    );
  }

  const docRefs  = entitlements.map((ent) => adminDb.collection("books").doc(ent.productId));
  const bookDocs = await adminDb.getAll(...docRefs);
  const books    = bookDocs.map((d) => d.exists ? ({ id: d.id, ...d.data() } as Book) : null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader count={entitlements.length} />

      {/* Shelf grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {entitlements.map((ent, i) => {
          const book = books[i];
          if (!book) return null;
          return (
            <div key={ent.id}
              className="group bg-white border border-black/[0.06] hover:border-black/[0.12] hover:shadow-md transition-all duration-200 rounded-3xl overflow-hidden flex flex-col">
              {/* Cover strip */}
              <div className="relative h-[120px] sm:h-[130px] bg-gradient-to-br from-[#0D1F17] to-[#1a3528] overflow-hidden">
                {book.coverImageUrl ? (
                  <Image src={book.coverImageUrl} alt={book.title} fill
                    className="object-cover opacity-30 group-hover:opacity-40 transition-opacity scale-110" sizes="400px" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[52px] h-[72px] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    {book.coverImageUrl ? (
                      <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" sizes="52px" />
                    ) : (
                      <div className="w-full h-full bg-[#203A2B] flex items-center justify-center">
                        <BookOpen size={16} className="text-white/30" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-body font-bold uppercase tracking-wider bg-[#FFC928] text-[#0D1F17] px-2 py-0.5 rounded-full">PDF</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 p-4 gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/books/${book.slug}`}>
                    <h3 className="font-heading text-[14px] font-bold text-[#111] hover:text-[#203A2B] transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-[11px] font-body text-[#B8B3AB] mt-0.5 truncate">{book.author}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] font-body text-[#B8B3AB]">Purchased {formatDate(ent.createdAt)}</span>
                    {book.priceRupees > 0 && (
                      <span className="text-[11px] font-body font-bold text-[#203A2B] tabular-nums">{formatINR(book.priceRupees)}</span>
                    )}
                  </div>
                </div>
                <a href={`/api/downloads/secure?bookId=${book.id}`}
                  className="flex items-center justify-center gap-2 bg-[#0D1F17] text-[#FFC928] font-body text-[10.5px] font-bold uppercase tracking-[0.1em] px-4 py-2.5 rounded-xl hover:bg-[#203A2B] transition-colors">
                  <Download size={11} /> Download PDF
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/books"
        className="group self-start inline-flex items-center gap-2 border border-black/[0.08] bg-white text-[#203A2B] font-body text-[11px] font-bold uppercase tracking-[0.11em] px-5 py-2.5 rounded-2xl hover:border-black/[0.15] hover:shadow-sm transition-all">
        <ShoppingBag size={12} /> Discover More Books
        <ArrowRight size={11} className="text-[#C8C3BC] group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

function PageHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0D1F17] rounded-2xl flex items-center justify-center shrink-0">
          <Layers size={16} className="text-[#FFC928]" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#B8B3AB] leading-none mb-1">Your collection</p>
          <h1 className="font-heading text-[26px] sm:text-[30px] font-bold text-[#111] leading-none">My Library</h1>
        </div>
      </div>
      {count > 0 && (
        <div className="shrink-0 bg-[#F2EFE9] rounded-2xl px-3.5 py-2 text-center">
          <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">{count}</p>
          <p className="text-[9px] font-body uppercase tracking-wider text-[#B8B3AB] mt-0.5">{count === 1 ? "eBook" : "eBooks"}</p>
        </div>
      )}
    </div>
  );
}
