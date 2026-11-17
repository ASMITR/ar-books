import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function app() {
  if (getApps().length) return getApp();
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FB_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  });
}

// Call these inside components/hooks/handlers — not at module level.
// Firebase throws auth/invalid-api-key when env vars are absent at build time.
export function getClientAuth() {
  return getAuth(app());
}

export function getClientDb() {
  return getFirestore(app());
}
