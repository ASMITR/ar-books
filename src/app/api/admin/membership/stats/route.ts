import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";

export async function GET() {
  try {
    await requireAdmin();

    const [subsSnap, paymentsSnap] = await Promise.all([
      adminDb.collection("membershipSubscriptions").get(),
      adminDb.collection("subscriptionPayments").where("status", "==", "captured").get(),
    ]);

    const subs = subsSnap.docs.map((d) => d.data());

    const stats = {
      total:          subs.length,
      active:         subs.filter((s) => s.status === "active" || s.status === "authenticated").length,
      cancelled:      subs.filter((s) => s.status === "cancelled").length,
      expired:        subs.filter((s) => s.status === "expired" || s.status === "completed").length,
      paymentFailed:  subs.filter((s) => s.status === "payment_failed" || s.status === "halted").length,
      // By plan
      starter:        subs.filter((s) => s.planSlug === "starter" && (s.status === "active" || s.status === "authenticated")).length,
      plus:           subs.filter((s) => s.planSlug === "plus"    && (s.status === "active" || s.status === "authenticated")).length,
      premium:        subs.filter((s) => s.planSlug === "premium" && (s.status === "active" || s.status === "authenticated")).length,
      // MRR: sum of pricePaise for active subs (in paise)
      mrrPaise:       subs
        .filter((s) => s.status === "active" || s.status === "authenticated")
        .reduce((sum: number, s) => sum + (s.pricePaise ?? 0), 0),
      // Total collected (all captured payments)
      totalCollectedPaise: paymentsSnap.docs.reduce((sum, d) => sum + (d.data().amountPaise ?? 0), 0),
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
