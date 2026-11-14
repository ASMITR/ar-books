import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { getAllMembershipPlans } from "@/lib/firebase/subscriptions";
import { PlusCircle } from "lucide-react";
import { AdminMembershipPlansClient } from "@/components/membership/AdminMembershipPlansClient";
import type { Metadata } from "next";

export const dynamic  = "force-dynamic";
export const metadata: Metadata = { title: "Membership Plans — Admin" };

export default async function AdminMembershipPlansPage() {
  const plans = await getAllMembershipPlans();

  return (
    <AdminShell
      title="Membership Plans"
      subtitle={`${plans.length} plan${plans.length !== 1 ? "s" : ""}`}
      action={
        <AdminButton id="open-create-plan" icon={<PlusCircle />}>
          Create Plan
        </AdminButton>
      }
    >
      <AdminMembershipPlansClient initialPlans={plans} />
    </AdminShell>
  );
}
