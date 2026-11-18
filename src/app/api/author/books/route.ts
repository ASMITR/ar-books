import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthor } from "@/lib/firebase/auth-server";
import { authorBookSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/audit";

function sanitizeLog(v: string) { return v.replace(/[\r\n]/g, "_"); }

/** GET /api/author/books — list this author's own books only */
export async function GET() {
  try {
    const user = await requireAuthor();

    const snap = await adminDb
      .collection("books")
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

/** POST /api/author/books — create a new draft book */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthor();

    const body = await req.json();
    const parsed = authorBookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    // Verify slug uniqueness
    const slugCheck = await adminDb
      .collection("books")
      .where("slug", "==", parsed.data.slug)
      .limit(1)
      .get();

    if (!slugCheck.empty) {
      return NextResponse.json(
        { success: false, error: "A book with this slug already exists. Please choose a unique slug." },
        { status: 409 }
      );
    }

    // Get author display name from profile
    const profileDoc = await adminDb.collection("authorProfiles").doc(user.uid).get();
    const authorName = profileDoc.exists
      ? (profileDoc.data()!.displayName as string)
      : (user.displayName ?? "Author");

    const now = new Date().toISOString();
    const ref = adminDb.collection("books").doc();

    await ref.set({
      ...parsed.data,
      author: authorName,
      authorUid: user.uid,
      currency: "INR",
      // Owner-controlled fields — always null/false until owner sets them
      priceRupees: 0,
      originalPriceRupees: null,
      published: false,
      featured: false,
      submissionStatus: "draft",
      ownerFeedback: null,
      coverImageUrl: body.coverImageUrl ?? null,
      coverImagePath: body.coverImagePath ?? null,
      privatePdfPath: body.privatePdfPath ?? null,
      privatePdfUrl: body.privatePdfUrl ?? null,
      previewPdfPath: body.previewPdfPath ?? null,
      previewPdfUrl: body.previewPdfUrl ?? null,
      whatYouLearn: body.whatYouLearn ?? [],
      targetAudience: body.targetAudience ?? null,
      tableOfContents: body.tableOfContents ?? [],
      createdAt: now,
      updatedAt: now,
    });

    writeAuditLog({
      actorUid: user.uid,
      actorEmail: user.email ?? "",
      actorRole: "author",
      action: "book_created",
      resourceType: "book",
      resourceId: ref.id,
      resourceTitle: parsed.data.title,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: { id: ref.id } }, { status: 201 });
  } catch (err) {
    console.error("[author/books POST]", sanitizeLog(err instanceof Error ? err.message : String(err)));
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
