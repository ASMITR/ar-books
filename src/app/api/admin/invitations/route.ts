import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { authorInvitationSchema } from "@/lib/validations";
import { sendAuthorInvitationEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import crypto from "crypto";

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

function sanitizeLog(v: string) {
  return v.replace(/[\r\n]/g, "_");
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    void admin;
    const snap = await adminDb
      .collection("authorInvitations")
      .orderBy("createdAt", "desc")
      .get();
    return NextResponse.json({
      success: true,
      data: snap.docs.map((d) => {
        const data = d.data();
        // Never expose the tokenHash to the frontend
        const { tokenHash: _, ...rest } = data;
        void _;
        return { id: d.id, ...rest };
      }),
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
    const parsed = authorInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, name, institution } = parsed.data;

    // Check if this email already has an active invitation or an author account
    const existingInvite = await adminDb
      .collection("authorInvitations")
      .where("email", "==", email.toLowerCase())
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (!existingInvite.empty) {
      return NextResponse.json(
        { success: false, error: "A pending invitation already exists for this email." },
        { status: 409 }
      );
    }

    const existingAuthor = await adminDb
      .collection("authorProfiles")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (!existingAuthor.empty) {
      return NextResponse.json(
        { success: false, error: "An author account already exists with this email." },
        { status: 409 }
      );
    }

    // Generate a 48-byte random token (URL-safe base64)
    const rawToken = crypto.randomBytes(48).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const ref = adminDb.collection("authorInvitations").doc();
    await ref.set({
      email: email.toLowerCase(),
      name,
      institution: institution ?? null,
      tokenHash,
      status: "pending",
      expiresAt,
      invitedBy: admin.uid,
      createdAt: now,
      updatedAt: now,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.asmitrajaramkarbooks.store";
    const invitationLink = `${baseUrl}/author/register?token=${rawToken}&id=${ref.id}`;

    // Send invitation email (non-blocking)
    sendAuthorInvitationEmail(email, name, invitationLink).catch((e) =>
      console.error("[invitations] email error:", sanitizeLog(errMsg(e)))
    );

    // Audit log
    writeAuditLog({
      actorUid: admin.uid,
      actorEmail: admin.email ?? "",
      actorRole: "admin",
      action: "author_invited",
      resourceType: "authorInvitation",
      resourceId: ref.id,
      resourceTitle: name,
      newValues: { email, name, institution },
    }).catch(() => {});

    // Notify the admin themselves (for audit trail in notifications panel)
    createNotification({
      recipientUid: admin.uid,
      type: "author_invited",
      title: "Author Invited",
      message: `You invited ${name} (${email}) to join as an author.`,
      resourceType: undefined,
      resourceId: ref.id,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: { id: ref.id } }, { status: 201 });
  } catch (err) {
    console.error("[invitations/POST]", sanitizeLog(errMsg(err)));
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
