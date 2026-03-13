import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/config";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    serviceAccount: authConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      // User is authenticated
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next({ request: { headers } });
    },
    handleInvalidToken: async (reason) => {
      console.info("Missing or invalid credentials", { reason });
      // In development without Firebase config, allow dashboard access
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.next();
      }
      // If trying to access protected routes, redirect to login
      if (request.nextUrl.pathname.startsWith("/dashboard") || 
          request.nextUrl.pathname.startsWith("/api/protected")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    },
    handleError: async (error) => {
      console.error("Auth middleware error:", { error });
      // In development without Firebase config, allow dashboard access
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/login", request.url));
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
