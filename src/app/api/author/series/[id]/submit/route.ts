import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthor } from "@/lib/firebase/auth-server";
import { writeAuditLog } from "@/lib/audit";
import { createNotification, getAdminUids } from "@/lib/notifications";

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuthor();
    const { id } = await params;

    const doc = await adminDb.collection("series").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Series not found" }, { status: 404 });

    const data = doc.data()!;
    if (data.authorUid !== user.uid) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

    const submittableStatuses = ["draft", "changes_requested"];
    if (!submittableStatuses.includes(data.submissionStatus as string)) {
      return NextResponse.json(
        { error: `Cannot submit a series in "${data.submissionStatus}" status.` },
        { status: 400 }
      );
    }

    if (!data.coverImageUrl) {
      return NextResponse.json({ error: "Please upload a series cover image before submitting." }, { status: 422 });
    }

    const now = new Date().toISOString();
    await doc.ref.update({ submissionStatus: "pending_approval", ownerFeedback: null, updatedAt: now });

    const approvalRef = adminDb.collection("approvalRecords").doc();
    await approvalRef.set({
      resourceType: "series",
      resourceId: id,
      action: "submitted",
      actorUid: user.uid,
      actorRole: "author",
      snapshotTitle: data.name,
      createdAt: now,
    });

    const adminUids = await getAdminUids();
    for (const adminUid of adminUids) {
      createNotification({
        recipientUid: adminUid,
        type: "series_submitted",
        title: "Series Submitted for Approval",
        message: `Series "${data.name as string}" by ${user.displayName ?? user.email} has been submitted for review.`,
        resourceType: "series",
        resourceId: id,
        resourceTitle: data.name as string,
      }).catch(() => {});
    }

    writeAuditLog({
      actorUid: user.uid,
      actorEmail: user.email ?? "",
      actorRole: "author",
      action: "series_submitted",
      resourceType: "series",
      resourceId: id,
      resourceTitle: data.name as string,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
