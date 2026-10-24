import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { razorpay } from "@/lib/razorpay";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";
import type { OrderItem } from "@/types";

const schema = z.object({
  items: z.array(z.object({ bookId: z.string() })).min(1),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  phone: z.string().optional(),
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

    const { items, customerName, customerEmail, phone } = parsed.data;
    const sessionUser = await getSessionUser();

    // Fetch trusted prices from DB — never trust client-submitted prices
    const bookDocs = await Promise.all(
      items.map((i) => adminDb.collection("books").doc(i.bookId).get())
    );

    const orderItems: OrderItem[] = [];
    let subtotalPaise = 0;

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
    }

    const totalPaise = subtotalPaise;
    if (!Number.isSafeInteger(totalPaise) || totalPaise < 100) {
      return NextResponse.json(
        { success: false, error: "Order total must be at least 100 paise" },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    // Create Razorpay order server-side
    const rzpOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: orderNumber,
    });

    // Persist pending internal order
    const orderRef = adminDb.collection("orders").doc();
    await orderRef.set({
      orderNumber,
      customerId: sessionUser?.uid ?? "guest",
      customerEmail,
      customerName,
      phone: phone ?? null,
      items: orderItems,
      subtotalPaise,
      discountPaise: 0,
      taxPaise: 0,
      totalPaise,
      currency: "INR",
      paymentStatus: "pending",
      fulfillmentStatus: "pending",
      razorpayOrderId: rzpOrder.id,
      razorpayPaymentId: null,
      createdAt: new Date().toISOString(),
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
