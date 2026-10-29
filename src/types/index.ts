// ─── Book ────────────────────────────────────────────────────────────────────
export interface Book {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  author: string;
  description: string;
  pricePaise: number;
  originalPricePaise?: number;
  currency: string;
  categoryIds: string[];
  coverImageUrl?: string;
  coverImagePath?: string;
  privatePdfPath?: string;
  previewPdfPath?: string;
  pageCount?: number;
  language: string;
  published: boolean;
  featured: boolean;
  whatYouLearn?: string[];
  targetAudience?: string;
  tableOfContents?: string[];
  seoTitle?: string;
  seoDescription?: string;
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
export type UserRole = "member" | "admin";

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  role: UserRole;
  photoURL?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  pricePaise: number;
  slug: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FulfillmentStatus = "pending" | "fulfilled" | "refunded";

export interface OrderItem {
  bookId: string;
  title: string;
  pricePaise: number;
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
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
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
  maxDiscountPaise?: number; // cap for percent discounts
  buyX?: number;          // for buy_x_get_y / bundle
  getY?: number;

  // Eligibility
  minCartValuePaise?: number;
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
  discountPaise: number;
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
  discountPaise: number;
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

// ─── API Response ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
