import { getSessionUser } from "@/lib/firebase/auth-server";
import { adminDb } from "@/lib/firebase/admin";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Download, BookOpen, Clock, Library, ArrowDownToLine } from "lucide-react";
import type { Metadata } from "next";
import type { DownloadLog, Book } from "@/types";

export const metadata: Metadata = { title: "Download History" };

export default async function DownloadsPage() {
  const user = await getSessionUser();

  const snap = await adminDb
    .collection("downloadLogs")
    .where("customerId", "==", user!.uid)
    .orderBy("timestamp", "desc")
    .limit(50)
    .get();

  const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DownloadLog & { id: string }));

  if (logs.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader count={0} />
        <div className="bg-white border border-black/[0.06] rounded-3xl flex flex-col items-center justify-center py-24 px-4 text-center gap-5">
          <div className="w-16 h-16 bg-[#F2EFE9] rounded-3xl flex items-center justify-center">
            <ArrowDownToLine size={24} className="text-[#C8C3BC]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-[20px] font-bold text-[#111] mb-1.5">No downloads yet</h3>
            <p className="font-body text-[13px] text-[#999] max-w-[240px] mx-auto leading-relaxed">
              Your download history will appear here once you download a book.
            </p>
          </div>
          <Link href="/account/library"
            className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.14em] px-6 py-3 rounded-2xl hover:bg-[#203A2B] transition-colors">
            <Library size={12} /> Go to My Library
          </Link>
        </div>
      </div>
    );
  }

  const bookIds  = [...new Set(logs.map((l) => l.productId))];
  const docRefs  = bookIds.map((id) => adminDb.collection("books").doc(id));
  const bookDocs = await adminDb.getAll(...docRefs);
  const bookMap  = Object.fromEntries(bookDocs.map((d) => [d.id, d.exists ? (d.data() as Book) : null]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader count={logs.length} />

      {/* Timeline-style list */}
      <div className="flex flex-col gap-2.5">
        {logs.map((log, idx) => {
          const book = bookMap[log.productId];
          const isFirst = idx === 0;
          return (
            <div key={log.id}
              className={`bg-white border rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-black/[0.12] hover:shadow-sm transition-all duration-200 ${
                isFirst ? "border-[#FFC928]/40 bg-[#FFFDF5]" : "border-black/[0.06]"
              }`}>
              {/* Cover */}
              <div className="relative w-[38px] h-[52px] sm:w-[44px] sm:h-[60px] shrink-0 overflow-hidden rounded-xl bg-[#0D1F17] shadow-sm">
                {book?.coverImageUrl ? (
                  <Image src={book.coverImageUrl} alt={book.title ?? ""} fill className="object-cover" sizes="44px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={11} className="text-white/30" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-body font-semibold text-[#111] truncate">
                  {book?.title ?? log.productId}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock size={10} className="text-[#B8B3AB] shrink-0" />
                  <p className="text-[11px] font-body text-[#B8B3AB]">{formatDate(log.timestamp)}</p>
                  {isFirst && (
                    <span className="text-[9px] font-body font-bold uppercase tracking-wider bg-[#FFC928]/20 text-[#9A7A00] px-1.5 py-0.5 rounded-full ml-1">
                      Latest
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <a href={`/api/downloads/secure?bookId=${log.productId}`}
                className="shrink-0 flex items-center gap-1.5 bg-[#0D1F17] text-[#FFC928] font-body text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-2.5 rounded-xl hover:bg-[#203A2B] transition-colors">
                <Download size={11} />
                <span className="hidden sm:inline">Download</span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PageHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0D1F17] rounded-2xl flex items-center justify-center shrink-0">
          <ArrowDownToLine size={16} className="text-[#FFC928]" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#B8B3AB] leading-none mb-1">Activity log</p>
          <h1 className="font-heading text-[26px] sm:text-[30px] font-bold text-[#111] leading-none">Downloads</h1>
        </div>
      </div>
      {count > 0 && (
        <div className="shrink-0 bg-[#F2EFE9] rounded-2xl px-3.5 py-2 text-center">
          <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">{count}</p>
          <p className="text-[9px] font-body uppercase tracking-wider text-[#B8B3AB] mt-0.5">records</p>
        </div>
      )}
    </div>
  );
}
