import { adminDb } from "./admin";
import type { Book, Category, Order, DownloadEntitlement, StoreSettings } from "@/types";

const DEV_BYPASS = process.env.DEV_BYPASS === "true";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_BOOKS: Book[] = [
  {
    id: "book-1",
    title: "The Art of Thinking Clearly",
    slug: "the-art-of-thinking-clearly",
    subtitle: "A guide to better decisions",
    author: "Asmit Rajaramkar",
    description: "A comprehensive guide to recognizing and overcoming cognitive biases.",
    pricePaise: 49900,
    originalPricePaise: 79900,
    currency: "INR",
    categoryIds: ["cat-1"],
    coverImageUrl: undefined,
    pageCount: 280,
    language: "English",
    published: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "book-2",
    title: "Build Wealth Early",
    slug: "build-wealth-early",
    subtitle: "Personal finance for your 20s",
    author: "Asmit Rajaramkar",
    description: "Practical personal finance strategies for young professionals.",
    pricePaise: 39900,
    currency: "INR",
    categoryIds: ["cat-2"],
    coverImageUrl: undefined,
    pageCount: 210,
    language: "English",
    published: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Self Development", slug: "self-development", sortOrder: 1, visible: true },
  { id: "cat-2", name: "Finance", slug: "finance", sortOrder: 2, visible: true },
  { id: "cat-3", name: "Technology", slug: "technology", sortOrder: 3, visible: true },
];

const MOCK_SETTINGS: StoreSettings = {
  storeName: "AR Books",
  supportEmail: "support@arbooks.dev",
  currency: "INR",
  taxPercent: 0,
  authorBio: "I write books that help people think clearly, build skills, and explore new ideas.",
  homepageSettings: {
    heroHeadline: "WHAT WILL YOU DISCOVER NEXT?",
    heroSubtext: "Explore new ideas, build useful skills, and discover fresh perspectives.",
  },
};

const MOCK_ORDERS: Order[] = [
  {
    id: "order-1",
    orderNumber: "ORD-0001",
    customerId: "dev-bypass-uid",
    customerEmail: "dev@bypass.local",
    customerName: "Dev User",
    items: [{ bookId: "book-1", title: "The Art of Thinking Clearly", pricePaise: 49900 }],
    subtotalPaise: 49900,
    discountPaise: 0,
    taxPaise: 0,
    totalPaise: 49900,
    currency: "INR",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
  },
];

const MOCK_ENTITLEMENTS: DownloadEntitlement[] = [
  {
    id: "ent-1",
    orderId: "order-1",
    customerId: "dev-bypass-uid",
    productId: "book-1",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

// ─── Books ───────────────────────────────────────────────────────────────────
export async function getPublishedBooks(): Promise<Book[]> {
  if (DEV_BYPASS) return MOCK_BOOKS;
  const snap = await adminDb
    .collection("books")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
}

export async function getFeaturedBooks(): Promise<Book[]> {
  if (DEV_BYPASS) return MOCK_BOOKS.filter((b) => b.featured);
  const snap = await adminDb
    .collection("books")
    .where("published", "==", true)
    .where("featured", "==", true)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  if (DEV_BYPASS) return MOCK_BOOKS.find((b) => b.slug === slug) ?? null;
  const snap = await adminDb
    .collection("books")
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Book;
}

export async function getBookById(id: string): Promise<Book | null> {
  if (DEV_BYPASS) return MOCK_BOOKS.find((b) => b.id === id) ?? null;
  const doc = await adminDb.collection("books").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Book;
}

export async function getAllBooks(): Promise<Book[]> {
  if (DEV_BYPASS) return MOCK_BOOKS;
  const snap = await adminDb.collection("books").orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
}

// ─── Categories ──────────────────────────────────────────────────────────────
export async function getVisibleCategories(): Promise<Category[]> {
  if (DEV_BYPASS) return MOCK_CATEGORIES.filter((c) => c.visible);
  const snap = await adminDb
    .collection("categories")
    .where("visible", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function getAllCategories(): Promise<Category[]> {
  if (DEV_BYPASS) return MOCK_CATEGORIES;
  const snap = await adminDb.collection("categories").orderBy("sortOrder", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (DEV_BYPASS) return MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;
  const snap = await adminDb
    .collection("categories")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Category;
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export async function getOrderById(id: string): Promise<Order | null> {
  if (DEV_BYPASS) return MOCK_ORDERS.find((o) => o.id === id) ?? null;
  const doc = await adminDb.collection("orders").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Order;
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  if (DEV_BYPASS) return MOCK_ORDERS.filter((o) => o.customerId === customerId);
  const snap = await adminDb
    .collection("orders")
    .where("customerId", "==", customerId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

// ─── Download Entitlements ───────────────────────────────────────────────────
export async function getEntitlementsByCustomer(customerId: string): Promise<DownloadEntitlement[]> {
  if (DEV_BYPASS) return MOCK_ENTITLEMENTS.filter((e) => e.customerId === customerId);
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
  if (DEV_BYPASS)
    return MOCK_ENTITLEMENTS.find((e) => e.customerId === customerId && e.productId === productId) ?? null;
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
const MOCK_ARTICLES: Article[] = [];

export async function getPublishedArticles(): Promise<Article[]> {
  if (DEV_BYPASS) return MOCK_ARTICLES;
  const snap = await adminDb
    .collection("articles")
    .where("published", "==", true)
    .orderBy("publishedAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (DEV_BYPASS) return MOCK_ARTICLES.find((a) => a.slug === slug) ?? null;
  const snap = await adminDb
    .collection("articles")
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Article;
}

export async function getAdjacentArticles(
  currentId: string
): Promise<{ prev: Article | null; next: Article | null }> {
  const all = await getPublishedArticles();
  const idx = all.findIndex((a) => a.id === currentId);
  return {
    prev: idx < all.length - 1 ? all[idx + 1] : null,
    next: idx > 0 ? all[idx - 1] : null,
  };
}

// ─── Store Settings ──────────────────────────────────────────────────────────
export async function getStoreSettings(): Promise<StoreSettings | null> {
  if (DEV_BYPASS) return MOCK_SETTINGS;
  const doc = await adminDb.collection("settings").doc("store").get();
  if (!doc.exists) return null;
  return doc.data() as StoreSettings;
}
