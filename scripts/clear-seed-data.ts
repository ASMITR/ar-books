/**
 * clear-seed-data.ts
 * Deletes all seeded/demo documents from Firestore.
 * Run once: npx ts-node --project tsconfig.json scripts/clear-seed-data.ts
 *
 * Safe collections — wiped entirely (only contain demo data):
 *   books, categories, articles, coupons,
 *   orders, downloadEntitlements, downloadLogs
 *
 * Careful collections — only demo/fake docs removed:
 *   users  → removes docs whose email ends with @example.com
 *   settings → deleted so admin can re-configure from the dashboard
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const BATCH_LIMIT = 500;

async function deleteCollection(name: string) {
  const snap = await db.collection(name).get();
  if (snap.empty) { console.log(`  ${name}: already empty`); return; }
  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    snap.docs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += Math.min(BATCH_LIMIT, snap.docs.length - i);
  }
  console.log(`  ✓ ${name}: ${deleted} doc${deleted !== 1 ? "s" : ""} deleted`);
}

async function deleteDemoUsers() {
  const snap = await db.collection("users").get();
  const demoDocs = snap.docs.filter((d) => {
    const email: string = d.data().email ?? "";
    return email.endsWith("@example.com");
  });
  if (demoDocs.length === 0) { console.log("  users: no demo docs found"); return; }
  for (let i = 0; i < demoDocs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    demoDocs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  console.log(`  ✓ users: ${demoDocs.length} demo doc${demoDocs.length !== 1 ? "s" : ""} deleted`);
}

async function clear() {
  console.log("Clearing seeded demo data from Firestore…\n");

  // ── Collections that are 100 % demo data ─────────────────────────────────
  const safeToClear = [
    "books",
    "categories",
    "articles",
    "coupons",
    "orders",
    "downloadEntitlements",
    "downloadLogs",
  ];
  for (const col of safeToClear) {
    await deleteCollection(col);
  }

  // ── Only remove @example.com users (demo customers) ──────────────────────
  await deleteDemoUsers();

  // ── Delete store settings so admin can configure from scratch ────────────
  await db.collection("settings").doc("store").delete();
  console.log("  ✓ settings/store deleted");

  console.log("\n✅ All demo data cleared.");
  console.log("   → Re-add store settings from the Admin → Settings page.");
  console.log("   → Add real books/categories from the Admin dashboard.");
}

clear().catch((err) => {
  console.error("Clear failed:", err);
  process.exit(1);
});
