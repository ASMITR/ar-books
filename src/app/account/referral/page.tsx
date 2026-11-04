import { getSessionUser } from "@/lib/firebase/auth-server";
import { adminDb } from "@/lib/firebase/admin";
import { getReferralRewardsByReferrer } from "@/lib/firebase/firestore";
import { CopyButton } from "@/components/shared/CopyButton";
import { Gift, Users, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refer a Friend — My Account" };

export default async function ReferralPage() {
  const user     = await getSessionUser();
  const userDoc  = await adminDb.collection("users").doc(user!.uid).get();
  const userData = userDoc.data();

  const referralCode: string  = userData?.referralCode ?? user!.uid.slice(0, 8).toUpperCase();
  const referralCount: number = userData?.referralCount ?? 0;
  const rewards               = await getReferralRewardsByReferrer(user!.uid);
  const baseUrl               = process.env.NEXT_PUBLIC_BASE_URL ?? "https://arbooks.in";
  const referralLink          = `${baseUrl}/register?ref=${referralCode}`;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.28em] text-[#B8B3AB] mb-1.5">Account</p>
        <h1 className="font-heading text-[28px] sm:text-[32px] font-bold text-[#111] leading-none">Refer a Friend</h1>
        <p className="font-body text-[13px] text-[#999] mt-2">
          Share your link. When a friend signs up, you get a <strong className="text-[#111]">10% off coupon</strong>.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 bg-[#F2EFE9] rounded-xl flex items-center justify-center shrink-0">
            <Users size={16} className="text-[#203A2B]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-2xl sm:text-3xl font-bold text-[#203A2B] leading-none">{referralCount}</p>
            <p className="text-[10px] sm:text-[11px] font-body uppercase tracking-[0.12em] text-[#B8B3AB] mt-1">Friends Referred</p>
          </div>
        </div>
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 bg-[#FFC928]/10 rounded-xl flex items-center justify-center shrink-0">
            <Gift size={16} className="text-[#C6A66B]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-2xl sm:text-3xl font-bold text-[#C6A66B] leading-none">{rewards.length}</p>
            <p className="text-[10px] sm:text-[11px] font-body uppercase tracking-[0.12em] text-[#B8B3AB] mt-1">Rewards Earned</p>
          </div>
        </div>
      </div>

      {/* Share section */}
      <div className="bg-white border border-black/[0.06] rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
        <h2 className="font-heading text-[15px] font-semibold text-[#111]">Your Referral Link</h2>

        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#999]">Referral Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 bg-[#F5F2EE] border border-black/[0.06] px-4 py-2.5 font-mono text-sm font-bold text-[#203A2B] tracking-widest rounded-xl truncate">
              {referralCode}
            </code>
            <CopyButton text={referralCode} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#999]">Share Link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 bg-[#F5F2EE] border border-black/[0.06] px-4 py-2.5 font-mono text-xs text-[#555] rounded-xl truncate">
              {referralLink}
            </code>
            <CopyButton text={referralLink} />
          </div>
        </div>

        <p className="font-body text-[12px] text-[#B8B3AB] leading-relaxed">
          Share this link with friends. When they create an account, you automatically receive a 10% discount coupon.
        </p>
      </div>

      {/* Rewards history */}
      <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-black/[0.05] flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#F2EFE9] rounded-lg flex items-center justify-center shrink-0">
            <Tag size={13} className="text-[#203A2B]" strokeWidth={2} />
          </div>
          <h2 className="font-heading text-[15px] font-semibold text-[#111]">Your Reward Coupons</h2>
        </div>

        {rewards.length === 0 ? (
          <div className="px-5 py-12 text-center flex flex-col items-center gap-3">
            <div className="w-11 h-11 bg-[#F5F2EE] rounded-2xl flex items-center justify-center">
              <Gift size={18} className="text-[#C8C3BC]" strokeWidth={1.5} />
            </div>
            <p className="font-body text-sm text-[#999]">No rewards yet. Share your link to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {rewards.map((r) => (
              <div key={r.id} className="px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-body font-semibold text-[#111] truncate">{r.referredEmail}</p>
                  <p className="text-[11px] font-body text-[#B8B3AB] mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <code className="hidden sm:block bg-[#FFFBEB] border border-[#FFC928]/30 text-[#111] font-mono text-xs font-bold px-3 py-1.5 tracking-wider rounded-lg">
                    {r.couponCode}
                  </code>
                  <CopyButton text={r.couponCode} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
