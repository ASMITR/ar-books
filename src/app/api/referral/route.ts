import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { adminDb } from "@/lib/firebase/admin";
import { getReferralRewardsByReferrer } from "@/lib/firebase/firestore";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userDoc = await adminDb.collection("users").doc(user.uid).get();
  const userData = userDoc.data();

  const rewards = await getReferralRewardsByReferrer(user.uid);

  return NextResponse.json({
    referralCode: userData?.referralCode ?? null,
    referralCount: userData?.referralCount ?? 0,
    rewards: rewards.map((r) => ({
      referredEmail: r.referredEmail,
      couponCode: r.couponCode,
      createdAt: r.createdAt,
    })),
  });
}
