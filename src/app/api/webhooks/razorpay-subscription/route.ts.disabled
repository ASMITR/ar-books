/**
 * POST /api/webhooks/razorpay-subscription
 *
 * Handles Razorpay subscription lifecycle webhooks.
 * ALL membership access grants happen here — never trust client-side reports.
 *
 * Configure in Razorpay Dashboard → Webhooks:
 *   URL: https://yourdomain.com/api/webhooks/razorpay-subscription
 *   Events: subscription.activated, subscription.charged, subscription.halted,
 *           subscription.cancelled, subscription.completed, subscription.updated,
 *           payment.failed (with subscription_id in payload)
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  getSubscriptionByRazorpayId,
  getMembershipPlanById,
  logSubscriptionAudit,
} from "@/lib/firebase/subscriptions";
import {
  sendSubscriptionActivated,
  sendSubscriptionRenewed,
  sendSubscriptionPaymentFailed,
  sendSubscriptionCancelled,
} from "@/lib/email/subscription";
import type { MembershipSubscription } from "@/types/subscription";

// ─── Idempotency: check if event already processed ───────────────────────────
async function isEventProcessed(razorpayEventId: string): Promise<boolean> {
  const snap = await adminDb
    .collection("subscriptionWebhookEvents")
    .where("razorpayEventId", "==", razorpayEventId)
    .where("processingStatus", "==", "processed")
    .limit(1)
    .get();
  return !snap.empty;
}

async function markEventProcessed(
  razorpayEventId: string,
  eventType: string,
  payload: unknown,
  subscriptionId?: string,
  razorpaySubscriptionId?: string
): Promise<void> {
  await adminDb.collection("subscriptionWebhookEvents").add({
    razorpayEventId,
    eventType,
    subscriptionId: subscriptionId ?? null,
    razorpaySubscriptionId: razorpaySubscriptionId ?? null,
    payload,
    processingStatus: "processed",
    processedAt: new Date().toISOString(),
    receivedAt: new Date().toISOString(),
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    id: string;
    event: string;
    payload: {
      subscription?: { entity: Record<string, unknown> };
      payment?:      { entity: Record<string, unknown> };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType           = event.event;
  const razorpayEventId     = event.id;
  const subEntity           = event.payload?.subscription?.entity ?? {};
  const paymentEntity       = event.payload?.payment?.entity ?? {};
  const razorpaySubId       = (subEntity.id as string) ?? (paymentEntity.subscription_id as string);

  // Idempotency guard
  if (await isEventProcessed(razorpayEventId)) {
    return NextResponse.json({ received: true, note: "duplicate" });
  }

  // Find our internal subscription
  const sub = razorpaySubId ? await getSubscriptionByRazorpayId(razorpaySubId) : null;

  if (!sub && eventType !== "subscription.created") {
    // Unknown subscription — log and skip
    await adminDb.collection("subscriptionWebhookEvents").add({
      razorpayEventId,
      eventType,
      subscriptionId: null,
      razorpaySubscriptionId: razorpaySubId ?? null,
      payload: event,
      processingStatus: "skipped",
      processedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    });
    return NextResponse.json({ received: true, note: "subscription not found" });
  }

  try {
    await handleEvent(eventType, sub, subEntity, paymentEntity);
    await markEventProcessed(razorpayEventId, eventType, event, sub?.id, razorpaySubId);
  } catch (err) {
    console.error("[sub-webhook] handler error:", err);
    await adminDb.collection("subscriptionWebhookEvents").add({
      razorpayEventId,
      eventType,
      subscriptionId: sub?.id ?? null,
      razorpaySubscriptionId: razorpaySubId ?? null,
      payload: event,
      processingStatus: "failed",
      receivedAt: new Date().toISOString(),
    });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Event dispatchers ────────────────────────────────────────────────────────
async function handleEvent(
  eventType: string,
  sub: MembershipSubscription | null,
  subEntity: Record<string, unknown>,
  paymentEntity: Record<string, unknown>
): Promise<void> {
  const now  = new Date().toISOString();
  if (!sub) return;

  const subRef = adminDb.collection("membershipSubscriptions").doc(sub.id);
  const plan   = await getMembershipPlanById(sub.planId);

  switch (eventType) {

    // ── Mandate authenticated — first payment authorised ─────────────────────
    case "subscription.authenticated": {
      await subRef.update({ status: "authenticated", updatedAt: now });
      await logSubscriptionAudit({ subscriptionId: sub.id, customerId: sub.customerId, action: "authenticated", performedBy: "system" });
      break;
    }

    // ── Subscription activated — recurring starts ─────────────────────────────
    case "subscription.activated": {
      const periodEnd = computePeriodEnd(subEntity);
      await subRef.update({
        status:             "active",
        currentPeriodStart: now,
        currentPeriodEnd:   periodEnd,
        nextBillingDate:    periodEnd,
        updatedAt:          now,
      });
      await logSubscriptionAudit({ subscriptionId: sub.id, customerId: sub.customerId, action: "activated", performedBy: "system" });

      if (plan) {
        try { await sendSubscriptionActivated({ ...sub, status: "active" }, plan); } catch {}
      }
      break;
    }

    // ── Subscription charged — renewal payment received ───────────────────────
    case "subscription.charged": {
      const amountPaise  = Number(paymentEntity.amount ?? sub.pricePaise);
      const razorpayPmtId = paymentEntity.id as string | undefined;
      const periodStart  = now;
      const periodEnd    = computePeriodEnd(subEntity);

      // Update subscription
      await subRef.update({
        status:             "active",
        currentPeriodStart: periodStart,
        currentPeriodEnd:   periodEnd,
        nextBillingDate:    periodEnd,
        razorpayPaymentId:  razorpayPmtId ?? null,
        updatedAt:          now,
      });

      // Record payment
      await adminDb.collection("subscriptionPayments").add({
        subscriptionId:   sub.id,
        customerId:       sub.customerId,
        planId:           sub.planId,
        planName:         sub.planName,
        amountPaise,
        currency:         sub.currency,
        status:           "captured",
        razorpayPaymentId: razorpayPmtId ?? null,
        razorpaySubscriptionId: sub.razorpaySubscriptionId,
        billingPeriodStart: periodStart,
        billingPeriodEnd:   periodEnd,
        retryCount:         0,
        createdAt:          now,
        updatedAt:          now,
      });

      await logSubscriptionAudit({ subscriptionId: sub.id, customerId: sub.customerId, action: "charged", performedBy: "system" });

      // Send activation email on first charge (status was created/authenticated)
      if (plan) {
        const wasNew = sub.status === "created" || sub.status === "authenticated";
        try {
          if (wasNew) {
            await sendSubscriptionActivated({ ...sub, status: "active" }, plan);
          } else {
            await sendSubscriptionRenewed({ ...sub, status: "active" }, plan, amountPaise);
          }
        } catch {}
      }
      break;
    }

    // ── Payment failed ────────────────────────────────────────────────────────
    case "payment.failed": {
      const failure = (paymentEntity.error_description as string) ?? "Payment declined";
      await subRef.update({ status: "payment_failed", updatedAt: now });

      await adminDb.collection("subscriptionPayments").add({
        subscriptionId: sub.id,
        customerId:     sub.customerId,
        planId:         sub.planId,
        planName:       sub.planName,
        amountPaise:    Number(paymentEntity.amount ?? sub.pricePaise),
        currency:       sub.currency,
        status:         "failed",
        razorpaySubscriptionId: sub.razorpaySubscriptionId,
        billingPeriodStart: sub.currentPeriodStart,
        billingPeriodEnd:   sub.currentPeriodEnd,
        failureReason:  failure,
        retryCount:     0,
        createdAt:      now,
        updatedAt:      now,
      });

      await logSubscriptionAudit({ subscriptionId: sub.id, customerId: sub.customerId, action: "payment_failed", performedBy: "system", notes: failure });

      if (plan) {
        try { await sendSubscriptionPaymentFailed({ ...sub, status: "payment_failed" }, plan); } catch {}
      }
      break;
    }

    // ── Halted (too many failures) ────────────────────────────────────────────
    case "subscription.halted": {
      await subRef.update({ status: "halted", updatedAt: now });
      await logSubscriptionAudit({ subscriptionId: sub.id, customerId: sub.customerId, action: "halted", performedBy: "system" });
      break;
    }

    // ── Cancelled ─────────────────────────────────────────────────────────────
    case "subscription.cancelled": {
      const cancelAtEnd = subEntity.cancel_at_cycle_end === 1;
      await subRef.update({
        status:           "cancelled",
        cancelledAt:      now,
        cancelAtPeriodEnd: cancelAtEnd,
        updatedAt:        now,
      });
      await logSubscriptionAudit({ subscriptionId: sub.id, customerId: sub.customerId, action: "cancelled_by_provider", performedBy: "system" });

      if (plan) {
        try { await sendSubscriptionCancelled({ ...sub, status: "cancelled", cancelledAt: now, cancelAtPeriodEnd: cancelAtEnd }, plan); } catch {}
      }
      break;
    }

    // ── Completed (all cycles done) ───────────────────────────────────────────
    case "subscription.completed": {
      await subRef.update({ status: "completed", updatedAt: now });
      await logSubscriptionAudit({ subscriptionId: sub.id, customerId: sub.customerId, action: "completed", performedBy: "system" });
      break;
    }

    default:
      // Unhandled event — just mark processed without changes
      break;
  }
}

// ─── Helper: compute period end from Razorpay subscription entity ─────────────
function computePeriodEnd(subEntity: Record<string, unknown>): string {
  // Razorpay provides charge_at (next charge timestamp in seconds)
  const chargeAt = subEntity.charge_at as number | undefined;
  if (chargeAt) {
    return new Date(chargeAt * 1000).toISOString();
  }
  // Fallback: 30 days from now
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}
