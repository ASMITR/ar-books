import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireMember } from "@/lib/firebase/auth-server";

/**
 * DELETE /api/account/delete
 *
 * Permanently deletes the authenticated member's account:
 * - All Firestore documents belonging to this user
 * - Firebase Auth record
 * - Session cookie
 *
 * The client must re-authenticate the user (Firebase client SDK) before
 * calling this endpoint; Firebase Auth will reject the deletion if the
 * session is stale, which is the right security behaviour.
 *
 * Cloudinary assets: members do not upload any assets to Cloudinary
 * (books and their PDFs are admin-managed), so there is nothing to clean
 * up there for a member account.
 */
export async function DELETE() {
  let uid: string;
  let email: string | null;

  try {
    const user = await requireMember();
    uid = user.uid;
    email = user.email;
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    // ── 1. Collect all Firestore collections that reference this user ─────────
    const [ordersSnap, entitlementsSnap, downloadLogsSnap, redemptionsSnap] =
      await Promise.all([
        adminDb.collection("orders").where("customerId", "==", uid).get(),
        adminDb
          .collection("downloadEntitlements")
          .where("customerId", "==", uid)
          .get(),
        adminDb
          .collection("downloadLogs")
          .where("customerId", "==", uid)
          .get(),
        adminDb
          .collection("offerRedemptions")
          .where("customerId", "==", uid)
          .get(),
      ]);

    // ── 2. Batch-delete all user documents ────────────────────────────────────
    // Firestore batches are capped at 500 operations; chunk if needed.
    const allRefs = [
      // User profile
      adminDb.collection("users").doc(uid),
      // Orders
      ...ordersSnap.docs.map((d) => d.ref),
      // Download entitlements
      ...entitlementsSnap.docs.map((d) => d.ref),
      // Download logs
      ...downloadLogsSnap.docs.map((d) => d.ref),
      // Offer redemptions
      ...redemptionsSnap.docs.map((d) => d.ref),
    ];

    // Newsletter subscriber doc is keyed by SHA-256 of the email
    if (email) {
      const subscriberId = createHash("sha256")
        .update(email.toLowerCase())
        .digest("hex");
      allRefs.push(adminDb.collection("newsletterSubscribers").doc(subscriberId));
    }

    const BATCH_LIMIT = 500;
    for (let i = 0; i < allRefs.length; i += BATCH_LIMIT) {
      const batch = adminDb.batch();
      allRefs.slice(i, i + BATCH_LIMIT).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }

    // ── 3. Delete the Firebase Auth record ────────────────────────────────────
    await adminAuth.deleteUser(uid);

    // ── 4. Clear the session cookie ───────────────────────────────────────────
    const res = NextResponse.json({ success: true });
    res.cookies.set("session", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    console.error("[delete-account] error:", err);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 },
    );
  }
}
