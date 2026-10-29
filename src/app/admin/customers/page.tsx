import { adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { getLockoutStatus } from "@/lib/auth/lockout";
import { CustomersTable } from "@/components/admin/CustomersTable";

export const metadata: Metadata = { title: "Customers" };

interface CustomerRecord {
  id: string;
  displayName?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  emailVerified?: boolean;
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
  const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
  const customers = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomerRecord));
  const members = customers.filter((c) => c.role !== "admin");

  // Fetch lockout status for every member in parallel
  const customersWithLockout: CustomerWithLockout[] = await Promise.all(
    members.map(async (c) => ({
      ...c,
      lockout: c.email ? await getLockoutStatus(c.email) : {
        blocked: false, permanent: false, lockedUntil: null, attempts: 0, remainingMs: 0,
      },
    }))
  );

  const blockedCount = customersWithLockout.filter((c) => c.lockout.blocked).length;

  return (
    <AdminShell
      title="Customers"
      subtitle={`${members.length} registered member${members.length !== 1 ? "s" : ""}${blockedCount > 0 ? ` · ${blockedCount} locked` : ""}`}
    >
      <CustomersTable customers={customersWithLockout} />
    </AdminShell>
  );
}
