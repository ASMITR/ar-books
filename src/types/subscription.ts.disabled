// ─── Membership Plan (stored in Firestore, admin-configurable) ───────────────
export interface MembershipPlan {
  id: string;
  name: string;                    // "Starter" | "Plus" | "Premium"
  slug: string;                    // "starter" | "plus" | "premium"
  description: string;
  pricePaise: number;              // monthly price in paise (19900, 39900, 59900)
  priceRupees: number;             // for display
  currency: string;                // "INR"
  billingPeriod: "monthly";
  // Razorpay plan reference
  razorpayPlanId?: string;         // rzp plan id after creation
  // Feature flags
  canDownload: boolean;            // can members download PDFs
  canReadOnline: boolean;          // online reader access
  downloadLimit?: number;          // monthly download cap (undefined = unlimited)
  // Access tiers
  includesStarter: boolean;        // has access to starter-tier books
  includesPlus: boolean;           // has access to plus-tier books
  includesPremium: boolean;        // has access to premium-tier books
  includesExclusive: boolean;      // exclusive collections
  includesLatestReleases: boolean; // new release early access
  // Display
  badgeLabel: string;              // "Starter Member" | "Plus Member" | "Premium Member"
  badgeColor: string;              // Tailwind color class
  highlighted: boolean;            // show "Most Popular" badge
  sortOrder: number;
  // Benefits list (admin-configurable)
  benefits: string[];
  // Status
  active: boolean;                 // accepting new subscribers
  createdAt: string;
  updatedAt: string;
}

// ─── Subscription Status ──────────────────────────────────────────────────────
export type SubscriptionStatus =
  | "pending"               // created, awaiting payment auth
  | "created"               // Razorpay subscription created
  | "authenticated"         // mandate authorised
  | "active"                // paying and within period
  | "payment_failed"        // last charge failed
  | "past_due"              // past renewal date, grace period
  | "cancelled"             // cancelled, access may continue to period end
  | "expired"               // period ended, access revoked
  | "suspended"             // admin-suspended
  | "completed"             // all billing cycles done (fixed-term)
  | "halted";               // Razorpay halted (too many failures)

// ─── Membership Subscription ──────────────────────────────────────────────────
export interface MembershipSubscription {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  planId: string;
  planName: string;
  planSlug: string;
  pricePaise: number;              // price at time of subscription (immutable)
  currency: string;
  status: SubscriptionStatus;
  // Razorpay
  razorpaySubscriptionId?: string;
  razorpayPlanId?: string;
  razorpayPaymentId?: string;      // last successful payment
  // Billing period
  startDate: string;               // ISO — when subscription started
  currentPeriodStart: string;      // ISO
  currentPeriodEnd: string;        // ISO
  nextBillingDate?: string;        // ISO
  // Cancellation
  cancelledAt?: string;
  cancellationReason?: string;
  cancelAtPeriodEnd: boolean;      // cancel at end of paid period
  // Coupon applied at signup
  couponCode?: string;
  discountPaise?: number;
  // Grace period (days after period end before access revoked)
  gracePeriodDays: number;
  // Admin notes
  adminNotes?: string;
  // Audit
  createdAt: string;
  updatedAt: string;
}

// ─── Subscription Payment Record ─────────────────────────────────────────────
export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  customerId: string;
  planId: string;
  planName: string;
  amountPaise: number;
  currency: string;
  status: "pending" | "captured" | "failed" | "refunded";
  razorpayPaymentId?: string;
  razorpaySubscriptionId?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  failureReason?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Subscription Webhook Event ───────────────────────────────────────────────
export interface SubscriptionWebhookEvent {
  id: string;
  razorpayEventId: string;         // for idempotency
  eventType: string;               // e.g. "subscription.activated"
  subscriptionId?: string;         // our internal ID
  razorpaySubscriptionId?: string;
  payload: Record<string, unknown>;
  processingStatus: "processed" | "failed" | "skipped";
  processedAt?: string;
  receivedAt: string;
}

// ─── Membership Book Access Config ───────────────────────────────────────────
export interface MembershipBookAccess {
  id: string;
  bookId: string;
  // Tier access
  starterAccess: boolean;
  plusAccess: boolean;
  premiumAccess: boolean;
  // Feature access
  allowOnlineRead: boolean;
  allowDownload: boolean;
  isLatestRelease: boolean;
  isExclusive: boolean;
  // Availability window
  accessStartDate?: string;        // ISO — when it becomes available to members
  accessEndDate?: string;          // ISO — when it's removed (null = forever)
  createdAt: string;
  updatedAt: string;
}

// ─── Membership Download Record ───────────────────────────────────────────────
export interface MembershipDownload {
  id: string;
  subscriptionId: string;
  customerId: string;
  bookId: string;
  bookTitle: string;
  downloadedAt: string;
  periodStart: string;             // billing period during which download occurred
  periodEnd: string;
}

// ─── Membership Coupon ────────────────────────────────────────────────────────
export interface MembershipCoupon {
  id: string;
  code: string;
  description: string;
  discountType: "percent" | "flat";
  discountValue: number;           // percent: 0-100, flat: rupees
  applicablePlans: string[];       // plan slugs, empty = all
  maxRedemptions?: number;
  perCustomerLimit: number;
  usageCount: number;
  firstTimeOnly: boolean;
  startDate: string;
  expiryDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Membership Coupon Redemption ─────────────────────────────────────────────
export interface MembershipCouponRedemption {
  id: string;
  couponId: string;
  couponCode: string;
  customerId: string;
  subscriptionId: string;
  discountPaise: number;
  redeemedAt: string;
}

// ─── Subscription Notification ───────────────────────────────────────────────
export interface SubscriptionNotification {
  id: string;
  subscriptionId: string;
  customerId: string;
  type: "activated" | "renewed" | "payment_failed" | "cancelled" | "expiring_soon" | "expired" | "upgraded" | "downgraded";
  sentAt: string;
  emailStatus: "sent" | "failed" | "skipped";
}

// ─── Membership Audit Log ─────────────────────────────────────────────────────
export interface MembershipAuditLog {
  id: string;
  subscriptionId: string;
  customerId: string;
  action: string;
  performedBy: string;             // customerId or "system" or adminUid
  previousState?: Partial<MembershipSubscription>;
  newState?: Partial<MembershipSubscription>;
  notes?: string;
  timestamp: string;
}

// ─── Active membership summary (for UI) ──────────────────────────────────────
export interface ActiveMembership {
  subscription: MembershipSubscription;
  plan: MembershipPlan;
  isActive: boolean;
  daysRemaining: number;
  canDownload: boolean;
  canReadOnline: boolean;
}
