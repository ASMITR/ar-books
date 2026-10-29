import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { FieldValue } from "firebase-admin/firestore";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    await adminDb.collection("categories").doc(id).update({ ...body, updatedAt: new Date().toISOString() });
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

    // Check if any books are still using this category
    const booksSnap = await adminDb
      .collection("books")
      .where("categoryIds", "array-contains", id)
      .limit(1)
      .get();

    if (!booksSnap.empty) {
      return NextResponse.json(
        { error: "Cannot delete: category is still used by one or more books. Remove it from all books first." },
        { status: 409 }
      );
    }

    // Hard-delete the category document
    await adminDb.collection("categories").doc(id).delete();

    // Also clean up any stale categoryId references across all books
    // (belt-and-suspenders: handles books that may not be caught by the query above)
    const allBooksSnap = await adminDb
      .collection("books")
      .where("categoryIds", "array-contains", id)
      .get();
    if (!allBooksSnap.empty) {
      const batch = adminDb.batch();
      allBooksSnap.docs.forEach((d) => {
        batch.update(d.ref, { categoryIds: FieldValue.arrayRemove(id) });
      });
      await batch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
