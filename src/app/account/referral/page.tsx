import { getSessionUser } from "@/lib/firebase/auth-server";
import { adminDb } from "@/lib/firebase/admin";
import { getReferralRewardsByReferrer } from "@/lib/firebase/firestore";
import { CopyButton } from "@/components/shared/CopyButton";
import { Gift, Users, Tag, Share2, Sparkles } from "lucide-react";
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
    <div className="flex flex-col gap-5 sm:gap-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0D1F17] rounded-2xl flex items-center justify-center shrink-0">
          <Share2 size={16} className="text-[#FFC928]" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#B8B3AB] leading-none mb-1">Earn rewards</p>
          <h1 className="font-heading text-[26px] sm:text-[30px] font-bold text-[#111] leading-none">Refer a Friend</h1>
        </div>
      </div>

      {/* ── Hero reward banner ──────────────────────────────────────────── */}
      <div className="relative bg-[#0D1F17] rounded-3xl p-6 sm:p-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-[#FFC928]/[0.07] blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-[#203A2B]/80 blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
          <div className="w-14 h-14 bg-[#FFC928]/10 border border-[#FFC928]/20 rounded-2xl flex items-center justify-center shrink-0">
            <Gift size={24} className="text-[#FFC928]" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-white/30 mb-1.5 flex items-center gap-1.5">
              <Sparkles size={9} className="text-[#FFC928]/50" /> How it works
            </p>
            <h2 className="font-heading text-[18px] sm:text-[22px] font-bold text-white leading-snug">
              Share your link. Earn <span className="text-[#FFC928]">10% off</span> for every friend.
            </h2>
            <p className="font-body text-[12px] text-white/30 mt-2 leading-relaxed max-w-md">
              When a friend signs up using your referral link, you automatically receive a 10% discount coupon for your next purchase.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 bg-[#F2EFE9] rounded-2xl flex items-center justify-center shrink-0">
            <Users size={16} className="text-[#203A2B]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-[28px] sm:text-[32px] font-bold text-[#203A2B] leading-none">{referralCount}</p>
            <p className="text-[10px] sm:text-[11px] font-body uppercase tracking-[0.12em] text-[#B8B3AB] mt-1">Friends Referred</p>
          </div>
        </div>
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 bg-[#FFC928]/10 rounded-2xl flex items-center justify-center shrink-0">
            <Gift size={16} className="text-[#C6A66B]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-[28px] sm:text-[32px] font-bold text-[#C6A66B] leading-none">{rewards.length}</p>
            <p className="text-[10px] sm:text-[11px] font-body uppercase tracking-[0.12em] text-[#B8B3AB] mt-1">Rewards Earned</p>
          </div>
        </div>
      </div>

      {/* ── Share section ───────────────────────────────────────────────── */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
        <h2 className="font-heading text-[15px] font-bold text-[#111]">Your Referral Link</h2>

        <div className="flex flex-col gap-1.5">
          <p className="text-[10.5px] font-body font-bold uppercase tracking-[0.1em] text-[#999]">Referral Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 bg-[#F5F2EE] border border-black/[0.06] px-4 py-2.5 font-mono text-sm font-bold text-[#203A2B] tracking-widest rounded-xl truncate">
              {referralCode}
            </code>
            <CopyButton text={referralCode} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[10.5px] font-body font-bold uppercase tracking-[0.1em] text-[#999]">Share Link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 bg-[#F5F2EE] border border-black/[0.06] px-4 py-2.5 font-mono text-xs text-[#555] rounded-xl truncate">
              {referralLink}
            </code>
            <CopyButton text={referralLink} />
          </div>
        </div>
      </div>

      {/* ── Rewards history ─────────────────────────────────────────────── */}
      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-black/[0.05] flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#F2EFE9] rounded-xl flex items-center justify-center shrink-0">
            <Tag size={13} className="text-[#203A2B]" strokeWidth={2} />
          </div>
          <h2 className="font-heading text-[14px] font-semibold text-[#111]">Your Reward Coupons</h2>
          {rewards.length > 0 && (
            <span className="ml-auto text-[10px] font-body font-bold uppercase tracking-wider bg-[#F2EFE9] text-[#203A2B] px-2 py-0.5 rounded-full">
              {rewards.length}
            </span>
          )}
        </div>

        {rewards.length === 0 ? (
          <div className="px-5 py-14 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-[#F5F2EE] rounded-2xl flex items-center justify-center">
              <Gift size={18} className="text-[#C8C3BC]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-body text-[13px] font-semibold text-[#333]">No rewards yet</p>
              <p className="font-body text-[12px] text-[#999] mt-0.5">Share your link to start earning!</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {rewards.map((r) => (
              <div key={r.id} className="px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-body font-semibold text-[#111] truncate">{r.referredEmail}</p>
                  <p className="text-[11px] font-body text-[#B8B3AB] mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <code className="hidden sm:block bg-[#FFFBEB] border border-[#FFC928]/30 text-[#111] font-mono text-xs font-bold px-3 py-1.5 tracking-wider rounded-xl">
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
