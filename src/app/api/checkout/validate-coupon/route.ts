/**
 * POST /api/checkout/validate-coupon
 *
 * Validates a coupon code or offer code server-side and returns the discount
 * amount. Does NOT consume the coupon — that happens atomically in create-order.
 *
 * Never trust the discount amount from the client. Always call this to preview,
 * then re-validate inside create-order before charging.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { validateCoupon, validateOffer } from "@/lib/discount";
import { getOrdersByCustomer } from "@/lib/firebase/firestore";
import { z } from "zod";
import type { Coupon, Offer } from "@/types";

const schema = z.object({
  code: z.string().min(1),
  bookIds: z.array(z.string()).min(1),
  categoryIds: z.array(z.string()).default([]),
  subtotalPaise: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { code, bookIds, categoryIds, subtotalPaise } = parsed.data;
    const upperCode = code.toUpperCase().trim();

    const sessionUser = await getSessionUser();
    const customerId = sessionUser?.uid ?? "guest";

    // ── 1. Check legacy Coupons collection ──────────────────────────────────
    const couponSnap = await adminDb
      .collection("coupons")
      .where("code", "==", upperCode)
      .limit(1)
      .get();

    if (!couponSnap.empty) {
      const coupon = { id: couponSnap.docs[0].id, ...couponSnap.docs[0].data() } as Coupon;
      const result = validateCoupon(coupon, subtotalPaise);
      if (!result.valid) {
        return NextResponse.json({ success: false, error: result.error }, { status: 422 });
      }
      return NextResponse.json({
        success: true,
        data: {
          type: "coupon",
          couponId: coupon.id,
          code: upperCode,
          discountPaise: result.discountPaise,
          title: `Coupon: ${upperCode}`,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
      });
    }

    // ── 2. Check Offers collection ───────────────────────────────────────────
    // Single-field query only — no composite index required
    const now = new Date().toISOString();
    const offerSnap = await adminDb
      .collection("offers")
      .where("couponCode", "==", upperCode)
      .get();

    const matchingOffer = offerSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Offer))
      .find(
        (o) =>
          o.status === "active" &&
          o.startAt <= now &&
          (!o.endAt || o.endAt > now)
      );

    if (matchingOffer) {
      const offer = matchingOffer;

      // First-order check (server-side)
      let isFirstOrder = false;
      if (offer.customerEligibility === "new_customers") {
        if (customerId === "guest") {
          // For guests, we allow it — will be verified again at payment
          isFirstOrder = true;
        } else {
          const pastOrders = await getOrdersByCustomer(customerId);
          const paidOrders = pastOrders.filter((o) => o.paymentStatus === "paid");
          isFirstOrder = paidOrders.length === 0;
        }
      }

      // Per-customer usage
      let perCustomerUsage = 0;
      if (offer.usageLimitPerCustomer != null && customerId !== "guest") {
        const redSnap = await adminDb
          .collection("offerRedemptions")
          .where("offerId", "==", offer.id)
          .where("customerId", "==", customerId)
          .get();
        perCustomerUsage = redSnap.size;
      }

      const result = validateOffer(offer, {
        subtotalPaise,
        bookIds,
        categoryIds,
        isFirstOrder,
        customerId,
        perCustomerUsage,
        couponCode: upperCode,
      });

      if (!result.valid) {
        return NextResponse.json({ success: false, error: result.error }, { status: 422 });
      }

      return NextResponse.json({
        success: true,
        data: {
          type: "offer",
          offerId: offer.id,
          code: upperCode,
          discountPaise: result.discountPaise,
          title: offer.title,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
        },
      });
    }

    // ── 3. Not found ─────────────────────────────────────────────────────────
    return NextResponse.json(
      { success: false, error: "Invalid coupon code. Please check and try again." },
      { status: 422 }
    );
  } catch (err) {
    console.error("[validate-coupon]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
