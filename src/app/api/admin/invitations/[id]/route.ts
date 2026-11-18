import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { writeAuditLog } from "@/lib/audit";

interface Params { params: Promise<{ id: string }> }

function sanitizeLog(v: string) {
  return v.replace(/[\r\n]/g, "_");
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const doc = await adminDb.collection("authorInvitations").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const data = doc.data()!;
    if (data.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending invitations can be revoked." },
        { status: 400 }
      );
    }

    await doc.ref.update({
      status: "revoked",
      updatedAt: new Date().toISOString(),
    });

    writeAuditLog({
      actorUid: admin.uid,
      actorEmail: admin.email ?? "",
      actorRole: "admin",
      action: "invitation_revoked",
      resourceType: "authorInvitation",
      resourceId: id,
      resourceTitle: data.name as string,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[invitations/DELETE]", sanitizeLog(err instanceof Error ? err.message : String(err)));
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** PATCH — resend an invitation (regenerates token, resets expiry) */
export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const crypto = await import("crypto");

    const doc = await adminDb.collection("authorInvitations").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const data = doc.data()!;
    if (data.status !== "pending" && data.status !== "expired") {
      return NextResponse.json(
        { error: "Only pending or expired invitations can be resent." },
        { status: 400 }
      );
    }

    const rawToken = crypto.randomBytes(48).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await doc.ref.update({ tokenHash, expiresAt, status: "pending", updatedAt: now });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.asmitrajaramkarbooks.store";
    const invitationLink = `${baseUrl}/author/register?token=${rawToken}&id=${id}`;

    const { sendAuthorInvitationEmail } = await import("@/lib/email");
    sendAuthorInvitationEmail(data.email as string, data.name as string, invitationLink).catch(() => {});

    writeAuditLog({
      actorUid: admin.uid,
      actorEmail: admin.email ?? "",
      actorRole: "admin",
      action: "invitation_resent",
      resourceType: "authorInvitation",
      resourceId: id,
      resourceTitle: data.name as string,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
