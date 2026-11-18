import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";
import { passwordSchema } from "@/lib/validations";

interface Params { params: Promise<{ id: string }> }

const patchSchema = z.object({
  accountStatus: z.enum(["active", "suspended", "deactivated"]).optional(),
  displayName: z.string().min(2).optional(),
  bio: z.string().max(1000).optional(),
  institution: z.string().optional(),
  // Owner can reset the author's password directly
  newPassword: passwordSchema.optional(),
});

function sanitizeLog(v: string) { return v.replace(/[\r\n]/g, "_"); }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const doc = await adminDb.collection("authorProfiles").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Author not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const doc = await adminDb.collection("authorProfiles").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Author not found" }, { status: 404 });

    const profileData = doc.data()!;

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { accountStatus, newPassword, ...otherFields } = parsed.data;
    const now = new Date().toISOString();

    // Owner resets password directly via Firebase Admin SDK
    if (newPassword) {
      await adminAuth.updateUser(id, { password: newPassword });
      // Revoke existing sessions so the new password takes effect immediately
      await adminAuth.revokeRefreshTokens(id);
    }

    // If changing account status, also update Firebase Auth and user doc
    if (accountStatus && accountStatus !== profileData.accountStatus) {
      if (accountStatus === "suspended" || accountStatus === "deactivated") {
        // Revoke all sessions for this author
        await adminAuth.revokeRefreshTokens(id);
        // Disable their Firebase Auth account
        await adminAuth.updateUser(id, { disabled: true });
        // Remove the author claim
        await adminAuth.setCustomUserClaims(id, { author: false });
      } else if (accountStatus === "active") {
        // Re-enable their account and restore the author claim
        await adminAuth.updateUser(id, { disabled: false });
        await adminAuth.setCustomUserClaims(id, { author: true });
      }

      // Update the user doc role
      const newRole = accountStatus === "active" ? "author" : "member";
      await adminDb.collection("users").doc(id).update({
        role: newRole,
        updatedAt: now,
      });

      // Notify the author
      createNotification({
        recipientUid: id,
        type: "author_suspended",
        title: accountStatus === "active" ? "Your author account has been reinstated" : "Your author account has been suspended",
        message: accountStatus === "active"
          ? "Your author account is active again. You can now access your author dashboard."
          : "Your author account has been suspended. Please contact support for assistance.",
      }).catch(() => {});
    }

    await doc.ref.update({
      ...otherFields,
      ...(accountStatus && { accountStatus }),
      updatedAt: now,
    });

    writeAuditLog({
      actorUid: admin.uid,
      actorEmail: admin.email ?? "",
      actorRole: "admin",
      action: accountStatus ? `author_${accountStatus}` : newPassword ? "author_password_reset" : "author_updated",
      resourceType: "authorProfile",
      resourceId: id,
      resourceTitle: profileData.displayName as string,
      previousValues: { accountStatus: profileData.accountStatus },
      newValues: { ...parsed.data, newPassword: newPassword ? "[redacted]" : undefined },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/authors PATCH]", sanitizeLog(err instanceof Error ? err.message : String(err)));
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
