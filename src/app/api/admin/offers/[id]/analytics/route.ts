/**
 * GET /api/admin/offers/[id]/analytics
 * Returns redemption analytics for a specific offer.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [offerDoc, redemptionsSnap] = await Promise.all([
      adminDb.collection("offers").doc(id).get(),
      adminDb
        .collection("offerRedemptions")
        .where("offerId", "==", id)
        .orderBy("redeemedAt", "desc")
        .get(),
    ]);

    if (!offerDoc.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const offer = offerDoc.data()!;
    const redemptions = redemptionsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Calculate stats — only count redemptions attached to paid orders
    const ordersWithOffer = await adminDb
      .collection("orders")
      .where("appliedDiscount.offerId", "==", id)
      .where("paymentStatus", "==", "paid")
      .get();

    const totalDiscountPaise = redemptions.reduce(
      (sum, r) => sum + ((r as { discountPaise?: number }).discountPaise ?? 0),
      0
    );

    const orderDocs = ordersWithOffer.docs.map((d) => d.data());
    const totalRevenuePaise = orderDocs.reduce(
      (sum, o) => sum + ((o as { totalPaise?: number }).totalPaise ?? 0),
      0
    );

    const avgOrderValuePaise =
      orderDocs.length > 0 ? Math.round(totalRevenuePaise / orderDocs.length) : 0;

    return NextResponse.json({
      success: true,
      data: {
        offer: { id, ...offer },
        stats: {
          usageCount: offer.usageCount ?? 0,
          paidOrderCount: ordersWithOffer.size,
          totalDiscountPaise,
          totalRevenuePaise,
          avgOrderValuePaise,
          remainingUses:
            offer.usageLimitTotal != null
              ? Math.max(0, offer.usageLimitTotal - (offer.usageCount ?? 0))
              : null,
        },
        recentRedemptions: redemptions.slice(0, 50),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[offer analytics]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
