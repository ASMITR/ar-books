/**
 * POST /api/membership/cancel
 *
 * Cancels a subscription — either immediately or at period end.
 * Never trusts client-provided subscription IDs without verifying ownership.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { razorpay } from "@/lib/razorpay";
import { requireAuthenticatedUser } from "@/lib/firebase/auth-server";
import {
  getActiveSubscriptionForCustomer,
  getMembershipPlanById,
  logSubscriptionAudit,
} from "@/lib/firebase/subscriptions";
import { sendSubscriptionCancelled } from "@/lib/email/subscription";
import { z } from "zod";

const schema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
  reason: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { cancelAtPeriodEnd, reason } = parsed.data;

    // Fetch subscription — verify ownership server-side
    const sub = await getActiveSubscriptionForCustomer(user.uid);
    if (!sub) {
      return NextResponse.json({ success: false, error: "No active subscription found." }, { status: 404 });
    }

    const plan = await getMembershipPlanById(sub.planId);
    const now  = new Date().toISOString();

    // Cancel on Razorpay
    if (sub.razorpaySubscriptionId) {
      try {
        await (razorpay as unknown as {
          subscriptions: { cancel: (id: string, data: { cancel_at_cycle_end: number }) => Promise<unknown> }
        }).subscriptions.cancel(sub.razorpaySubscriptionId, {
          cancel_at_cycle_end: cancelAtPeriodEnd ? 1 : 0,
        });
      } catch (rzpErr) {
        console.error("[membership/cancel] Razorpay error:", rzpErr);
        // Continue — we'll still mark as cancelled internally
      }
    }

    const newStatus = cancelAtPeriodEnd ? "cancelled" : "expired";

    await adminDb.collection("membershipSubscriptions").doc(sub.id).update({
      status:             newStatus,
      cancelledAt:        now,
      cancellationReason: reason ?? null,
      cancelAtPeriodEnd,
      updatedAt:          now,
    });

    await logSubscriptionAudit({
      subscriptionId: sub.id,
      customerId:     user.uid,
      action:         "cancelled",
      performedBy:    user.uid,
      previousState:  { status: sub.status },
      newState:       { status: newStatus, cancelledAt: now },
      notes:          reason,
    });

    // Send cancellation email
    try {
      if (plan) {
        await sendSubscriptionCancelled({ ...sub, status: newStatus, cancelledAt: now, cancelAtPeriodEnd }, plan);
      }
    } catch (e) { console.error("[membership/cancel] email error:", e); }

    return NextResponse.json({
      success: true,
      data: {
        cancelled: true,
        accessUntil: cancelAtPeriodEnd ? sub.currentPeriodEnd : now,
        message: cancelAtPeriodEnd
          ? `Your membership has been cancelled. You have access until ${new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN")}.`
          : "Your membership has been cancelled immediately.",
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    }
    console.error("[membership/cancel]", err);
    return NextResponse.json({ success: false, error: "Cancellation failed." }, { status: 500 });
  }
}
