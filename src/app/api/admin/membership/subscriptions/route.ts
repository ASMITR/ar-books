import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const limit  = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);

    let q = adminDb
      .collection("membershipSubscriptions")
      .orderBy("createdAt", "desc") as FirebaseFirestore.Query;

    if (status) q = q.where("status", "==", status);
    q = q.limit(limit);

    const snap = await q.get();
    const subs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, data: subs });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
