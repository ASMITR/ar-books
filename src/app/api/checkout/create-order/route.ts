import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { razorpay } from "@/lib/razorpay";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { generateOrderNumber } from "@/lib/utils";
import {
  validateCoupon,
  validateOffer,
  buildCouponSnapshot,
  buildOfferSnapshot,
} from "@/lib/discount";
import { getOrdersByCustomer } from "@/lib/firebase/firestore";
import { z } from "zod";
import type { OrderItem, Coupon, Offer, AppliedDiscount } from "@/types";

const schema = z.object({
  items: z.array(z.object({ bookId: z.string() })).min(1),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  phone: z.string().optional(),
  couponCode: z.string().optional(),
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

    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      return NextResponse.json(
        { success: false, error: "Payment gateway is not configured" },
        { status: 500 }
      );
    }

    const { items, customerName, customerEmail, phone, couponCode } = parsed.data;
    const sessionUser = await getSessionUser();
    const customerId = sessionUser?.uid ?? "guest";

    // ── 1. Fetch trusted book data from DB ────────────────────────────────────
    const bookDocs = await Promise.all(
      items.map((i) => adminDb.collection("books").doc(i.bookId).get())
    );

    const orderItems: OrderItem[] = [];
    let subtotalPaise = 0;
    const bookIds: string[] = [];
    const categoryIds: string[] = [];

    for (const doc of bookDocs) {
      if (!doc.exists) {
        return NextResponse.json({ success: false, error: "Book not found" }, { status: 404 });
      }
      const data = doc.data()!;
      if (!data.published) {
        return NextResponse.json({ success: false, error: "Book not available" }, { status: 400 });
      }
      orderItems.push({
        bookId: doc.id,
        title: data.title,
        pricePaise: data.pricePaise,
        coverImageUrl: data.coverImageUrl ?? null,
      });
      subtotalPaise += data.pricePaise;
      bookIds.push(doc.id);
      if (Array.isArray(data.categoryIds)) categoryIds.push(...data.categoryIds);
    }

    // ── 2. Server-side coupon / offer validation ───────────────────────────────
    let discountPaise = 0;
    let appliedDiscount: AppliedDiscount | null = null;
    let resolvedCouponId: string | null = null;
    let resolvedOfferId: string | null = null;

    if (couponCode) {
      const upperCode = couponCode.toUpperCase().trim();

      // Check legacy Coupons collection first
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
        discountPaise = result.discountPaise;
        appliedDiscount = buildCouponSnapshot(coupon, discountPaise);
        resolvedCouponId = coupon.id;
      } else {
        // Check Offers collection — single-field query, no composite index needed
        const now = new Date().toISOString();
        const offerSnap = await adminDb
          .collection("offers")
          .where("couponCode", "==", upperCode)
          .get();

        const matchedOffer = offerSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Offer))
          .find(
            (o) =>
              o.status === "active" &&
              o.startAt <= now &&
              (!o.endAt || o.endAt > now)
          );

        if (matchedOffer) {
          const offer = matchedOffer;

          // First-order eligibility check (server-authoritative)
          let isFirstOrder = false;
          if (offer.customerEligibility === "new_customers") {
            if (customerId === "guest") {
              isFirstOrder = true; // relaxed for guest; best-effort
            } else {
              const pastOrders = await getOrdersByCustomer(customerId);
              isFirstOrder = pastOrders.filter((o) => o.paymentStatus === "paid").length === 0;
            }
          } else {
            // For "all" or "existing_customers" types
            if (customerId !== "guest") {
              const pastOrders = await getOrdersByCustomer(customerId);
              isFirstOrder = pastOrders.filter((o) => o.paymentStatus === "paid").length === 0;
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
          discountPaise = result.discountPaise;
          appliedDiscount = buildOfferSnapshot(offer, discountPaise);
          resolvedOfferId = offer.id;
        } else {
          return NextResponse.json(
            { success: false, error: "Invalid coupon code. Please check and try again." },
            { status: 422 }
          );
        }
      }
    }

    // ── 3. Calculate final total ───────────────────────────────────────────────
    const totalPaise = Math.max(subtotalPaise - discountPaise, 100); // Razorpay min 100 paise
    if (!Number.isSafeInteger(totalPaise)) {
      return NextResponse.json(
        { success: false, error: "Order total calculation error" },
        { status: 500 }
      );
    }

    const orderNumber = generateOrderNumber();

    // ── 4. Create Razorpay order (server-side, authoritative amount) ──────────
    const rzpOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: orderNumber,
    });

    // ── 5. Persist pending internal order ─────────────────────────────────────
    const now = new Date().toISOString();
    const orderRef = adminDb.collection("orders").doc();
    await orderRef.set({
      orderNumber,
      customerId,
      customerEmail,
      customerName,
      phone: phone ?? null,
      items: orderItems,
      subtotalPaise,
      discountPaise,
      taxPaise: 0,
      totalPaise,
      currency: "INR",
      paymentStatus: "pending",
      fulfillmentStatus: "pending",
      razorpayOrderId: rzpOrder.id,
      razorpayPaymentId: null,
      appliedDiscount: appliedDiscount ?? null,
      // Store references to atomically increment usageCount on payment
      _pendingCouponId: resolvedCouponId ?? null,
      _pendingOfferId: resolvedOfferId ?? null,
      createdAt: now,
      updatedAt: now,
      paidAt: null,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderRef.id,
        razorpayOrderId: rzpOrder.id,
        amount: totalPaise,
        currency: "INR",
        keyId,
        discountPaise,
        appliedDiscount,
      },
    });
  } catch (err) {
    console.error("[create-order]", err);
    const statusCode =
      typeof err === "object" && err !== null && "statusCode" in err
        ? Number(err.statusCode)
        : undefined;
    if (statusCode === 401) {
      return NextResponse.json(
        { success: false, error: "Razorpay authentication failed" },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
