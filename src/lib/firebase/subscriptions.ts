import { adminDb } from "./admin";
import type {
  MembershipPlan,
  MembershipSubscription,
  SubscriptionPayment,
  MembershipBookAccess,
  ActiveMembership,
  SubscriptionStatus,
} from "@/types/subscription";
import { unstable_cache } from "next/cache";

// ─── Cache TTLs ───────────────────────────────────────────────────────────────
const PLAN_TTL = 300; // 5 min — plans change rarely

// ─── Plans ────────────────────────────────────────────────────────────────────

export const getActiveMembershipPlans = unstable_cache(
  async (): Promise<MembershipPlan[]> => {
    const snap = await adminDb
      .collection("membershipPlans")
      .where("active", "==", true)
      .orderBy("sortOrder", "asc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MembershipPlan));
  },
  ["active-membership-plans"],
  { revalidate: PLAN_TTL, tags: ["membershipPlans"] }
);

export const getAllMembershipPlans = unstable_cache(
  async (): Promise<MembershipPlan[]> => {
    const snap = await adminDb
      .collection("membershipPlans")
      .orderBy("sortOrder", "asc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MembershipPlan));
  },
  ["all-membership-plans"],
  { revalidate: PLAN_TTL, tags: ["membershipPlans"] }
);

export async function getMembershipPlanById(id: string): Promise<MembershipPlan | null> {
  const doc = await adminDb.collection("membershipPlans").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as MembershipPlan;
}

export async function getMembershipPlanBySlug(slug: string): Promise<MembershipPlan | null> {
  const snap = await adminDb
    .collection("membershipPlans")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as MembershipPlan;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscriptionById(id: string): Promise<MembershipSubscription | null> {
  const doc = await adminDb.collection("membershipSubscriptions").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as MembershipSubscription;
}

export async function getSubscriptionByRazorpayId(
  razorpaySubscriptionId: string
): Promise<MembershipSubscription | null> {
  const snap = await adminDb
    .collection("membershipSubscriptions")
    .where("razorpaySubscriptionId", "==", razorpaySubscriptionId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as MembershipSubscription;
}

export async function getActiveSubscriptionForCustomer(
  customerId: string
): Promise<MembershipSubscription | null> {
  const now = new Date().toISOString();
  const snap = await adminDb
    .collection("membershipSubscriptions")
    .where("customerId", "==", customerId)
    .where("status", "in", ["active", "authenticated", "past_due"])
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snap.empty) return null;

  const sub = { id: snap.docs[0].id, ...snap.docs[0].data() } as MembershipSubscription;

  // Check if period has ended (expired but status not yet updated)
  const graceEnd = new Date(sub.currentPeriodEnd);
  graceEnd.setDate(graceEnd.getDate() + (sub.gracePeriodDays ?? 0));
  if (graceEnd.toISOString() < now) return null;

  return sub;
}

export async function getAllSubscriptionsForCustomer(
  customerId: string
): Promise<MembershipSubscription[]> {
  const snap = await adminDb
    .collection("membershipSubscriptions")
    .where("customerId", "==", customerId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MembershipSubscription));
}

// ─── Compute ActiveMembership from subscription + plan ───────────────────────
export async function getActiveMembershipForCustomer(
  customerId: string
): Promise<ActiveMembership | null> {
  const sub = await getActiveSubscriptionForCustomer(customerId);
  if (!sub) return null;

  const plan = await getMembershipPlanById(sub.planId);
  if (!plan) return null;

  const now = Date.now();
  const periodEnd = new Date(sub.currentPeriodEnd).getTime();
  const graceMsEnd = periodEnd + (sub.gracePeriodDays ?? 0) * 86400000;

  const isActive = now < graceMsEnd && (
    sub.status === "active" ||
    sub.status === "authenticated" ||
    sub.status === "past_due"
  );
  const daysRemaining = Math.max(0, Math.ceil((periodEnd - now) / 86400000));

  return {
    subscription: sub,
    plan,
    isActive,
    daysRemaining,
    canDownload: isActive && plan.canDownload,
    canReadOnline: isActive && plan.canReadOnline,
  };
}

// ─── Book access ──────────────────────────────────────────────────────────────

export async function getBookMembershipAccess(bookId: string): Promise<MembershipBookAccess | null> {
  const snap = await adminDb
    .collection("membershipBookAccess")
    .where("bookId", "==", bookId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as MembershipBookAccess;
}

export async function getBooksAccessibleByPlan(planSlug: string): Promise<MembershipBookAccess[]> {
  const now = new Date().toISOString();
  const field =
    planSlug === "starter" ? "starterAccess" :
    planSlug === "plus"    ? "plusAccess"    :
                             "premiumAccess";

  const snap = await adminDb
    .collection("membershipBookAccess")
    .where(field, "==", true)
    .get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as MembershipBookAccess))
    .filter((a) => {
      if (a.accessStartDate && a.accessStartDate > now) return false;
      if (a.accessEndDate && a.accessEndDate < now) return false;
      return true;
    });
}

/**
 * Check if a customer's active membership grants access to a specific book.
 * Returns { allowed, reason } — server-authoritative, never trust client claims.
 */
export async function checkMembershipBookAccess(
  customerId: string,
  bookId: string
): Promise<{ allowed: boolean; canDownload: boolean; reason: string }> {
  const membership = await getActiveMembershipForCustomer(customerId);
  if (!membership || !membership.isActive) {
    return { allowed: false, canDownload: false, reason: "No active membership" };
  }

  const access = await getBookMembershipAccess(bookId);
  if (!access) {
    return { allowed: false, canDownload: false, reason: "Book not in membership catalogue" };
  }

  const now = new Date().toISOString();
  if (access.accessStartDate && access.accessStartDate > now) {
    return { allowed: false, canDownload: false, reason: "Book not yet available" };
  }
  if (access.accessEndDate && access.accessEndDate < now) {
    return { allowed: false, canDownload: false, reason: "Book access period ended" };
  }

  const plan = membership.plan;
  let hasAccess = false;
  if (access.starterAccess && plan.includesStarter) hasAccess = true;
  if (access.plusAccess    && plan.includesPlus)    hasAccess = true;
  if (access.premiumAccess && plan.includesPremium) hasAccess = true;

  if (!hasAccess) {
    return { allowed: false, canDownload: false, reason: "Book requires a higher membership tier" };
  }

  const canDownload = access.allowDownload && membership.canDownload;
  return { allowed: true, canDownload, reason: "Access granted" };
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function getSubscriptionPayments(
  subscriptionId: string
): Promise<SubscriptionPayment[]> {
  const snap = await adminDb
    .collection("subscriptionPayments")
    .where("subscriptionId", "==", subscriptionId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubscriptionPayment));
}

export async function getCustomerSubscriptionPayments(
  customerId: string
): Promise<SubscriptionPayment[]> {
  const snap = await adminDb
    .collection("subscriptionPayments")
    .where("customerId", "==", customerId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubscriptionPayment));
}

// ─── Admin: all subscriptions ─────────────────────────────────────────────────

export async function getAllSubscriptions(opts?: {
  status?: SubscriptionStatus;
  limit?: number;
}): Promise<MembershipSubscription[]> {
  let q = adminDb
    .collection("membershipSubscriptions")
    .orderBy("createdAt", "desc") as FirebaseFirestore.Query;

  if (opts?.status) q = q.where("status", "==", opts.status);
  if (opts?.limit)  q = q.limit(opts.limit);

  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MembershipSubscription));
}

// ─── Audit log helper ─────────────────────────────────────────────────────────

export async function logSubscriptionAudit(entry: {
  subscriptionId: string;
  customerId: string;
  action: string;
  performedBy: string;
  previousState?: Partial<MembershipSubscription>;
  newState?: Partial<MembershipSubscription>;
  notes?: string;
}): Promise<void> {
  await adminDb.collection("membershipAuditLogs").add({
    ...entry,
    timestamp: new Date().toISOString(),
  });
}
