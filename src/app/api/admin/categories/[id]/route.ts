import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { FieldValue } from "firebase-admin/firestore";
import { categorySchema } from "@/lib/validations";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }
    await adminDb.collection("categories").doc(id).update({ ...parsed.data, updatedAt: new Date().toISOString() });
    revalidateTag("categories", { expire: 0 });
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
    revalidateTag("categories", { expire: 0 });

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
