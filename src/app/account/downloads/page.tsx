import { getSessionUser } from "@/lib/firebase/auth-server";
import { adminDb } from "@/lib/firebase/admin";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import { Download } from "lucide-react";
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
      <EmptyState
        title="No downloads yet"
        description="Your download history will appear here."
        actionLabel="Go to My Library"
        actionHref="/account/library"
      />
    );
  }

  // Fetch book titles
  const bookIds = [...new Set(logs.map((l) => l.productId))];
  const bookDocs = await Promise.all(bookIds.map((id) => adminDb.collection("books").doc(id).get()));
  const bookMap = Object.fromEntries(
    bookDocs.map((d) => [d.id, d.exists ? (d.data() as Book) : null])
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-4xl font-bold text-[#080808]">Download History</h1>

      <div className="bg-white border border-[#E9E7E2]">
        <div className="grid grid-cols-3 gap-4 px-5 py-3 border-b border-[#E9E7E2] text-xs font-body uppercase tracking-wider text-[#777777]">
          <span>Book</span>
          <span>Date</span>
          <span>Action</span>
        </div>
        {logs.map((log) => {
          const book = bookMap[log.productId];
          return (
            <div key={log.id} className="grid grid-cols-3 gap-4 px-5 py-4 border-b border-[#E9E7E2] last:border-0 items-center">
              <p className="text-sm font-body text-[#080808] truncate">{book?.title ?? log.productId}</p>
              <p className="text-sm font-body text-[#777777]">{formatDate(log.timestamp)}</p>
              <a
                href={`/api/downloads/secure?bookId=${log.productId}`}
                className="flex items-center gap-1 text-xs font-body text-[#789185] hover:text-[#080808] underline w-fit"
              >
                <Download size={12} />
                Download Again
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
