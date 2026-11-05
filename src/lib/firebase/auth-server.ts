import { cookies } from "next/headers";
import { adminAuth } from "./admin";
import type { AppUser, UserRole } from "@/types";

export async function getSessionUser(): Promise<AppUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    // verifySessionCookie with checkRevoked=false is ~3x faster (no network call).
    // We only do the extra getUser() call when the cookie doesn't already carry
    // the admin claim — i.e. the first session after provisioning.
    const decoded = await adminAuth.verifySessionCookie(token, false);
    const cookieClaims = (decoded as Record<string, unknown>);

    let role: UserRole = "member";
    if (cookieClaims.admin === true) {
      role = "admin";
    } else {
      // Only hit the network when the claim isn't baked into the cookie yet.
      const userRecord = await adminAuth.getUser(decoded.uid);
      if (userRecord.customClaims?.admin === true) role = "admin";
    }

    return {
      uid: decoded.uid,
      displayName: decoded.name ?? null,
      email: decoded.email ?? null,
      emailVerified: decoded.email_verified ?? false,
      role,
      photoURL: decoded.picture ?? null,
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
