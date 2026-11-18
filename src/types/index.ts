// ─── Series ──────────────────────────────────────────────────────────────────
export interface Series {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  coverImagePath?: string;
  bannerImageUrl?: string;
  bannerImagePath?: string;
  genre?: string;
  plannedBooks?: number;
  authorUid?: string;        // Firebase UID of the creating author (null for owner)
  author?: string;           // display name
  submissionStatus?: SubmissionStatus;
  ownerFeedback?: string;
  sortOrder: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  author: string;             // display name string (kept for backwards compat)
  authorUid?: string;         // Firebase UID of the author (null for owner's own books)
  description: string;
  priceRupees: number;
  originalPriceRupees?: number;
  suggestedPriceRupees?: number;    // author-suggested price (read-only after owner sets final)
  currency: string;
  categoryIds: string[];
  seriesId?: string | null;
  seriesOrder?: number | null;
  coverImageUrl?: string;
  coverImagePath?: string;
  privatePdfPath?: string;
  privatePdfUrl?: string;
  previewPdfPath?: string;
  previewPdfUrl?: string;
  pageCount?: number;
  language: string;
  published: boolean;
  featured: boolean;
  submissionStatus?: SubmissionStatus;  // workflow status
  ownerFeedback?: string;               // last owner comment
  whatYouLearn?: string[];
  targetAudience?: string;
  tableOfContents?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  visible: boolean;
}

// ─── User ────────────────────────────────────────────────────────────────────
export type UserRole = "member" | "admin" | "author";

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  role: UserRole;
  photoURL?: string | null;
  createdAt: string;
  updatedAt: string;
  referralCode?: string;
  referredBy?: string | null;  // referral code of the person who referred them
  referralCount?: number;      // how many people signed up using this user's code
}

// ─── Referral Reward ─────────────────────────────────────────────────────────
export interface ReferralReward {
  id: string;
  referrerId: string;       // uid of the person who referred
  referredUserId: string;   // uid of the new user
  referredEmail: string;
  couponId: string;         // coupon created as reward
  couponCode: string;
  createdAt: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  priceRupees: number;
  slug: string;
  quantity: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FulfillmentStatus = "pending" | "fulfilled" | "refunded";

export interface OrderItem {
  bookId: string;
  title: string;
  priceRupees: number;
  coverImageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  phone?: string | null;
  items: OrderItem[];
  subtotalRupees: number;
  discountRupees: number;
  taxRupees: number;
  totalRupees: number;
  currency: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt?: string;
  paidAt?: string;
  // Discount snapshot — immutable after order creation
  appliedDiscount?: AppliedDiscount | null;
}

// ─── Download Entitlement ────────────────────────────────────────────────────
export interface DownloadEntitlement {
  id: string;
  orderId: string;
  customerId: string;
  productId: string;
  status: "active" | "revoked";
  createdAt: string;
}

// ─── Download Log ────────────────────────────────────────────────────────────
export interface DownloadLog {
  id: string;
  orderId: string;
  productId: string;
  customerId: string;
  timestamp: string;
  outcome: "success" | "denied";
}

// ─── Coupon ──────────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  expiresAt?: string;
  usageLimit?: number;
  usageCount: number;
  enabled: boolean;
}

// ─── Offer ───────────────────────────────────────────────────────────────────
export type OfferType =
  | "percent"
  | "flat"
  | "buy_x_get_y"
  | "bundle"
  | "first_order"
  | "combo"
  | "category"
  | "product_specific";

export type OfferStatus = "draft" | "scheduled" | "active" | "paused" | "expired";

export type OfferEligibility = "all" | "new_customers" | "existing_customers";

export interface Offer {
  id: string;
  // Basic details
  internalName: string;
  title: string;
  description: string;
  bannerImageUrl?: string;
  offerType: OfferType;
  couponCode?: string;
  startAt: string;        // ISO datetime
  endAt?: string;         // ISO datetime, null = no expiry
  status: OfferStatus;
  priority: number;       // higher = shown first

  // Discount config
  discountType: "percent" | "flat";
  discountValue: number;  // percent: 0-100, flat: rupees
  maxDiscountRupees?: number; // cap for percent discounts
  buyX?: number;          // for buy_x_get_y / bundle
  getY?: number;

  // Eligibility
  minCartValueRupees?: number;
  minItemCount?: number;
  applicableBookIds?: string[];   // empty = all books
  applicableCategoryIds?: string[];
  customerEligibility: OfferEligibility;
  usageLimitTotal?: number;
  usageLimitPerCustomer?: number;
  usageCount: number;
  stackable: boolean;     // can it combine with another offer?

  // Display settings
  showOnHomepage: boolean;
  showOnProductPages: boolean;
  showInCart: boolean;
  showOnCheckout: boolean;
  showInAnnouncementBar: boolean;
  displayCouponPublicly: boolean;
  ctaText?: string;
  badgeLabel?: string;

  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// ─── Applied Offer / Discount Snapshot ───────────────────────────────────────
export interface AppliedDiscount {
  offerId?: string;
  couponCode?: string;
  discountType: "percent" | "flat";
  discountValue: number;
  discountRupees: number;
  title: string;
  offerType: OfferType | "coupon";
}

// ─── Offer Analytics ─────────────────────────────────────────────────────────
export interface OfferRedemption {
  id: string;
  offerId: string;
  couponCode?: string;
  customerId: string;
  customerEmail: string;
  orderId: string;
  discountRupees: number;
  redeemedAt: string;
}

// ─── Article ─────────────────────────────────────────────────────────────────
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  published: boolean;
  publishedAt?: string;
}

// ─── Store Settings ──────────────────────────────────────────────────────────
export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  taxPercent: number;
  authorBio?: string;
  authorPhotoUrl?: string;
  featuredBookId?: string;
  homepageSettings?: {
    heroHeadline?: string;
    heroSubtext?: string;
  };
}

// ─── Author Invitation ───────────────────────────────────────────────────────
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface AuthorInvitation {
  id: string;
  email: string;
  name: string;
  institution?: string;
  token: string;             // secure random token stored hashed in DB
  tokenHash: string;         // SHA-256 hash of the raw token
  status: InvitationStatus;
  expiresAt: string;         // ISO — 7-day window
  invitedBy: string;         // admin UID
  acceptedAt?: string;
  acceptedByUid?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Author Profile ──────────────────────────────────────────────────────────
export type AuthorAccountStatus = "active" | "suspended" | "deactivated";

export interface AuthorProfile {
  id: string;               // same as Firebase UID
  uid: string;
  displayName: string;
  email: string;
  bio?: string;
  photoURL?: string;
  institution?: string;
  website?: string;
  socialLinks?: { platform: string; url: string }[];
  accountStatus: AuthorAccountStatus;
  invitationId: string;     // reference to the invitation that created this account
  invitedBy: string;        // admin UID
  createdAt: string;
  updatedAt: string;
}

// ─── Book / Series Submission Status ─────────────────────────────────────────
export type SubmissionStatus =
  | "draft"
  | "pending_approval"
  | "changes_requested"
  | "rejected"
  | "approved"
  | "published"
  | "unpublished";

// ─── Approval Record ─────────────────────────────────────────────────────────
export type ApprovalAction =
  | "submitted"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "published"
  | "unpublished"
  | "edited_by_owner"
  | "price_set";

export interface ApprovalRecord {
  id: string;
  resourceType: "book" | "series";
  resourceId: string;
  action: ApprovalAction;
  actorUid: string;
  actorRole: UserRole;
  comment?: string;           // owner feedback / rejection reason
  priceRupees?: number;       // when action is "price_set"
  originalPriceRupees?: number;
  snapshotTitle?: string;     // snapshot of title at time of action
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType =
  | "book_submitted"
  | "series_submitted"
  | "book_approved"
  | "book_rejected"
  | "book_changes_requested"
  | "book_published"
  | "book_unpublished"
  | "series_approved"
  | "series_rejected"
  | "series_changes_requested"
  | "series_published"
  | "author_invited"
  | "author_registered"
  | "author_suspended"
  | "price_updated";

export interface Notification {
  id: string;
  recipientUid: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType?: "book" | "series";
  resourceId?: string;
  resourceTitle?: string;
  read: boolean;
  createdAt: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceTitle?: string;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

// ─── API Response ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
