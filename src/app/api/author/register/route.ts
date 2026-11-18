import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { authorRegistrationSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { createNotification, getAdminUids } from "@/lib/notifications";
import { rateLimit } from "@/lib/ratelimit";
import crypto from "crypto";

function sanitizeLog(v: string) {
  return v.replace(/[\r\n]/g, "_");
}
function errMsg(e: unknown) {
  return sanitizeLog(e instanceof Error ? e.message : String(e));
}

/**
 * POST /api/author/register
 *
 * Step 1: GET — validate the invitation token and return metadata (name, email).
 * Step 2: POST — accept the invitation; create Firebase Auth account + author profile.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const id = req.nextUrl.searchParams.get("id");

  if (!token || !id) {
    return NextResponse.json({ error: "Missing token or id" }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const doc = await adminDb.collection("authorInvitations").doc(id).get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  const data = doc.data()!;

  // Constant-time comparison to prevent timing attacks
  const storedHash = Buffer.from(data.tokenHash as string, "hex");
  const suppliedHash = Buffer.from(tokenHash, "hex");
  if (storedHash.length !== suppliedHash.length || !crypto.timingSafeEqual(storedHash, suppliedHash)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (data.status === "accepted") {
    return NextResponse.json({ error: "This invitation has already been used." }, { status: 410 });
  }
  if (data.status === "revoked") {
    return NextResponse.json({ error: "This invitation has been revoked." }, { status: 410 });
  }
  if (data.status === "expired" || new Date(data.expiresAt as string) < new Date()) {
    if (data.status !== "expired") {
      await doc.ref.update({ status: "expired", updatedAt: new Date().toISOString() });
    }
    return NextResponse.json({ error: "This invitation has expired." }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    data: {
      name: data.name,
      email: data.email,
      institution: data.institution ?? null,
    },
  });
}

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
    const body = await req.json();
    const parsed = authorRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const { token, displayName, password } = parsed.data;
    const invitationId = body.invitationId as string;

    if (!invitationId || typeof invitationId !== "string") {
      return NextResponse.json({ error: "Missing invitationId" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Run as a transaction to prevent double-registration races
    await adminDb.runTransaction(async (tx) => {
      const inviteRef = adminDb.collection("authorInvitations").doc(invitationId);
      const inviteDoc = await tx.get(inviteRef);

      if (!inviteDoc.exists) throw new Error("INVITATION_NOT_FOUND");

      const invite = inviteDoc.data()!;

      // Token verification
      const storedHash = Buffer.from(invite.tokenHash as string, "hex");
      const suppliedHash = Buffer.from(tokenHash, "hex");
      if (storedHash.length !== suppliedHash.length || !crypto.timingSafeEqual(storedHash, suppliedHash)) {
        throw new Error("INVALID_TOKEN");
      }

      if (invite.status !== "pending") throw new Error("INVITATION_USED_OR_EXPIRED");
      if (new Date(invite.expiresAt as string) < new Date()) throw new Error("INVITATION_EXPIRED");

      const email = invite.email as string;

      // Create Firebase Auth user
      let uid: string;
      try {
        const created = await adminAuth.createUser({
          email,
          password,
          displayName,
          emailVerified: false,
        });
        uid = created.uid;
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("EMAIL_EXISTS")) {
          throw new Error("EMAIL_ALREADY_EXISTS");
        }
        throw e;
      }

      // Set the `author` custom claim
      await adminAuth.setCustomUserClaims(uid, { author: true });

      const now = new Date().toISOString();

      // Write Firestore user doc (same collection as customers so admin can see all users)
      const userRef = adminDb.collection("users").doc(uid);
      tx.set(userRef, {
        displayName,
        email,
        emailVerified: false,
        photoURL: null,
        role: "author",
        referralCode: uid.slice(0, 8).toUpperCase(),
        referredBy: null,
        referralCount: 0,
        createdAt: now,
        updatedAt: now,
        provider: "password",
      });

      // Write author profile
      const profileRef = adminDb.collection("authorProfiles").doc(uid);
      tx.set(profileRef, {
        uid,
        displayName,
        email,
        bio: null,
        photoURL: null,
        institution: invite.institution ?? null,
        website: null,
        socialLinks: [],
        accountStatus: "active",
        invitationId,
        invitedBy: invite.invitedBy,
        createdAt: now,
        updatedAt: now,
      });

      // Mark invitation as accepted
      tx.update(inviteRef, {
        status: "accepted",
        acceptedAt: now,
        acceptedByUid: uid,
        updatedAt: now,
      });
    });

    // Fetch the UID from the user we just created (outside transaction)
    const userRecord = await adminAuth.getUserByEmail(
      (await adminDb.collection("authorInvitations").doc(invitationId).get()).data()!.email as string
    );
    const uid = userRecord.uid;

    // Welcome email
    sendWelcomeEmail(userRecord.email!, displayName).catch((e) =>
      console.error("[author/register] welcome email:", errMsg(e))
    );

    // Notify admins
    const adminUids = await getAdminUids();
    const profileData = (await adminDb.collection("authorProfiles").doc(uid).get()).data()!;
    adminUids.forEach((adminUid) => {
      createNotification({
        recipientUid: adminUid,
        type: "author_registered",
        title: "New Author Registered",
        message: `${displayName} (${userRecord.email}) has accepted their invitation and created an author account.`,
        resourceId: uid,
      }).catch(() => {});
    });

    writeAuditLog({
      actorUid: uid,
      actorEmail: userRecord.email ?? "",
      actorRole: "author",
      action: "author_registered",
      resourceType: "authorProfile",
      resourceId: uid,
      resourceTitle: displayName,
      newValues: { email: userRecord.email, institution: profileData.institution },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "INVITATION_NOT_FOUND") {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }
    if (msg === "INVALID_TOKEN") {
      return NextResponse.json({ error: "Invalid or tampered invitation link." }, { status: 403 });
    }
    if (msg === "INVITATION_USED_OR_EXPIRED" || msg === "INVITATION_EXPIRED") {
      return NextResponse.json({ error: "This invitation has expired or already been used." }, { status: 410 });
    }
    if (msg === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("[author/register]", sanitizeLog(msg));
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
