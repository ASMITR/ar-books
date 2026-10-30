import { unstable_cache } from "next/cache";
import { adminDb } from "./admin";
import type { Book, Category, Order, DownloadEntitlement, StoreSettings, Offer } from "@/types";

// ─── Cache TTLs (seconds) ─────────────────────────────────────────────────────
// Public catalogue data: revalidate every 60 s — fresh enough for a bookshop,
// avoids a cold Firestore round-trip on every request.
const CATALOGUE_TTL = 60;
// Store settings change rarely; 5-minute cache is fine.
const SETTINGS_TTL = 300;

// ─── Books ───────────────────────────────────────────────────────────────────
export const getPublishedBooks = unstable_cache(
  async (): Promise<Book[]> => {
    const snap = await adminDb
      .collection("books")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
  },
  ["published-books"],
  { revalidate: CATALOGUE_TTL, tags: ["books"] }
);

export const getFeaturedBooks = unstable_cache(
  async (): Promise<Book[]> => {
    const snap = await adminDb
      .collection("books")
      .where("published", "==", true)
      .where("featured", "==", true)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
  },
  ["featured-books"],
  { revalidate: CATALOGUE_TTL, tags: ["books"] }
);

export const getBookBySlug = unstable_cache(
  async (slug: string): Promise<Book | null> => {
    const snap = await adminDb
      .collection("books")
      .where("slug", "==", slug)
      .where("published", "==", true)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Book;
  },
  ["book-by-slug"],
  { revalidate: CATALOGUE_TTL, tags: ["books"] }
);

export async function getBookById(id: string): Promise<Book | null> {
  const doc = await adminDb.collection("books").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Book;
}

export const getAllBooks = unstable_cache(
  async (): Promise<Book[]> => {
    const snap = await adminDb.collection("books").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
  },
  ["all-books"],
  { revalidate: CATALOGUE_TTL, tags: ["books"] }
);

// ─── Categories ──────────────────────────────────────────────────────────────
export const getVisibleCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const snap = await adminDb
      .collection("categories")
      .where("visible", "==", true)
      .orderBy("sortOrder", "asc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  },
  ["visible-categories"],
  { revalidate: CATALOGUE_TTL, tags: ["categories"] }
);

export const getAllCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const snap = await adminDb.collection("categories").orderBy("sortOrder", "asc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  },
  ["all-categories"],
  { revalidate: CATALOGUE_TTL, tags: ["categories"] }
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | null> => {
    const snap = await adminDb
      .collection("categories")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Category;
  },
  ["category-by-slug"],
  { revalidate: CATALOGUE_TTL, tags: ["categories"] }
);

// ─── Orders ──────────────────────────────────────────────────────────────────
export async function getOrderById(id: string): Promise<Order | null> {
  const doc = await adminDb.collection("orders").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Order;
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const snap = await adminDb
    .collection("orders")
    .where("customerId", "==", customerId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

// ─── Download Entitlements ───────────────────────────────────────────────────
export async function getEntitlementsByCustomer(customerId: string): Promise<DownloadEntitlement[]> {
  const snap = await adminDb
    .collection("downloadEntitlements")
    .where("customerId", "==", customerId)
    .where("status", "==", "active")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DownloadEntitlement));
}

export async function getEntitlement(
  customerId: string,
  productId: string
): Promise<DownloadEntitlement | null> {
  const snap = await adminDb
    .collection("downloadEntitlements")
    .where("customerId", "==", customerId)
    .where("productId", "==", productId)
    .where("status", "==", "active")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as DownloadEntitlement;
}

// ─── Articles ────────────────────────────────────────────────────────────────
type Article = import("@/types").Article;

export const getPublishedArticles = unstable_cache(
  async (): Promise<Article[]> => {
    const snap = await adminDb
      .collection("articles")
      .where("published", "==", true)
      .orderBy("publishedAt", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
  },
  ["published-articles"],
  { revalidate: CATALOGUE_TTL, tags: ["articles"] }
);

export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    const snap = await adminDb
      .collection("articles")
      .where("slug", "==", slug)
      .where("published", "==", true)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Article;
  },
  ["article-by-slug"],
  { revalidate: CATALOGUE_TTL, tags: ["articles"] }
);

export async function getAdjacentArticles(
  currentId: string
): Promise<{ prev: Article | null; next: Article | null }> {
  // Reuses the cached getPublishedArticles — no extra Firestore round-trip.
  const all = await getPublishedArticles();
  const idx = all.findIndex((a) => a.id === currentId);
  return {
    prev: idx < all.length - 1 ? all[idx + 1] : null,
    next: idx > 0 ? all[idx - 1] : null,
  };
}

// ─── Store Settings ──────────────────────────────────────────────────────────
export const getStoreSettings = unstable_cache(
  async (): Promise<StoreSettings | null> => {
    const doc = await adminDb.collection("settings").doc("store").get();
    if (!doc.exists) return null;
    return doc.data() as StoreSettings;
  },
  ["store-settings"],
  { revalidate: SETTINGS_TTL, tags: ["settings"] }
);

// ─── Offers ──────────────────────────────────────────────────────────────────
export const getActivePublicOffers = unstable_cache(
  async (): Promise<Offer[]> => {
    const now = new Date().toISOString();
    // Single-field query — no composite index required.
    // We filter showOnHomepage + date range in memory to avoid needing a Firestore index.
    const snap = await adminDb
      .collection("offers")
      .where("status", "==", "active")
      .get();
    const offers = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
    return offers.filter(
      (o) =>
        o.showOnHomepage === true &&
        o.startAt <= now &&
        (!o.endAt || o.endAt > now)
    );
  },
  ["active-public-offers"],
  { revalidate: CATALOGUE_TTL, tags: ["offers"] }
);

export const getAllOffers = unstable_cache(
  async (): Promise<Offer[]> => {
    const snap = await adminDb
      .collection("offers")
      .orderBy("priority", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
  },
  ["all-offers"],
  { revalidate: CATALOGUE_TTL, tags: ["offers"] }
);

export async function getOfferById(id: string): Promise<Offer | null> {
  const doc = await adminDb.collection("offers").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Offer;
}

export async function getOfferByCouponCode(code: string): Promise<Offer | null> {
  const now = new Date().toISOString();
  const snap = await adminDb
    .collection("offers")
    .where("couponCode", "==", code.toUpperCase())
    .get();
  if (snap.empty) return null;
  const active = snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Offer))
    .find(
      (o) =>
        o.status === "active" &&
        o.startAt <= now &&
        (!o.endAt || o.endAt > now)
    );
  return active ?? null;
}

export async function getOfferRedemptionCountByCustomer(
  offerId: string,
  customerId: string
): Promise<number> {
  const snap = await adminDb
    .collection("offerRedemptions")
    .where("offerId", "==", offerId)
    .where("customerId", "==", customerId)
    .get();
  return snap.size;
}
