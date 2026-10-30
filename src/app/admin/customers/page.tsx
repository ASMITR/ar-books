import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Metadata } from "next";
import { getLockoutStatus } from "@/lib/auth/lockout";
import { CustomersTable } from "@/components/admin/CustomersTable";

export const metadata: Metadata = { title: "Customers" };

interface CustomerRecord {
  id: string;
  displayName?: string | null;
  email?: string | null;
  role?: string;
  createdAt?: string;
  emailVerified?: boolean;
  photoURL?: string | null;
  provider?: string;
}

export interface CustomerWithLockout extends CustomerRecord {
  lockout: {
    blocked: boolean;
    permanent: boolean;
    lockedUntil: string | null;
    attempts: number;
    remainingMs: number;
  };
}

export default async function AdminCustomersPage() {
  // ── 1. Get all users from Firebase Auth (source of truth) ─────────────────
  // listUsers returns up to 1000 per page; for most stores this is sufficient.
  const authListResult = await adminAuth.listUsers(1000);
  const authUsers = authListResult.users;

  // ── 2. Get Firestore user docs for extra metadata (role, etc.) ─────────────
  const snap = await adminDb.collection("users").get();
  const firestoreMap = new Map<string, Record<string, unknown>>();
  snap.docs.forEach((d) => firestoreMap.set(d.id, d.data() as Record<string, unknown>));

  // ── 3. Merge: Auth is primary, Firestore fills in role/provider ────────────
  const allUsers: CustomerRecord[] = authUsers.map((u) => {
    const fsDoc = firestoreMap.get(u.uid) ?? {};
    return {
      id: u.uid,
      displayName: u.displayName ?? (fsDoc.displayName as string | null) ?? null,
      email: u.email ?? null,
      emailVerified: u.emailVerified,
      photoURL: u.photoURL ?? null,
      role: (fsDoc.role as string | undefined) ?? "member",
      createdAt: u.metadata.creationTime ?? (fsDoc.createdAt as string | undefined),
      provider: u.providerData?.[0]?.providerId ?? (fsDoc.provider as string | undefined) ?? "password",
    };
  });

  // Filter out admins
  const members = allUsers.filter((c) => c.role !== "admin");

  // ── 4. Fetch lockout status in parallel ────────────────────────────────────
  const customersWithLockout: CustomerWithLockout[] = await Promise.all(
    members.map(async (c) => ({
      ...c,
      lockout: c.email
        ? await getLockoutStatus(c.email)
        : { blocked: false, permanent: false, lockedUntil: null, attempts: 0, remainingMs: 0 },
    }))
  );

  // Sort: newest first
  customersWithLockout.sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

  const blockedCount = customersWithLockout.filter((c) => c.lockout.blocked).length;
  const verifiedCount = customersWithLockout.filter((c) => c.emailVerified).length;

  return (
    <AdminShell
      title="Customers"
      subtitle={`${members.length} registered member${members.length !== 1 ? "s" : ""} · ${verifiedCount} verified${blockedCount > 0 ? ` · ${blockedCount} locked` : ""}`}
    >
      <CustomersTable customers={customersWithLockout} />
    </AdminShell>
  );
}
