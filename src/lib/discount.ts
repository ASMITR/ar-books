/**
 * Server-side discount calculation utilities.
 * All amounts are in paise (integer). Never mutate order totals client-side.
 */

import type { Offer, Coupon, AppliedDiscount } from "@/types";

// ─── Coupon validation ────────────────────────────────────────────────────────

export type CouponValidationResult =
  | { valid: true; discountPaise: number; coupon: Coupon }
  | { valid: false; error: string };

export function validateCoupon(
  coupon: Coupon,
  subtotalPaise: number
): CouponValidationResult {
  if (!coupon.enabled) {
    return { valid: false, error: "This coupon is no longer active." };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: "This coupon has expired." };
  }

  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }

  const discountPaise = calcCouponDiscount(coupon, subtotalPaise);
  return { valid: true, discountPaise, coupon };
}

export function calcCouponDiscount(coupon: Coupon, subtotalPaise: number): number {
  let discount: number;
  if (coupon.discountType === "percent") {
    discount = Math.floor((subtotalPaise * coupon.discountValue) / 100);
  } else {
    // discountValue is stored as rupees in the existing schema
    discount = coupon.discountValue * 100;
  }
  return Math.min(discount, subtotalPaise);
}

// ─── Offer validation ─────────────────────────────────────────────────────────

export type OfferValidationResult =
  | { valid: true; discountPaise: number; offer: Offer }
  | { valid: false; error: string };

export function validateOffer(
  offer: Offer,
  opts: {
    subtotalPaise: number;
    bookIds: string[];
    categoryIds: string[];
    isFirstOrder: boolean;
    customerId: string;
    perCustomerUsage: number;
    couponCode?: string;
  }
): OfferValidationResult {
  const now = new Date();

  // Status check
  if (offer.status !== "active") {
    return { valid: false, error: "This offer is not currently active." };
  }

  // Date range
  if (new Date(offer.startAt) > now) {
    return { valid: false, error: "This offer has not started yet." };
  }
  if (offer.endAt && new Date(offer.endAt) < now) {
    return { valid: false, error: "This offer has expired." };
  }

  // Coupon code match (if offer requires one)
  if (offer.couponCode) {
    if (!opts.couponCode || opts.couponCode.toUpperCase() !== offer.couponCode.toUpperCase()) {
      return { valid: false, error: "Coupon code does not match this offer." };
    }
  }

  // Global usage limit
  if (offer.usageLimitTotal != null && offer.usageCount >= offer.usageLimitTotal) {
    return { valid: false, error: "This offer has reached its usage limit." };
  }

  // Per-customer usage limit
  if (offer.usageLimitPerCustomer != null && opts.perCustomerUsage >= offer.usageLimitPerCustomer) {
    return { valid: false, error: "You have already used this offer the maximum number of times." };
  }

  // Customer eligibility
  if (offer.customerEligibility === "new_customers" && !opts.isFirstOrder) {
    return {
      valid: false,
      error: "This offer is only available to first-time customers.",
    };
  }
  if (offer.customerEligibility === "existing_customers" && opts.isFirstOrder) {
    return {
      valid: false,
      error: "This offer is only available to existing customers.",
    };
  }

  // Minimum cart value
  if (offer.minCartValuePaise != null && opts.subtotalPaise < offer.minCartValuePaise) {
    return {
      valid: false,
      error: `Minimum order value of ₹${Math.ceil(offer.minCartValuePaise / 100)} required.`,
    };
  }

  // Applicable books / categories
  const hasBookRestriction =
    offer.applicableBookIds && offer.applicableBookIds.length > 0;
  const hasCatRestriction =
    offer.applicableCategoryIds && offer.applicableCategoryIds.length > 0;

  if (hasBookRestriction) {
    const eligible = opts.bookIds.some((id) =>
      offer.applicableBookIds!.includes(id)
    );
    if (!eligible) {
      return {
        valid: false,
        error: "This offer does not apply to the selected books.",
      };
    }
  }

  if (hasCatRestriction && !hasBookRestriction) {
    const eligible = opts.categoryIds.some((cid) =>
      offer.applicableCategoryIds!.includes(cid)
    );
    if (!eligible) {
      return {
        valid: false,
        error: "This offer does not apply to books in your selected categories.",
      };
    }
  }

  // Minimum item count
  if (offer.minItemCount != null && opts.bookIds.length < offer.minItemCount) {
    return {
      valid: false,
      error: `Add at least ${offer.minItemCount} eligible books to use this offer.`,
    };
  }

  const discountPaise = calcOfferDiscount(offer, opts.subtotalPaise);
  return { valid: true, discountPaise, offer };
}

export function calcOfferDiscount(offer: Offer, subtotalPaise: number): number {
  let discount: number;

  if (offer.discountType === "percent") {
    discount = Math.floor((subtotalPaise * offer.discountValue) / 100);
    if (offer.maxDiscountPaise != null) {
      discount = Math.min(discount, offer.maxDiscountPaise);
    }
  } else {
    // flat: discountValue is in rupees
    discount = offer.discountValue * 100;
  }

  return Math.min(discount, subtotalPaise);
}

// ─── Build AppliedDiscount snapshot ──────────────────────────────────────────

export function buildCouponSnapshot(coupon: Coupon, discountPaise: number): AppliedDiscount {
  return {
    couponCode: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountPaise,
    title: `Coupon: ${coupon.code}`,
    offerType: "coupon",
  };
}

export function buildOfferSnapshot(offer: Offer, discountPaise: number): AppliedDiscount {
  return {
    offerId: offer.id,
    couponCode: offer.couponCode,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    discountPaise,
    title: offer.title,
    offerType: offer.offerType,
  };
}
