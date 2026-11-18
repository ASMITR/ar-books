import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";

/** GET /api/admin/approvals — list all pending books and series */
export async function GET() {
  try {
    await requireAdmin();

    const [booksSnap, seriesSnap] = await Promise.all([
      adminDb
        .collection("books")
        .where("submissionStatus", "in", ["pending_approval", "changes_requested", "approved"])
        .orderBy("updatedAt", "desc")
        .get(),
      adminDb
        .collection("series")
        .where("submissionStatus", "in", ["pending_approval", "changes_requested", "approved"])
        .orderBy("updatedAt", "desc")
        .get(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        books: booksSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        series: seriesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      },
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
