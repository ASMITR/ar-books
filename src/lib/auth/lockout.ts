import { adminDb } from "@/lib/firebase/admin";

// ─── Lockout Rules ────────────────────────────────────────────────────────────
//  Attempt 1–2  → show error, no delay
//  Attempt 3    → 24-hour lockout
//  Attempt 4    → 24-hour lockout (timer resets each new violation)
//  Attempt 5+   → permanent block (only admin can lift it)

const LOCKOUT_24H_MS = 24 * 60 * 60 * 1000;

export interface LockoutRecord {
  email: string;
  attempts: number;           // total failed attempts ever
  lockedUntil: string | null; // ISO — null means no timed lock
  permanent: boolean;         // true when attempt >= 5
  lastAttemptAt: string;
  unlockedAt?: string;        // audit — when admin last unlocked
}

export interface LockoutStatus {
  blocked: boolean;     // true if login must be prevented right now
  permanent: boolean;   // true if admin action is required
  lockedUntil: string | null;
  attempts: number;
  remainingMs: number;  // ms until timed lock lifts (0 if not locked or permanent)
}

function docId(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, "_");
}

/** Read current lockout state for an email without modifying anything. */
export async function getLockoutStatus(email: string): Promise<LockoutStatus> {
  const ref = adminDb.collection("loginAttempts").doc(docId(email));
  const snap = await ref.get();

  if (!snap.exists) {
    return { blocked: false, permanent: false, lockedUntil: null, attempts: 0, remainingMs: 0 };
  }

  const data = snap.data() as LockoutRecord;
  const now = Date.now();

  if (data.permanent) {
    return { blocked: true, permanent: true, lockedUntil: null, attempts: data.attempts, remainingMs: 0 };
  }

  if (data.lockedUntil) {
    const until = new Date(data.lockedUntil).getTime();
    if (now < until) {
      return {
        blocked: true,
        permanent: false,
        lockedUntil: data.lockedUntil,
        attempts: data.attempts,
        remainingMs: until - now,
      };
    }
  }

  return { blocked: false, permanent: false, lockedUntil: null, attempts: data.attempts, remainingMs: 0 };
}

/** Record a failed login attempt and apply the appropriate lockout rule. */
export async function recordFailedAttempt(email: string): Promise<LockoutStatus> {
  const ref = adminDb.collection("loginAttempts").doc(docId(email));

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = snap.exists ? (snap.data() as LockoutRecord) : null;

    if (existing?.permanent) {
      return { blocked: true, permanent: true, lockedUntil: null, attempts: existing.attempts, remainingMs: 0 };
    }

    const now = new Date().toISOString();
    const attempts = (existing?.attempts ?? 0) + 1;

    let lockedUntil: string | null = null;
    let permanent = false;

    if (attempts >= 5) {
      permanent = true;
    } else if (attempts >= 3) {
      lockedUntil = new Date(Date.now() + LOCKOUT_24H_MS).toISOString();
    }

    const record: LockoutRecord = {
      email: email.toLowerCase().trim(),
      attempts,
      lockedUntil,
      permanent,
      lastAttemptAt: now,
    };

    if (snap.exists) {
      tx.update(ref, record as unknown as Record<string, unknown>);
    } else {
      tx.set(ref, record);
    }

    const remainingMs = lockedUntil ? new Date(lockedUntil).getTime() - Date.now() : 0;
    return { blocked: permanent || lockedUntil !== null, permanent, lockedUntil, attempts, remainingMs };
  });
}

/** Record a successful login — resets the attempt counter. */
export async function recordSuccessfulLogin(email: string): Promise<void> {
  const ref = adminDb.collection("loginAttempts").doc(docId(email));
  const snap = await ref.get();
  if (!snap.exists) return;
  await ref.update({
    attempts: 0,
    lockedUntil: null,
    permanent: false,
    lastSuccessAt: new Date().toISOString(),
  });
}

/** Admin action: fully clear lockout for an email. */
export async function adminUnlockEmail(email: string): Promise<void> {
  const ref = adminDb.collection("loginAttempts").doc(docId(email));
  await ref.set(
    {
      attempts: 0,
      lockedUntil: null,
      permanent: false,
      unlockedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
