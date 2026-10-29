import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendOrderConfirmation } from "@/lib/email";
import { z } from "zod";
import type { Order } from "@/types";

const schema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // Verify HMAC signature
    const valid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    const orderRef = adminDb.collection("orders").doc(orderId);

    await adminDb.runTransaction(async (tx) => {
      const orderDoc = await tx.get(orderRef);
      if (!orderDoc.exists) throw new Error("Order not found");

      const order = orderDoc.data() as Order & {
        _pendingCouponId?: string | null;
        _pendingOfferId?: string | null;
      };

      // Idempotency — already processed
      if (order.paymentStatus === "paid") return;

      if (order.razorpayOrderId !== razorpayOrderId) throw new Error("Order ID mismatch");

      const now = new Date().toISOString();

      tx.update(orderRef, {
        paymentStatus: "paid",
        fulfillmentStatus: "fulfilled",
        razorpayPaymentId,
        paidAt: now,
        updatedAt: now,
        // Clear internal tracking fields
        _pendingCouponId: null,
        _pendingOfferId: null,
      });

      // ── Atomically increment coupon usageCount ──────────────────────────────
      if (order._pendingCouponId) {
        const couponRef = adminDb.collection("coupons").doc(order._pendingCouponId);
        tx.update(couponRef, { usageCount: FieldValue.increment(1) });
      }

      // ── Atomically increment offer usageCount + record redemption ───────────
      if (order._pendingOfferId) {
        const offerRef = adminDb.collection("offers").doc(order._pendingOfferId);
        tx.update(offerRef, { usageCount: FieldValue.increment(1) });

        // Record per-customer redemption
        const redemptionRef = adminDb.collection("offerRedemptions").doc();
        tx.set(redemptionRef, {
          offerId: order._pendingOfferId,
          couponCode: order.appliedDiscount?.couponCode ?? null,
          customerId: order.customerId,
          customerEmail: order.customerEmail,
          orderId,
          discountPaise: order.discountPaise,
          redeemedAt: now,
        });
      }

      // ── Create download entitlements ────────────────────────────────────────
      for (const item of order.items) {
        const entRef = adminDb.collection("downloadEntitlements").doc();
        tx.set(entRef, {
          orderId,
          customerId: order.customerId,
          productId: item.bookId,
          status: "active",
          createdAt: now,
        });
      }

      // ── Log payment event ───────────────────────────────────────────────────
      const eventRef = adminDb.collection("paymentEvents").doc();
      tx.set(eventRef, {
        provider: "razorpay",
        providerEventId: razorpayPaymentId,
        eventType: "payment.captured",
        internalOrderId: orderId,
        processingStatus: "processed",
        receivedAt: now,
        processedAt: now,
      });
    });

    // Send confirmation email (outside transaction — non-critical)
    try {
      const orderDoc = await orderRef.get();
      await sendOrderConfirmation({ id: orderId, ...orderDoc.data() } as Order);
    } catch (emailErr) {
      console.error("[verify-payment] email error:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-payment]", err);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
