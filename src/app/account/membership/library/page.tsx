import { getSessionUser } from "@/lib/firebase/auth-server";
import {
  getActiveMembershipForCustomer,
  getBooksAccessibleByPlan,
} from "@/lib/firebase/subscriptions";
import { adminDb } from "@/lib/firebase/admin";
import { MembershipLibraryClient } from "@/components/membership/MembershipLibraryClient";
import Link from "next/link";
import { ArrowRight, Library } from "lucide-react";
import type { Metadata } from "next";
import type { Book } from "@/types";
import type { MembershipBookAccess } from "@/types/subscription";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Member Library — Account" };

export default async function MembershipLibraryPage() {
  const user = await getSessionUser();
  const membership = await getActiveMembershipForCustomer(user!.uid);

  if (!membership?.isActive) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Account</p>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080808]">Member Library</h1>
        </div>
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-8 flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 bg-[#F5EFE6] rounded-sm flex items-center justify-center">
            <Library size={24} className="text-[#A8B5A0]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-[#1a1a1a] mb-2">No Active Membership</h2>
            <p className="font-body text-[13px] text-[#777970] max-w-sm leading-relaxed">
              Subscribe to unlock your member library and access curated eBooks.
            </p>
          </div>
          <Link href="/membership"
            className="inline-flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 rounded-sm hover:bg-[#2c5040] transition-colors">
            View Membership Plans <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    );
  }

  // Fetch accessible book IDs for this plan
  const accessRecords: MembershipBookAccess[] = await getBooksAccessibleByPlan(membership.plan.slug);
  const bookIds = accessRecords.map((a) => a.bookId);

  // Fetch book details in batches (Firestore in-query limit = 30)
  const books: Book[] = [];
  for (let i = 0; i < bookIds.length; i += 30) {
    const batch = bookIds.slice(i, i + 30);
    if (batch.length === 0) break;
    const snap = await adminDb
      .collection("books")
      .where("__name__", "in", batch)
      .where("published", "==", true)
      .get();
    snap.docs.forEach((d) => books.push({ id: d.id, ...d.data() } as Book));
  }

  // Build access map: bookId → access config
  const accessMap: Record<string, MembershipBookAccess> = {};
  for (const a of accessRecords) { accessMap[a.bookId] = a; }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Account</p>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080808]">Member Library</h1>
        </div>
        <div className="text-right shrink-0">
          <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">{books.length}</p>
          <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">
            {books.length === 1 ? "Title" : "Titles"}
          </p>
        </div>
      </div>

      {/* Plan badge */}
      <div className="flex items-center gap-3 bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-5 py-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <p className="font-body text-[12px] text-[#555]">
          Viewing books accessible on your{" "}
          <span className="font-bold text-[#203A2B]">{membership.plan.name}</span> plan
          {membership.plan.canDownload
            ? " · PDF downloads enabled"
            : " · Online reading only"}
        </p>
        <Link href="/membership" className="ml-auto font-body text-[11px] text-[#315B55] hover:underline shrink-0">
          Upgrade ↗
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-8 text-center">
          <p className="font-heading text-lg font-bold text-[#1a1a1a] mb-2">No books added yet</p>
          <p className="font-body text-[13px] text-[#777970]">
            The administrator is curating books for your plan. Check back soon.
          </p>
        </div>
      ) : (
        <MembershipLibraryClient
          books={books}
          accessMap={accessMap}
          canDownload={membership.canDownload}
        />
      )}
    </div>
  );
}
