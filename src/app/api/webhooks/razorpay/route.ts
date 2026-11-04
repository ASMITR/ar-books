import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmation } from "@/lib/email";
import type { Order } from "@/types";

function sanitizeLog(value: string): string {
  return value.replace(/[\r\n\x1b\x08]/g, "_");
}
function errMsg(e: unknown): string {
  return sanitizeLog(e instanceof Error ? e.message : String(e));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: { payment: { entity: { id: string; order_id: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const { id: razorpayPaymentId, order_id: razorpayOrderId } = event.payload.payment.entity;

  if (
    typeof razorpayPaymentId !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(razorpayPaymentId) ||
    typeof razorpayOrderId !== "string"   || !/^[a-zA-Z0-9_-]{1,128}$/.test(razorpayOrderId)
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    // Find internal order by razorpayOrderId
    const snap = await adminDb
      .collection("orders")
      .where("razorpayOrderId", "==", razorpayOrderId)
      .limit(1)
      .get();

    if (snap.empty) {
      console.warn("[webhook] No order found for razorpayOrderId:", sanitizeLog(razorpayOrderId));
      return NextResponse.json({ received: true });
    }

    const orderDoc = snap.docs[0];
    const orderId = orderDoc.id;
    const orderRef = adminDb.collection("orders").doc(orderId);

    await adminDb.runTransaction(async (tx) => {
      const doc = await tx.get(orderRef);
      const order = doc.data() as Order;

      if (order.paymentStatus === "paid") return; // idempotent

      const now = new Date().toISOString();

      tx.update(orderRef, {
        paymentStatus: "paid",
        fulfillmentStatus: "fulfilled",
        razorpayPaymentId,
        paidAt: now,
        updatedAt: now,
      });

      for (const item of order.items) {
        // Only create if not already exists
        const existing = await adminDb
          .collection("downloadEntitlements")
          .where("orderId", "==", orderId)
          .where("productId", "==", item.bookId)
          .limit(1)
          .get();
        if (existing.empty) {
          const entRef = adminDb.collection("downloadEntitlements").doc();
          tx.set(entRef, {
            orderId,
            customerId: order.customerId,
            productId: item.bookId,
            status: "active",
            createdAt: now,
          });
        }
      }
    });

    // Send email
    try {
      const updatedDoc = await orderRef.get();
      await sendOrderConfirmation({ id: orderId, ...updatedDoc.data() } as Order);
    } catch (e) {
      console.error("[webhook] email error:", errMsg(e));
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook]", errMsg(err));
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
