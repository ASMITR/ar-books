import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { seriesSchema } from "@/lib/validations";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = seriesSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    await adminDb.collection("series").doc(id).update({ ...parsed.data, updatedAt: new Date().toISOString() });
    revalidateTag("series", { expire: 0 });
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
    // Unlink books from this series
    const booksSnap = await adminDb.collection("books").where("seriesId", "==", id).get();
    const batch = adminDb.batch();
    booksSnap.docs.forEach((d) => batch.update(d.ref, { seriesId: null, seriesOrder: null }));
    batch.delete(adminDb.collection("series").doc(id));
    await batch.commit();
    revalidateTag("series", { expire: 0 });
    revalidateTag("books", { expire: 0 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
