/**
 * Run once to create the three default membership plans in Firestore.
 * Usage: npx ts-node --esm scripts/seed-membership-plans.ts
 *
 * Safe to re-run — uses upsert (merge) so it won't duplicate plans.
 */
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function getAdminApp() {
  if (getApps().length) return getApp();
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.split(String.raw`\n`).join("\n"),
    }),
  });
}

const app = getAdminApp();
const db = getFirestore(app);

const now = new Date().toISOString();

const plans = [
  {
    id: "plan_starter",
    name: "Starter",
    slug: "starter",
    description: "Begin your reading journey with handpicked eBooks and monthly recommendations.",
    pricePaise: 19900,
    priceRupees: 199,
    currency: "INR",
    billingPeriod: "monthly",
    razorpayPlanId: null,
    canDownload: false,
    canReadOnline: true,
    downloadLimit: 0,
    includesStarter: true,
    includesPlus: false,
    includesPremium: false,
    includesExclusive: false,
    includesLatestReleases: false,
    badgeLabel: "Starter Member",
    badgeColor: "#789185",
    highlighted: false,
    sortOrder: 1,
    benefits: [
      "Access to Starter eBook collection",
      "Read eligible eBooks online",
      "Personal member library",
      "Monthly reading recommendations",
      "Standard customer support",
    ],
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "plan_plus",
    name: "Plus",
    slug: "plus",
    description: "Everything in Starter plus downloads, early access, and exclusive resources.",
    pricePaise: 39900,
    priceRupees: 399,
    currency: "INR",
    billingPeriod: "monthly",
    razorpayPlanId: null,
    canDownload: true,
    canReadOnline: true,
    downloadLimit: null,
    includesStarter: true,
    includesPlus: true,
    includesPremium: false,
    includesExclusive: false,
    includesLatestReleases: true,
    badgeLabel: "Plus Member",
    badgeColor: "#315B55",
    highlighted: true,
    sortOrder: 2,
    benefits: [
      "Everything in Starter",
      "Access to all eligible latest releases",
      "Access to selected older eBooks",
      "Downloadable PDF copies while membership is active",
      "Exclusive member-only resources",
      "Early access to selected new releases",
      "Access to selected reading collections",
    ],
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "plan_premium",
    name: "Premium",
    slug: "premium",
    description: "Unlimited access to the full membership catalogue with premium exclusives.",
    pricePaise: 59900,
    priceRupees: 599,
    currency: "INR",
    billingPeriod: "monthly",
    razorpayPlanId: null,
    canDownload: true,
    canReadOnline: true,
    downloadLimit: null,
    includesStarter: true,
    includesPlus: true,
    includesPremium: true,
    includesExclusive: true,
    includesLatestReleases: true,
    badgeLabel: "Premium Member",
    badgeColor: "#C6A66B",
    highlighted: false,
    sortOrder: 3,
    benefits: [
      "Everything in Plus",
      "Access to ALL eligible eBooks in the membership catalogue",
      "Access to premium and exclusive collections",
      "Early access to every new release",
      "Premium downloadable workbooks and reading resources",
      "Exclusive monthly reading collection",
      "Priority member support",
    ],
    active: true,
    createdAt: now,
    updatedAt: now,
  },
];

async function seed() {
  console.log("Seeding membership plans...");
  for (const plan of plans) {
    const { id, ...data } = plan;
    await db.collection("membershipPlans").doc(id).set(data, { merge: true });
    console.log(`  ✓ ${plan.name} (${plan.id}) — ₹${plan.priceRupees}/month`);
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
