import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthenticatedUser } from "@/lib/firebase/auth-server";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    const snap = await adminDb
      .collection("notifications")
      .where("recipientUid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    return NextResponse.json({
      success: true,
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();

    // Mark all as read, or a specific notification
    const { notificationId, markAllRead } = body as { notificationId?: string; markAllRead?: boolean };

    if (markAllRead) {
      const snap = await adminDb
        .collection("notifications")
        .where("recipientUid", "==", user.uid)
        .where("read", "==", false)
        .get();

      const batch = adminDb.batch();
      snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
      await batch.commit();
    } else if (notificationId) {
      const doc = await adminDb.collection("notifications").doc(notificationId).get();
      if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (doc.data()!.recipientUid !== user.uid) {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
      await doc.ref.update({ read: true });
    } else {
      return NextResponse.json({ error: "Specify notificationId or markAllRead" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
