import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthor } from "@/lib/firebase/auth-server";
import { authorSeriesSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/audit";

function sanitizeLog(v: string) { return v.replace(/[\r\n]/g, "_"); }

export async function GET() {
  try {
    const user = await requireAuthor();
    const snap = await adminDb
      .collection("series")
      .where("authorUid", "==", user.uid)
      .orderBy("createdAt", "desc")
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

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthor();

    const body = await req.json();
    const parsed = authorSeriesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    // Slug uniqueness check
    const slugCheck = await adminDb
      .collection("series")
      .where("slug", "==", parsed.data.slug)
      .limit(1)
      .get();
    if (!slugCheck.empty) {
      return NextResponse.json(
        { success: false, error: "A series with this slug already exists." },
        { status: 409 }
      );
    }

    const profileDoc = await adminDb.collection("authorProfiles").doc(user.uid).get();
    const authorName = profileDoc.exists
      ? (profileDoc.data()!.displayName as string)
      : (user.displayName ?? "Author");

    const now = new Date().toISOString();
    const ref = adminDb.collection("series").doc();
    await ref.set({
      ...parsed.data,
      author: authorName,
      authorUid: user.uid,
      sortOrder: 0,
      visible: false,           // visible only after owner publishes
      submissionStatus: "draft",
      ownerFeedback: null,
      createdAt: now,
      updatedAt: now,
    });

    writeAuditLog({
      actorUid: user.uid,
      actorEmail: user.email ?? "",
      actorRole: "author",
      action: "series_created",
      resourceType: "series",
      resourceId: ref.id,
      resourceTitle: parsed.data.name,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: { id: ref.id } }, { status: 201 });
  } catch (err) {
    console.error("[author/series POST]", sanitizeLog(err instanceof Error ? err.message : String(err)));
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
