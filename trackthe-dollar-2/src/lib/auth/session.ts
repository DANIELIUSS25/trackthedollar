// src/lib/auth/session.ts
import NextAuth from "next-auth";
import { authConfig } from "./config";

/**
 * Server-side Auth.js handlers and helpers.
 * Import { auth } from here in Server Components, Route Handlers, and middleware.
 */
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

/**
 * Convenience helper — returns the current server session or null.
 * Throws if called in an Edge runtime (use middleware.ts for edge auth).
 */
export async function getRequiredSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
