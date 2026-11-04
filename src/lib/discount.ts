/**
 * Server-side discount calculation utilities.
 * All amounts are in rupees. Never mutate order totals client-side.
 */

import type { Offer, Coupon, AppliedDiscount } from "@/types";

// ─── Coupon validation ────────────────────────────────────────────────────────

export type CouponValidationResult =
  | { valid: true; discountRupees: number; coupon: Coupon }
  | { valid: false; error: string };

export function validateCoupon(
  coupon: Coupon,
  subtotalRupees: number
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

  const discountRupees = calcCouponDiscount(coupon, subtotalRupees);
  return { valid: true, discountRupees, coupon };
}

export function calcCouponDiscount(coupon: Coupon, subtotalRupees: number): number {
  let discount: number;
  if (coupon.discountType === "percent") {
    discount = Math.floor((subtotalRupees * coupon.discountValue) / 100);
  } else {
    discount = coupon.discountValue;
  }
  return Math.min(discount, subtotalRupees);
}

// ─── Offer validation ─────────────────────────────────────────────────────────

export type OfferValidationResult =
  | { valid: true; discountRupees: number; offer: Offer }
  | { valid: false; error: string };

export function validateOffer(
  offer: Offer,
  opts: {
    subtotalRupees: number;
    bookIds: string[];
    categoryIds: string[];
    isFirstOrder: boolean;
    customerId: string;
    perCustomerUsage: number;
    couponCode?: string;
  }
): OfferValidationResult {
  const now = new Date();

  if (offer.status !== "active") {
    return { valid: false, error: "This offer is not currently active." };
  }

  if (new Date(offer.startAt) > now) {
    return { valid: false, error: "This offer has not started yet." };
  }
  if (offer.endAt && new Date(offer.endAt) < now) {
    return { valid: false, error: "This offer has expired." };
  }

  if (offer.couponCode) {
    if (!opts.couponCode || opts.couponCode.toUpperCase() !== offer.couponCode.toUpperCase()) {
      return { valid: false, error: "Coupon code does not match this offer." };
    }
  }

  if (offer.usageLimitTotal != null && offer.usageCount >= offer.usageLimitTotal) {
    return { valid: false, error: "This offer has reached its usage limit." };
  }

  if (offer.usageLimitPerCustomer != null && opts.perCustomerUsage >= offer.usageLimitPerCustomer) {
    return { valid: false, error: "You have already used this offer the maximum number of times." };
  }

  if (offer.customerEligibility === "new_customers" && !opts.isFirstOrder) {
    return { valid: false, error: "This offer is only available to first-time customers." };
  }
  if (offer.customerEligibility === "existing_customers" && opts.isFirstOrder) {
    return { valid: false, error: "This offer is only available to existing customers." };
  }

  if (offer.minCartValueRupees != null && opts.subtotalRupees < offer.minCartValueRupees) {
    return {
      valid: false,
      error: `Minimum order value of ₹${offer.minCartValueRupees} required.`,
    };
  }

  const hasBookRestriction = offer.applicableBookIds && offer.applicableBookIds.length > 0;
  const hasCatRestriction  = offer.applicableCategoryIds && offer.applicableCategoryIds.length > 0;

  if (hasBookRestriction) {
    const eligible = opts.bookIds.some((id) => offer.applicableBookIds!.includes(id));
    if (!eligible) {
      return { valid: false, error: "This offer does not apply to the selected books." };
    }
  }

  if (hasCatRestriction && !hasBookRestriction) {
    const eligible = opts.categoryIds.some((cid) => offer.applicableCategoryIds!.includes(cid));
    if (!eligible) {
      return { valid: false, error: "This offer does not apply to books in your selected categories." };
    }
  }

  if (offer.minItemCount != null && opts.bookIds.length < offer.minItemCount) {
    return {
      valid: false,
      error: `Add at least ${offer.minItemCount} eligible books to use this offer.`,
    };
  }

  const discountRupees = calcOfferDiscount(offer, opts.subtotalRupees);
  return { valid: true, discountRupees, offer };
}

export function calcOfferDiscount(offer: Offer, subtotalRupees: number): number {
  let discount: number;

  if (offer.discountType === "percent") {
    discount = Math.floor((subtotalRupees * offer.discountValue) / 100);
    if (offer.maxDiscountRupees != null) {
      discount = Math.min(discount, offer.maxDiscountRupees);
    }
  } else {
    discount = offer.discountValue;
  }

  return Math.min(discount, subtotalRupees);
}

// ─── Build AppliedDiscount snapshot ──────────────────────────────────────────

export function buildCouponSnapshot(coupon: Coupon, discountRupees: number): AppliedDiscount {
  return {
    couponCode: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountRupees,
    title: `Coupon: ${coupon.code}`,
    offerType: "coupon",
  };
}

export function buildOfferSnapshot(offer: Offer, discountRupees: number): AppliedDiscount {
  return {
    offerId: offer.id,
    couponCode: offer.couponCode,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    discountRupees,
    title: offer.title,
    offerType: offer.offerType,
  };
}
