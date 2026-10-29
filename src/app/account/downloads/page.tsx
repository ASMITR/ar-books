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

  /* ── Empty state ──────────────────────────────────────────────────────────── */
  if (logs.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader count={0} />
        <div className="bg-white border border-[#E6DFD5] flex flex-col items-center justify-center py-20 px-4 text-center gap-5">
          <div className="w-16 h-16 bg-[#F5EFE6] flex items-center justify-center">
            <Download size={24} className="text-[#C6A66B]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[#080808] mb-1">No downloads yet</h3>
            <p className="font-body text-sm text-[#777777]">Your download history will appear here.</p>
          </div>
          <Link
            href="/account/library"
            className="flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3 hover:bg-[#315B55] transition-colors"
          >
            <Library size={13} /> Go to My Library
          </Link>
        </div>
      </div>
    );
  }

  /* ── Fetch book metadata ──────────────────────────────────────────────────── */
  const bookIds  = [...new Set(logs.map((l) => l.productId))];
  const bookDocs = await Promise.all(bookIds.map((id) => adminDb.collection("books").doc(id).get()));
  const bookMap  = Object.fromEntries(
    bookDocs.map((d) => [d.id, d.exists ? (d.data() as Book) : null])
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader count={logs.length} />

      {/* ── Log list ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6DFD5] overflow-hidden">

        {/* Table header — desktop */}
        <div className="hidden sm:grid grid-cols-[1fr_160px_120px] gap-4 px-5 py-3 border-b border-[#E6DFD5] bg-[#FAF9F6]">
          <span className="text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0]">Book</span>
          <span className="text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0]">Date</span>
          <span className="text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0]">Action</span>
        </div>

        <div className="divide-y divide-[#F0EEE9]">
          {logs.map((log) => {
            const book = bookMap[log.productId];
            return (
              <div
                key={log.id}
                className="group px-5 py-4 flex flex-col sm:grid sm:grid-cols-[1fr_160px_120px] gap-3 sm:gap-4 sm:items-center hover:bg-[#FAF9F6] transition-colors"
              >
                {/* Book */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-8 h-11 shrink-0 overflow-hidden bg-gradient-to-br from-[#203A2B] to-[#315B55]">
                    {book?.coverImageUrl ? (
                      <Image src={book.coverImageUrl} alt={book.title ?? ""} fill className="object-cover" sizes="32px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={10} className="text-[#A8B5A0]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <p className="text-[13px] font-body font-semibold text-[#080808] truncate">
                    {book?.title ?? log.productId}
                  </p>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 sm:gap-1">
                  <Clock size={11} className="text-[#A8B5A0] shrink-0" />
                  <p className="text-[12px] font-body text-[#A8B5A0]">{formatDate(log.timestamp)}</p>
                </div>

                {/* Action */}
                <a
                  href={`/api/downloads/secure?bookId=${log.productId}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-body font-semibold text-[#203A2B] hover:text-[#315B55] transition-colors w-fit"
                >
                  <Download size={12} />
                  Download again
                </a>
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
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Activity log</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808] leading-none">Download History</h1>
      </div>
      {count > 0 && (
        <span className="font-body text-[12px] text-[#A8B5A0] pb-0.5">{count} records</span>
      )}
    </div>
  );
}
