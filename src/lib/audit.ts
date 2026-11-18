import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { AuditLog, UserRole } from "@/types";

export async function writeAuditLog(params: {
  actorUid: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceTitle?: string;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  const ref = adminDb.collection("auditLogs").doc();
  const log: Omit<AuditLog, "id"> = {
    ...params,
    createdAt: new Date().toISOString(),
  };
  await ref.set(log).catch((e) =>
    console.error("[audit] write failed:", e instanceof Error ? e.message : String(e))
  );
}
