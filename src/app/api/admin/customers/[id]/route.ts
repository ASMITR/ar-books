import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

interface Params { params: Promise<{ id: string }> }

/**
 * DELETE /api/admin/customers/[id]
 *
 * Full account wipe — same logic as /api/account/delete but triggered by admin:
 *  1. All Firestore documents belonging to this user (orders, entitlements,
 *     download logs, offer redemptions, newsletter subscriber, user doc)
 *  2. Firebase Auth record
 *
 * Admin only.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id: uid } = await params;

    // Fetch the Auth record first so we have the email for newsletter cleanup
    const userRecord = await adminAuth.getUser(uid).catch(() => null);
    const email = userRecord?.email ?? null;

    // ── 1. Collect every Firestore ref that belongs to this user ─────────────
    const [ordersSnap, entitlementsSnap, downloadLogsSnap, redemptionsSnap] =
      await Promise.all([
        adminDb.collection("orders").where("customerId", "==", uid).get(),
        adminDb.collection("downloadEntitlements").where("customerId", "==", uid).get(),
        adminDb.collection("downloadLogs").where("customerId", "==", uid).get(),
        adminDb.collection("offerRedemptions").where("customerId", "==", uid).get(),
      ]);

    const allRefs = [
      adminDb.collection("users").doc(uid),
      ...ordersSnap.docs.map((d) => d.ref),
      ...entitlementsSnap.docs.map((d) => d.ref),
      ...downloadLogsSnap.docs.map((d) => d.ref),
      ...redemptionsSnap.docs.map((d) => d.ref),
    ];

    // Newsletter subscriber doc is keyed by SHA-256 of the email
    if (email) {
      const subscriberId = createHash("sha256")
        .update(email.toLowerCase())
        .digest("hex");
      allRefs.push(adminDb.collection("newsletterSubscribers").doc(subscriberId));
    }

    // ── 2. Batch-delete all Firestore docs (max 500 ops per batch) ────────────
    const BATCH_LIMIT = 500;
    for (let i = 0; i < allRefs.length; i += BATCH_LIMIT) {
      const batch = adminDb.batch();
      allRefs.slice(i, i + BATCH_LIMIT).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }

    // ── 3. Delete Firebase Auth record ────────────────────────────────────────
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[admin/customers/delete]", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

/**
 * POST /api/admin/customers/[id]
 * Body: { action: "resend-verification" }
 * Generates a fresh email-verification link and sends it.
 * Admin only.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { action } = await req.json();

    if (action === "resend-verification") {
      const user = await adminAuth.getUser(id);
      if (!user.email) {
        return NextResponse.json({ error: "User has no email" }, { status: 422 });
      }
      if (user.emailVerified) {
        return NextResponse.json({ error: "Email already verified" }, { status: 422 });
      }
      const link = await adminAuth.generateEmailVerificationLink(user.email);

      // Use the email helper if available, otherwise just return the link so
      // the admin can send it manually.
      try {
        const { sendEmailVerificationLink } = await import("@/lib/email");
        await sendEmailVerificationLink(user.email, user.displayName ?? "there", link);
      } catch {
        // email module may not export this — non-fatal, return the link
        return NextResponse.json({ success: true, link });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[admin/customers/action]", err);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
