import { getSessionUser } from "@/lib/firebase/auth-server";
import { getEntitlementsByCustomer } from "@/lib/firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { formatDate } from "@/lib/utils";
import { formatINR } from "@/lib/currency";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ShoppingBag, ArrowRight, Download } from "lucide-react";
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
        <div className="bg-white border border-black/[0.06] rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center gap-4">
          <div className="w-12 h-12 bg-[#F5F2EE] rounded-2xl flex items-center justify-center">
            <BookOpen size={20} className="text-[#C8C3BC]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-[18px] font-bold text-[#111] mb-1">Your library is empty</h3>
            <p className="font-body text-[13px] text-[#999]">Purchase eBooks to see them here.</p>
          </div>
          <Link href="/books"
            className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.14em] px-5 py-2.5 rounded-xl hover:bg-[#203A2B] transition-colors">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entitlements.map((ent, i) => {
          const book = books[i];
          if (!book) return null;
          return (
            <div key={ent.id} className="bg-white border border-black/[0.06] hover:border-black/[0.1] hover:shadow-sm transition-all duration-200 rounded-2xl p-4 sm:p-5 flex gap-4">
              <Link href={`/books/${book.slug}`} className="shrink-0">
                <div className="relative w-[52px] h-[72px] overflow-hidden rounded-xl bg-[#0D1F17] shadow-sm">
                  {book.coverImageUrl ? (
                    <Image src={book.coverImageUrl} alt={book.title} fill
                      className="object-cover" sizes="52px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={13} className="text-white/30" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <Link href={`/books/${book.slug}`}>
                    <h3 className="font-heading text-[14px] sm:text-[15px] font-bold text-[#111] hover:text-[#203A2B] transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-[10.5px] font-body text-[#B8B3AB] mt-0.5 truncate">{book.author}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[9px] font-body font-bold uppercase tracking-wider bg-[#F2EFE9] text-[#555] px-2 py-0.5 rounded-full">PDF</span>
                    <span className="text-[10px] font-body text-[#B8B3AB]">{formatDate(ent.createdAt)}</span>
                    {book.pricePaise > 0 && (
                      <span className="text-[11px] font-body font-bold text-[#203A2B] tabular-nums">{formatINR(book.pricePaise)}</span>
                    )}
                  </div>
                </div>
                <a href={`/api/downloads/secure?bookId=${book.id}`}
                  className="mt-2.5 inline-flex items-center gap-1.5 bg-[#0D1F17] text-[#FFC928] font-body text-[10px] font-bold uppercase tracking-[0.09em] px-3 py-2 rounded-xl hover:bg-[#203A2B] transition-colors w-fit">
                  <Download size={10} /> Download PDF
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/books"
        className="group self-start inline-flex items-center gap-2 border border-black/[0.08] bg-white text-[#203A2B] font-body text-[11px] font-bold uppercase tracking-[0.11em] px-5 py-2.5 rounded-xl hover:border-black/[0.15] hover:shadow-sm transition-all">
        <ShoppingBag size={12} />
        Discover More Books
        <ArrowRight size={11} className="text-[#C8C3BC] group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

function PageHeader({ count }: { count: number }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.28em] text-[#B8B3AB] mb-1.5">Your collection</p>
        <h1 className="font-heading text-[28px] sm:text-[32px] font-bold text-[#111] leading-none">My Library</h1>
      </div>
      {count > 0 && (
        <span className="font-body text-[12px] text-[#B8B3AB] shrink-0">{count} {count === 1 ? "eBook" : "eBooks"}</span>
      )}
    </div>
  );
}
