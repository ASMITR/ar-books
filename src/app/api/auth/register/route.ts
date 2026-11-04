import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";
import { getUserByReferralCode } from "@/lib/firebase/firestore";

function sanitizeLog(value: string): string {
  return value.replace(/[\r\n]/g, "_");
}

function errMsg(e: unknown): string {
  return sanitizeLog(e instanceof Error ? e.message : String(e));
}

/** Generate a short unique referral code from uid */
function generateReferralCode(uid: string): string {
  return uid.slice(0, 8).toUpperCase();
}

/**
 * POST /api/auth/register
 *
 * Called immediately after a new Firebase account is created on the client.
 * - Verifies the ID token
 * - Confirms the account is brand-new (< 2 min old)
 * - Writes a user document to Firestore `users` collection
 * - Sends a welcome email via Resend
 *
 * Body: { idToken: string }
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed, retryAfterMs } = rateLimit(ip, { limit: 5, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const { idToken, referralCode } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const userRecord = await adminAuth.getUser(decoded.uid);

    const createdAt = new Date(userRecord.metadata.creationTime).getTime();
    const ageMs = Date.now() - createdAt;
    const TWO_MINUTES = 2 * 60 * 1000;

    if (ageMs > TWO_MINUTES) {
      return NextResponse.json({ skipped: true });
    }

    const email = userRecord.email;
    const name = userRecord.displayName ?? "there";

    if (!email) {
      return NextResponse.json({ error: "No email on account" }, { status: 422 });
    }

    // ── Write user document to Firestore so it appears in the admin dashboard ──
    const now = new Date().toISOString();
    const myReferralCode = generateReferralCode(userRecord.uid);

    // Resolve referrer if a valid referral code was provided
    let referrerId: string | null = null;
    if (referralCode && typeof referralCode === "string") {
      const referrer = await getUserByReferralCode(referralCode.trim());
      if (referrer && referrer.uid !== userRecord.uid) {
        referrerId = referrer.uid;
      }
    }

    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set(
        {
          displayName: userRecord.displayName ?? null,
          email,
          emailVerified: userRecord.emailVerified ?? false,
          photoURL: userRecord.photoURL ?? null,
          role: "member",
          referralCode: myReferralCode,
          referredBy: referrerId ? referralCode!.trim().toUpperCase() : null,
          referralCount: 0,
          createdAt: now,
          updatedAt: now,
          provider: userRecord.providerData?.[0]?.providerId ?? "password",
        },
        { merge: true }
      );

    // ── Credit referrer: increment count + create a reward coupon ────────────
    if (referrerId) {
      const rewardCode = `REF-${myReferralCode}-${Date.now().toString(36).toUpperCase()}`;
      const couponRef = adminDb.collection("coupons").doc();
      const rewardRef = adminDb.collection("referralRewards").doc();

      const batch = adminDb.batch();

      // Create a 10% discount coupon for the referrer
      batch.set(couponRef, {
        code: rewardCode,
        discountType: "percent",
        discountValue: 10,
        usageLimit: 1,
        usageCount: 0,
        enabled: true,
        createdAt: now,
      });

      // Record the referral reward
      batch.set(rewardRef, {
        referrerId,
        referredUserId: userRecord.uid,
        referredEmail: email,
        couponId: couponRef.id,
        couponCode: rewardCode,
        createdAt: now,
      });

      // Increment referrer's count
      batch.update(adminDb.collection("users").doc(referrerId), {
        referralCount: FieldValue.increment(1),
        updatedAt: now,
      });

      await batch.commit();
    }

    // Non-fatal — don't block the registration flow
    sendWelcomeEmail(email, name).catch((e) =>
      console.error("[auth/register] welcome email failed:", errMsg(e))
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/register]", errMsg(err));
    return NextResponse.json({ error: "Registration post-processing failed" }, { status: 500 });
  }
}
