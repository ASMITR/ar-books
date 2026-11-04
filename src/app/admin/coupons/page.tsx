import { adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { Gift, Users, Tag } from "lucide-react";
import type { ReferralReward } from "@/types";

async function getReferralStats() {
  const [rewardsSnap, usersSnap] = await Promise.all([
    adminDb.collection("referralRewards").orderBy("createdAt", "desc").get(),
    adminDb.collection("users").where("referralCount", ">", 0).get(),
  ]);

  const rewards = rewardsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ReferralReward));
  const topReferrers = usersSnap.docs
    .map((d) => ({ uid: d.id, email: d.data().email as string, referralCount: d.data().referralCount as number }))
    .sort((a, b) => b.referralCount - a.referralCount)
    .slice(0, 10);

  return { rewards, topReferrers };
}

export default async function AdminReferralsPage() {
  const { rewards, topReferrers } = await getReferralStats();

  const stats = [
    { label: "Total Referrals", value: rewards.length, icon: Users, color: "text-[#203A2B]" },
    { label: "Coupons Issued",  value: rewards.length, icon: Tag,   color: "text-[#C6A66B]" },
    { label: "Active Referrers",value: topReferrers.length, icon: Gift, color: "text-[#789185]" },
  ];

  return (
    <AdminShell
      title="Referrals"
      subtitle={`${rewards.length} referral${rewards.length !== 1 ? "s" : ""} total`}
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#E6E3DD] rounded-xl px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} strokeWidth={2} />
              <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#b0aca6]">{label}</p>
            </div>
            <p className={`font-heading text-[26px] font-bold leading-none ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Referral log */}
        <div className="xl:col-span-2 bg-white border border-[#E6E3DD] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E6E3DD] flex items-center gap-2">
            <Gift size={14} className="text-[#203A2B]" />
            <h2 className="font-heading text-sm font-semibold text-[#080808]">Referral Log</h2>
          </div>

          {rewards.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <Gift size={28} className="text-[#E6E3DD]" strokeWidth={1.5} />
              <p className="text-[13px] font-body text-[#b0aca6]">No referrals yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F2F0EC]">
              {rewards.map((r) => (
                <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13px] font-body font-semibold text-[#080808] truncate">{r.referredEmail}</p>
                    <p className="text-[11px] font-body text-[#b0aca6] mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <code className="shrink-0 bg-[#FFF8E1] border border-[#FFC928]/30 text-[#080808] font-mono text-xs font-bold px-3 py-1.5 tracking-wider rounded">
                    {r.couponCode}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top referrers */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E6E3DD] flex items-center gap-2">
            <Users size={14} className="text-[#203A2B]" />
            <h2 className="font-heading text-sm font-semibold text-[#080808]">Top Referrers</h2>
          </div>

          {topReferrers.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <Users size={28} className="text-[#E6E3DD]" strokeWidth={1.5} />
              <p className="text-[13px] font-body text-[#b0aca6]">No referrers yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F2F0EC]">
              {topReferrers.map((u, i) => (
                <div key={u.uid} className="px-5 py-3.5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#F2F0EC] flex items-center justify-center text-[11px] font-bold text-[#9e9a94] shrink-0">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-[13px] font-body text-[#080808] truncate min-w-0">{u.email}</p>
                  <span className="shrink-0 font-heading text-sm font-bold text-[#203A2B]">{u.referralCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
