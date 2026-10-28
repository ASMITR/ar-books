import { adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import type { DownloadLog, Book } from "@/types";

export const metadata: Metadata = { title: "Download Activity" };

export default async function AdminDownloadsPage() {
  const snap = await adminDb.collection("downloadLogs").orderBy("timestamp", "desc").limit(100).get();
  const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DownloadLog & { id: string }));

  const bookIds = [...new Set(logs.map((l) => l.productId))];
  const bookDocs = await Promise.all(bookIds.map((id) => adminDb.collection("books").doc(id).get()));
  const bookMap = Object.fromEntries(bookDocs.map((d) => [d.id, d.exists ? (d.data() as Book).title : d.id]));

  return (
    <AdminShell title="Download Activity" subtitle="Last 100 download events">
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-body text-[#bbb]">No download activity yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[580px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Book</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Customer ID</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Order</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Date</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-[#080808] text-sm">{bookMap[log.productId] ?? log.productId}</td>
                    <td className="px-4 py-3.5 text-[#aaa] font-mono text-xs truncate max-w-[140px]">{log.customerId}</td>
                    <td className="px-4 py-3.5 text-[#aaa] font-mono text-xs truncate max-w-[120px]">{log.orderId}</td>
                    <td className="px-4 py-3.5 text-[#aaa] whitespace-nowrap text-xs">{formatDate(log.timestamp)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ${
                        log.outcome === "success"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-red-50 text-red-700 ring-red-200"
                      }`}>
                        {log.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
