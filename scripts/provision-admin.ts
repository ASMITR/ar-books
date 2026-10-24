/**
 * Provision admin — run once to grant admin custom claim to a Firebase user.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/provision-admin.ts admin@example.com
 *
 * Requires FIREBASE_ADMIN_* env vars.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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

const adminAuth = getAuth();
const db = getFirestore();

async function provisionAdmin(email: string) {
  const user = await adminAuth.getUserByEmail(email);
  await adminAuth.setCustomUserClaims(user.uid, { admin: true });
  await db.collection("users").doc(user.uid).set(
    { role: "admin", email, updatedAt: new Date().toISOString() },
    { merge: true }
  );
  console.log(`✅ Admin claim granted to ${email} (uid: ${user.uid})`);
  console.log("The user must sign out and sign back in for the claim to take effect.");
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx ts-node scripts/provision-admin.ts <email>");
  process.exit(1);
}

provisionAdmin(email).catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
