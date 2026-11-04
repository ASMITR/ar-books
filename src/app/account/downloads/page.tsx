import { getSessionUser } from "@/lib/firebase/auth-server";
import { adminDb } from "@/lib/firebase/admin";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Download, BookOpen, Clock, Library } from "lucide-react";
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
        <div className="bg-white border border-black/[0.06] rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center gap-4">
          <div className="w-11 h-11 bg-[#F5F2EE] rounded-2xl flex items-center justify-center">
            <Download size={18} className="text-[#C8C3BC]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-[17px] font-bold text-[#111] mb-1">No downloads yet</h3>
            <p className="font-body text-[13px] text-[#999]">Your download history will appear here.</p>
          </div>
          <Link href="/account/library"
            className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.14em] px-5 py-2.5 rounded-xl hover:bg-[#203A2B] transition-colors">
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

      <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_150px_130px] gap-4 px-5 py-3 border-b border-black/[0.05] bg-[#FAFAF8]">
          <span className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[#B8B3AB]">Book</span>
          <span className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[#B8B3AB]">Date</span>
          <span className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[#B8B3AB]">Action</span>
        </div>

        <div className="divide-y divide-black/[0.04]">
          {logs.map((log) => {
            const book = bookMap[log.productId];
            return (
              <div key={log.id}
                className="px-5 py-4 flex flex-col sm:grid sm:grid-cols-[1fr_150px_130px] gap-2.5 sm:gap-4 sm:items-center hover:bg-[#FAFAF8] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-8 h-11 shrink-0 overflow-hidden rounded-lg bg-[#0D1F17]">
                    {book?.coverImageUrl ? (
                      <Image src={book.coverImageUrl} alt={book.title ?? ""} fill className="object-cover" sizes="32px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={10} className="text-white/30" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <p className="text-[13px] font-body font-semibold text-[#111] truncate">
                    {book?.title ?? log.productId}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pl-11 sm:pl-0">
                  <Clock size={11} className="text-[#B8B3AB] shrink-0" />
                  <p className="text-[11.5px] font-body text-[#B8B3AB]">{formatDate(log.timestamp)}</p>
                </div>

                <div className="pl-11 sm:pl-0">
                  <a href={`/api/downloads/secure?bookId=${log.productId}`}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-body font-bold text-[#203A2B] hover:text-[#0D1F17] transition-colors">
                    <Download size={11} /> Download again
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PageHeader({ count }: { count: number }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.28em] text-[#B8B3AB] mb-1.5">Activity log</p>
        <h1 className="font-heading text-[28px] sm:text-[32px] font-bold text-[#111] leading-none">Download History</h1>
      </div>
      {count > 0 && <span className="font-body text-[12px] text-[#B8B3AB] shrink-0">{count} records</span>}
    </div>
  );
}
