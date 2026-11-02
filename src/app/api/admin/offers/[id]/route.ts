import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { FieldValue } from "firebase-admin/firestore";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const doc = await adminDb.collection("offers").doc(id).get();
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
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const update = body as Record<string, unknown>;

    // Sanitise couponCode if present
    if (typeof update.couponCode === "string") {
      update.couponCode = update.couponCode.toUpperCase().trim();
    }

    // When endAt is explicitly null (unlimited offer), delete the field in
    // Firestore so it's fully removed — not just set to null. This ensures
    // the frontend correctly treats the offer as having no expiry.
    if (update.endAt === null || update.endAt === "") {
      update.endAt = FieldValue.delete();
    }

    await adminDb.collection("offers").doc(id).update({
      ...update,
      updatedAt: new Date().toISOString(),
    });
    revalidateTag("offers", { expire: 0 });
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

    // Safety: check if this offer has any redemptions before deleting
    const redemptionsSnap = await adminDb
      .collection("offerRedemptions")
      .where("offerId", "==", id)
      .limit(1)
      .get();

    if (!redemptionsSnap.empty) {
      // Archive instead of hard delete — preserve historical data
      await adminDb.collection("offers").doc(id).update({
        status: "expired",
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      revalidateTag("offers", { expire: 0 });
      return NextResponse.json({
        success: true,
        message: "Offer archived (has redemption history).",
      });
    }

    await adminDb.collection("offers").doc(id).delete();
    revalidateTag("offers", { expire: 0 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
