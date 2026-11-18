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

    const doc = await adminDb.collection("books").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const data = doc.data()!;

    // Ownership check — server side
    if (data.authorUid !== user.uid) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const submittableStatuses = ["draft", "changes_requested"];
    if (!submittableStatuses.includes(data.submissionStatus as string)) {
      return NextResponse.json(
        { error: `Cannot submit a book in "${data.submissionStatus}" status.` },
        { status: 400 }
      );
    }

    // Basic completeness checks before submission
    if (!data.coverImageUrl) {
      return NextResponse.json({ error: "Please upload a cover image before submitting." }, { status: 422 });
    }
    if (!data.privatePdfUrl && !data.privatePdfPath) {
      return NextResponse.json({ error: "Please upload the manuscript PDF before submitting." }, { status: 422 });
    }

    const now = new Date().toISOString();

    await adminDb.collection("books").doc(id).update({
      submissionStatus: "pending_approval",
      ownerFeedback: null,
      updatedAt: now,
    });

    // Write approval record
    const approvalRef = adminDb.collection("approvalRecords").doc();
    await approvalRef.set({
      resourceType: "book",
      resourceId: id,
      action: "submitted",
      actorUid: user.uid,
      actorRole: "author",
      snapshotTitle: data.title,
      createdAt: now,
    });

    // Notify all admins
    const adminUids = await getAdminUids();
    for (const adminUid of adminUids) {
      createNotification({
        recipientUid: adminUid,
        type: "book_submitted",
        title: "Book Submitted for Approval",
        message: `"${data.title as string}" by ${user.displayName ?? user.email} has been submitted for review.`,
        resourceType: "book",
        resourceId: id,
        resourceTitle: data.title as string,
      }).catch(() => {});
    }

    writeAuditLog({
      actorUid: user.uid,
      actorEmail: user.email ?? "",
      actorRole: "author",
      action: "book_submitted",
      resourceType: "book",
      resourceId: id,
      resourceTitle: data.title as string,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
