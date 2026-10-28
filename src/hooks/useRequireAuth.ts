"use client";

import { useAuth } from "./useAuth";
import { useRouter, usePathname } from "next/navigation";

/**
 * Returns a guard function. Call it before any protected action.
 * If the user is not signed in it redirects to /login?next=<current-path>
 * and returns false. Otherwise returns true.
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return function requireAuth(): boolean {
    if (loading) return false;
    if (user) return true;
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
    return false;
  };
}
