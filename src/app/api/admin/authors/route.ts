import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { writeAuditLog } from "@/lib/audit";
import { createNotification, getAdminUids } from "@/lib/notifications";
import { z } from "zod";
import { passwordSchema } from "@/lib/validations";

const createAuthorSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  institution: z.string().optional(),
});

function sanitizeLog(v: string) { return v.replace(/[\r\n]/g, "_"); }
function errMsg(e: unknown) { return sanitizeLog(e instanceof Error ? e.message : String(e)); }

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb
      .collection("authorProfiles")
      .orderBy("createdAt", "desc")
      .get();
    return NextResponse.json({
      success: true,
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();
    const parsed = createAuthorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const { displayName, email, password, institution } = parsed.data;

    // Check no existing author profile with this email
    const existingProfile = await adminDb
      .collection("authorProfiles")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();
    if (!existingProfile.empty) {
      return NextResponse.json(
        { success: false, error: "An author account already exists with this email." },
        { status: 409 }
      );
    }

    // Create Firebase Auth user
    let uid: string;
    try {
      const userRecord = await adminAuth.createUser({
        email: email.toLowerCase(),
        password,
        displayName,
        emailVerified: true, // owner-created accounts are pre-verified
      });
      uid = userRecord.uid;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("EMAIL_EXISTS") || msg.includes("email-already-exists")) {
        return NextResponse.json(
          { success: false, error: "A Firebase account already exists with this email." },
          { status: 409 }
        );
      }
      throw e;
    }

    // Set the `author` custom claim
    await adminAuth.setCustomUserClaims(uid, { author: true });

    const now = new Date().toISOString();

    // Write Firestore user doc
    await adminDb.collection("users").doc(uid).set({
      displayName,
      email: email.toLowerCase(),
      emailVerified: true,
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
    await adminDb.collection("authorProfiles").doc(uid).set({
      uid,
      displayName,
      email: email.toLowerCase(),
      bio: null,
      photoURL: null,
      institution: institution ?? null,
      website: null,
      socialLinks: [],
      accountStatus: "active",
      invitationId: null,
      invitedBy: admin.uid,
      createdAt: now,
      updatedAt: now,
    });

    // Notify admins
    const adminUids = await getAdminUids();
    for (const adminUid of adminUids) {
      createNotification({
        recipientUid: adminUid,
        type: "author_registered",
        title: "New Author Account Created",
        message: `${displayName} (${email}) has been added as an author by the owner.`,
        resourceId: uid,
      }).catch(() => {});
    }

    writeAuditLog({
      actorUid: admin.uid,
      actorEmail: admin.email ?? "",
      actorRole: "admin",
      action: "author_created",
      resourceType: "authorProfile",
      resourceId: uid,
      resourceTitle: displayName,
      newValues: { email, displayName, institution },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: { uid } }, { status: 201 });
  } catch (err) {
    console.error("[admin/authors POST]", errMsg(err));
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
