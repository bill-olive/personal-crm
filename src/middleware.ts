import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/config";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

function hasValidServiceAccount(): boolean {
  return !!(
    authConfig.serviceAccount.projectId &&
    authConfig.serviceAccount.clientEmail &&
    authConfig.serviceAccount.privateKey &&
    authConfig.serviceAccount.privateKey.includes("BEGIN")
  );
}

export async function middleware(request: NextRequest) {
  // If service account is not configured, allow all access (dev mode)
  if (!hasValidServiceAccount()) {
    // Still handle /api/login and /api/logout gracefully
    if (request.nextUrl.pathname === "/api/login") {
      return new NextResponse(JSON.stringify({ error: "Service account not configured" }), {
        status: 200, // Return 200 so the client doesn't crash
        headers: { "Content-Type": "application/json" },
      });
    }
    if (request.nextUrl.pathname === "/api/logout") {
      return new NextResponse(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Allow dashboard access without auth in dev mode
    return NextResponse.next();
  }

  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    serviceAccount: authConfig.serviceAccount,
    handleValidToken: async ({ decodedToken }, headers) => {
      // User is authenticated — redirect from public pages to dashboard
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next({ request: { headers } });
    },
    handleInvalidToken: async (reason) => {
      console.info("Invalid token:", reason);
      // If trying to access protected routes, redirect to login
      if (
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/api/protected")
      ) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    },
    handleError: async (error) => {
      console.error("Auth middleware error:", error);
      // If this is an API endpoint, return JSON error
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Authentication error", details: String(error) }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      // For page requests, redirect to login
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/api/login",
    "/api/logout",
    "/api/protected/:path*",
  ],
};
