import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthor } from "@/lib/firebase/auth-server";
import { authorBookSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/audit";
import { createNotification, getAdminUids } from "@/lib/notifications";
import cloudinary from "@/lib/cloudinary";

interface Params { params: Promise<{ id: string }> }

function sanitizeLog(v: string) { return v.replace(/[\r\n]/g, "_"); }
function handleErr(err: unknown) {
  if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}

/** Verify that the requesting author owns this book. Admin may also access. */
async function getBookAsAuthor(bookId: string, authorUid: string) {
  const doc = await adminDb.collection("books").doc(bookId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  // Admin can access; author only if they own it
  if (data.authorUid !== authorUid) return null;
  return { id: doc.id, ...data };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuthor();
    const { id } = await params;
    const book = await getBookAsAuthor(id, user.uid);
    if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: book });
  } catch (err) { return handleErr(err); }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuthor();
    const { id } = await params;

    const existing = await adminDb.collection("books").doc(id).get();
    if (!existing.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existingData = existing.data()!;

    // Ownership check
    if (existingData.authorUid !== user.uid) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // Authors may only edit books that are draft or changes_requested
    const editableStatuses = ["draft", "changes_requested"];
    if (!editableStatuses.includes(existingData.submissionStatus as string)) {
      return NextResponse.json(
        {
          error: `Books in "${existingData.submissionStatus}" status cannot be edited. Only draft or changes-requested books can be modified.`,
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = authorBookSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
    }

    // Authors cannot change these fields under any circumstances
    const forbidden = ["priceRupees", "originalPriceRupees", "published", "featured", "submissionStatus", "authorUid"];
    for (const f of forbidden) {
      if (f in body) delete (body as Record<string, unknown>)[f];
    }

    // Handle Cloudinary asset replacements
    const deletions: Promise<unknown>[] = [];
    if (body.coverImagePath && existingData.coverImagePath && existingData.coverImagePath !== body.coverImagePath) {
      deletions.push(cloudinary.uploader.destroy(existingData.coverImagePath as string, { resource_type: "image" }).catch(() => null));
    }
    if (body.privatePdfPath && existingData.privatePdfPath && existingData.privatePdfPath !== body.privatePdfPath) {
      deletions.push(cloudinary.uploader.destroy(existingData.privatePdfPath as string, { resource_type: "raw" }).catch(() => null));
    }
    if (body.previewPdfPath && existingData.previewPdfPath && existingData.previewPdfPath !== body.previewPdfPath) {
      deletions.push(cloudinary.uploader.destroy(existingData.previewPdfPath as string, { resource_type: "raw" }).catch(() => null));
    }
    if (deletions.length) await Promise.all(deletions);

    await adminDb.collection("books").doc(id).update({
      ...parsed.data,
      ...(body.coverImageUrl !== undefined && { coverImageUrl: body.coverImageUrl }),
      ...(body.coverImagePath !== undefined && { coverImagePath: body.coverImagePath }),
      ...(body.privatePdfPath !== undefined && { privatePdfPath: body.privatePdfPath }),
      ...(body.privatePdfUrl !== undefined && { privatePdfUrl: body.privatePdfUrl }),
      ...(body.previewPdfPath !== undefined && { previewPdfPath: body.previewPdfPath }),
      ...(body.previewPdfUrl !== undefined && { previewPdfUrl: body.previewPdfUrl }),
      updatedAt: new Date().toISOString(),
    });

    writeAuditLog({
      actorUid: user.uid,
      actorEmail: user.email ?? "",
      actorRole: "author",
      action: "book_updated",
      resourceType: "book",
      resourceId: id,
      resourceTitle: (existingData.title as string) ?? parsed.data.title,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[author/books PATCH]", sanitizeLog(err instanceof Error ? err.message : String(err)));
    return handleErr(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuthor();
    const { id } = await params;

    const doc = await adminDb.collection("books").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = doc.data()!;
    if (data.authorUid !== user.uid) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // Authors can only delete their own draft books
    if (data.submissionStatus !== "draft") {
      return NextResponse.json(
        { error: "Only draft books can be deleted. Contact the owner to remove other books." },
        { status: 400 }
      );
    }

    // Delete Cloudinary assets
    const deletions: Promise<unknown>[] = [];
    if (data.coverImagePath) deletions.push(cloudinary.uploader.destroy(data.coverImagePath as string, { resource_type: "image" }).catch(() => null));
    if (data.privatePdfPath) deletions.push(cloudinary.uploader.destroy(data.privatePdfPath as string, { resource_type: "raw" }).catch(() => null));
    if (data.previewPdfPath) deletions.push(cloudinary.uploader.destroy(data.previewPdfPath as string, { resource_type: "raw" }).catch(() => null));
    await Promise.all(deletions);

    await adminDb.collection("books").doc(id).delete();

    writeAuditLog({
      actorUid: user.uid,
      actorEmail: user.email ?? "",
      actorRole: "author",
      action: "book_deleted",
      resourceType: "book",
      resourceId: id,
      resourceTitle: data.title as string,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) { return handleErr(err); }
}

/** POST /api/author/books/[id]/submit — submit book for owner approval */
// This is handled in a sub-route below (submit route)
