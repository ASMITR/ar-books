import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import cloudinary from "@/lib/cloudinary";
import { bookSchema } from "@/lib/validations";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const doc = await adminDb.collection("books").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = bookSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }

    // Fetch the slug before updating so we can revalidate the exact page path.
    const existing = await adminDb.collection("books").doc(id).get();
    const slug = existing.exists ? (existing.data()?.slug as string | undefined) : undefined;

    await adminDb.collection("books").doc(id).update({ ...parsed.data, updatedAt: new Date().toISOString() });

    revalidateTag("books", { expire: 0 });
    // Also revalidate the specific book page so the render cache is busted
    // immediately — not just the data cache.
    if (slug) revalidatePath(`/books/${slug}`);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Fetch the book to get its Cloudinary asset paths before deletion
    const doc = await adminDb.collection("books").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const book = doc.data() as {
      coverImagePath?: string;
      privatePdfPath?: string;
      previewPdfPath?: string;
    };

    // Delete Cloudinary assets in parallel (ignore failures — don't block delete)
    const cloudinaryDeletions: Promise<unknown>[] = [];
    if (book.coverImagePath) {
      cloudinaryDeletions.push(
        cloudinary.uploader.destroy(book.coverImagePath, { resource_type: "image" }).catch(() => null)
      );
    }
    if (book.privatePdfPath) {
      cloudinaryDeletions.push(
        cloudinary.uploader.destroy(book.privatePdfPath, { resource_type: "raw" }).catch(() => null)
      );
    }
    if (book.previewPdfPath) {
      cloudinaryDeletions.push(
        cloudinary.uploader.destroy(book.previewPdfPath, { resource_type: "raw" }).catch(() => null)
      );
    }
    await Promise.all(cloudinaryDeletions);

    // Delete all downloadEntitlements for this book (batch delete)
    const entitlementsSnap = await adminDb
      .collection("downloadEntitlements")
      .where("productId", "==", id)
      .get();

    const batch = adminDb.batch();
    entitlementsSnap.docs.forEach((d) => batch.delete(d.ref));
    // Hard-delete the book document itself
    batch.delete(adminDb.collection("books").doc(id));
    await batch.commit();
    revalidateTag("books", { expire: 0 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
