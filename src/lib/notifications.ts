import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { Notification, NotificationType } from "@/types";

export async function createNotification(params: {
  recipientUid: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType?: "book" | "series";
  resourceId?: string;
  resourceTitle?: string;
}): Promise<void> {
  const ref = adminDb.collection("notifications").doc();
  const notification: Omit<Notification, "id"> = {
    ...params,
    read: false,
    createdAt: new Date().toISOString(),
  };
  await ref.set(notification).catch((e) =>
    console.error("[notifications] write failed:", e instanceof Error ? e.message : String(e))
  );
}

/** Create the same notification for multiple recipients in parallel. */
export async function notifyMany(
  recipientUids: string[],
  params: Omit<Parameters<typeof createNotification>[0], "recipientUid">
): Promise<void> {
  await Promise.all(
    recipientUids.map((uid) => createNotification({ ...params, recipientUid: uid }))
  );
}

/** Returns the UID(s) of all active admins so we can notify them. */
export async function getAdminUids(): Promise<string[]> {
  const snap = await adminDb
    .collection("users")
    .where("role", "==", "admin")
    .get();
  return snap.docs.map((d) => d.id);
}
