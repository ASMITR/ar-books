import { cookies } from "next/headers";
import { adminAuth } from "./admin";
import type { AppUser, UserRole } from "@/types";

const DEV_BYPASS = process.env.DEV_BYPASS === "true";

const DEV_USER: AppUser = {
  uid: "dev-bypass-uid",
  displayName: "Dev User",
  email: "dev@bypass.local",
  emailVerified: true,
  role: "admin",
  photoURL: null,
  createdAt: "",
  updatedAt: "",
};

export async function getSessionUser(): Promise<AppUser | null> {
  if (DEV_BYPASS) return DEV_USER;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    const decoded = await adminAuth.verifySessionCookie(token, true);
    const role: UserRole = decoded.admin === true ? "admin" : "member";
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
