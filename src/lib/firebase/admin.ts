import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const DEV_BYPASS = process.env.DEV_BYPASS === "true";

function getAdminApp() {
  if (DEV_BYPASS) return null as never;
  if (getApps().length) return getApp();
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminApp = DEV_BYPASS ? (null as never) : getAdminApp();
export const adminAuth = DEV_BYPASS ? (null as never) : getAuth(adminApp);
export const adminDb = DEV_BYPASS ? (null as never) : getFirestore(adminApp);

