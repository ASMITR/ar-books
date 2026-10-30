import { cookies } from "next/headers";
import { adminAuth } from "./admin";
import type { AppUser, UserRole } from "@/types";

export async function getSessionUser(): Promise<AppUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const decoded = await adminAuth.verifySessionCookie(token, true);

    // Fetch live user record to get current custom claims.
    // This handles the case where the admin claim was set after the session
    // cookie was issued (e.g. promoted via Admin SDK).
    const userRecord = await adminAuth.getUser(decoded.uid);
    const claims = userRecord.customClaims ?? {};
    const role: UserRole = claims.admin === true ? "admin" : "member";

    return {
      uid: decoded.uid,
      displayName: decoded.name ?? userRecord.displayName ?? null,
      email: decoded.email ?? userRecord.email ?? null,
      emailVerified: decoded.email_verified ?? userRecord.emailVerified ?? false,
      role,
      photoURL: decoded.picture ?? userRecord.photoURL ?? null,
      createdAt: "",
      updatedAt: "",
    };
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUser(): Promise<AppUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export async function requireMember(): Promise<AppUser> {
  const user = await requireAuthenticatedUser();
  return user;
}
