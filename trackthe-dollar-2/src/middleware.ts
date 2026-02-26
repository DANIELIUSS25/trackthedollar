// src/middleware.ts
import { auth } from "@/lib/auth/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route matchers.
 * Auth.js middleware runs only on matched paths — keep this tight.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/markets", "/macro", "/portfolio", "/alerts", "/settings", "/upgrade"];
const AUTH_PREFIXES = ["/login", "/register"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/health"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_PREFIXES.some((p) => pathname.startsWith(p));
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
}

export default auth(async function middleware(req: NextRequest & { auth: Awaited<ReturnType<typeof auth>> }) {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user?.id;

  // Allow public API routes through without auth check
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute(pathname) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (Next.js static files)
     * - _next/image  (Next.js image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og-image.png).*)",
  ],
};
