/**
 * POST /api/membership/subscribe
 *
 * Creates a Razorpay subscription and a pending internal subscription record.
 * The client then launches the Razorpay checkout to authorise the mandate.
 * Access is ONLY granted after webhook confirmation (subscription.authenticated
 * or subscription.charged).
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { razorpay } from "@/lib/razorpay";
import { requireAuthenticatedUser } from "@/lib/firebase/auth-server";
import { getMembershipPlanById, getActiveSubscriptionForCustomer } from "@/lib/firebase/subscriptions";
import { z } from "zod";

const schema = z.object({
  planId:    z.string().min(1),   // our internal plan ID e.g. "plan_starter"
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { planId } = parsed.data;

    // ── 1. Fetch the plan (server-authoritative price) ────────────────────────
    const plan = await getMembershipPlanById(planId);
    if (!plan || !plan.active) {
      return NextResponse.json({ success: false, error: "Plan not available" }, { status: 404 });
    }

    // ── 2. Check for existing active subscription ─────────────────────────────
    const existing = await getActiveSubscriptionForCustomer(user.uid);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "You already have an active membership. Please manage it from your dashboard." },
        { status: 409 }
      );
    }

    // ── 3. Ensure Razorpay plan exists ────────────────────────────────────────
    let razorpayPlanId = plan.razorpayPlanId;
    if (!razorpayPlanId) {
      // Create plan on Razorpay (one-time, then stored)
      // Razorpay plan interval: monthly = 1 month
      if (typeof plan.pricePaise !== "number" || !Number.isInteger(plan.pricePaise) || plan.pricePaise <= 0) {
        return NextResponse.json({ success: false, error: "Plan configuration error" }, { status: 500 });
      }
      const planName = String(plan.name ?? "").slice(0, 100);
      const planDescription = String(plan.description ?? "").slice(0, 255);

      const rzpPlan = await (razorpay as unknown as {
        plans: { create: (data: unknown) => Promise<{ id: string }> }
      }).plans.create({
        period: "monthly",
        interval: 1,
        item: {
          name: `AR Books ${planName} Membership`,
          amount: plan.pricePaise,
          unit_amount: plan.pricePaise,
          currency: "INR",
          description: planDescription,
        },
        notes: {
          internal_plan_id: planId,
          plan_name: plan.name,
        },
      });

      razorpayPlanId = rzpPlan.id;

      // Persist Razorpay plan ID back to Firestore
      await adminDb.collection("membershipPlans").doc(planId).update({
        razorpayPlanId: rzpPlan.id,
        updatedAt: new Date().toISOString(),
      });
    }

    // ── 4. Create Razorpay subscription ───────────────────────────────────────
    // total_count: 0 = recurring indefinitely (until cancelled)
    // expire_by: auth window (24 hours from now)
    const expireBy = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    const rzpSub = await (razorpay as unknown as {
      subscriptions: { create: (data: unknown) => Promise<{ id: string; short_url?: string }> }
    }).subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 0, // we send our own emails
      quantity: 1,
      total_count: 0,       // unlimited recurring cycles
      expire_by: expireBy,
      notes: {
        customer_id: user.uid,
        customer_email: user.email,
        internal_plan_id: planId,
        plan_name: plan.name,
      },
    });

    // ── 5. Create pending internal subscription ───────────────────────────────
    const now   = new Date().toISOString();
    const start = new Date();
    const end   = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const subRef = adminDb.collection("membershipSubscriptions").doc();
    await subRef.set({
      customerId:            user.uid,
      customerEmail:         user.email,
      customerName:          user.displayName ?? user.email ?? "",
      planId,
      planName:              plan.name,
      planSlug:              plan.slug,
      pricePaise:            plan.pricePaise,
      currency:              "INR",
      status:                "created",
      razorpaySubscriptionId: rzpSub.id,
      razorpayPlanId,
      razorpayPaymentId:     null,
      startDate:             now,
      currentPeriodStart:    now,
      currentPeriodEnd:      end.toISOString(),
      nextBillingDate:       null,
      cancelledAt:           null,
      cancellationReason:    null,
      cancelAtPeriodEnd:     false,
      gracePeriodDays:       3,
      adminNotes:            null,
      createdAt:             now,
      updatedAt:             now,
    });

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId:       subRef.id,
        razorpaySubscriptionId: rzpSub.id,
        razorpayKeyId:        process.env.RAZORPAY_KEY_ID,
        planName:             plan.name,
        amountPaise:          plan.pricePaise,
        currency:             "INR",
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ success: false, error: "Please sign in to subscribe." }, { status: 401 });
    }
    console.error("[membership/subscribe]", err);
    return NextResponse.json({ success: false, error: "Failed to create subscription." }, { status: 500 });
  }
}
