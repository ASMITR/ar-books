import { AdminShell } from "@/components/admin/AdminShell";
import { getMembershipPlanById } from "@/lib/firebase/subscriptions";
import { notFound } from "next/navigation";
import { AdminPlanEditForm } from "@/components/membership/AdminPlanEditForm";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic   = "force-dynamic";
export const metadata: Metadata = { title: "Edit Plan — Admin" };

interface Props { params: Promise<{ id: string }> }

export default async function AdminPlanEditPage({ params }: Props) {
  const { id } = await params;
  const plan = await getMembershipPlanById(id);
  if (!plan) notFound();

  return (
    <AdminShell
      title={`Edit — ${plan.name}`}
      subtitle="Update plan details, pricing, and access tiers."
      action={
        <Link href="/admin/membership/plans"
          className="inline-flex items-center gap-1.5 bg-[#F2F0EC] text-[#555] hover:bg-[#E8E5DF] hover:text-[#080808] font-body text-[12px] font-semibold px-4 py-2.5 rounded-lg transition-all">
          ← All Plans
        </Link>
      }
    >
      <AdminPlanEditForm plan={plan} />
    </AdminShell>
  );
}
