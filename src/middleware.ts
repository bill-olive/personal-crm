import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

// Parse the private key from env — handle all Vercel formatting edge cases
function getPrivateKey(): string {
  const raw = process.env.FIREBASE_ADMIN || process.env.FIREBASE_PRIVATE_KEY || "";
  if (!raw) return "";

  // If it's already a proper PEM key with real newlines
  if (raw.includes("-----BEGIN") && raw.includes("\n")) {
    return raw;
  }

  // Handle JSON-escaped newlines (most common Vercel issue)
  if (raw.includes("\\n")) {
    return raw.replace(/\\n/g, "\n");
  }

  // Handle base64-encoded key
  if (!raw.includes("BEGIN") && raw.length > 100) {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      if (decoded.includes("BEGIN")) return decoded;
    } catch {
      // not base64
    }
  }

  // Handle key that was pasted without any newline encoding 
  // (Vercel sometimes strips newlines entirely)
  if (raw.includes("-----BEGIN") && !raw.includes("\n")) {
    // Try to reconstruct: the key content between BEGIN/END markers
    return raw
      .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
      .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----\n");
  }

  return raw;
}

function getServiceAccount() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL || "";
  const privateKey = getPrivateKey();

  return { projectId, clientEmail, privateKey };
}

function isServiceAccountValid(): boolean {
  const sa = getServiceAccount();
  return !!(sa.projectId && sa.clientEmail && sa.privateKey && sa.privateKey.includes("BEGIN PRIVATE KEY"));
}

export async function middleware(request: NextRequest) {
  // Diagnostic endpoint — helps debug env var issues on Vercel
  if (request.nextUrl.pathname === "/api/auth-debug") {
    const sa = getServiceAccount();
    return new NextResponse(
      JSON.stringify({
        hasProjectId: !!sa.projectId,
        hasClientEmail: !!sa.clientEmail,
        privateKeyLength: sa.privateKey.length,
        privateKeyStartsWith: sa.privateKey.substring(0, 40),
        privateKeyEndsWith: sa.privateKey.substring(sa.privateKey.length - 40),
        privateKeyHasBegin: sa.privateKey.includes("-----BEGIN PRIVATE KEY-----"),
        privateKeyHasEnd: sa.privateKey.includes("-----END PRIVATE KEY-----"),
        privateKeyNewlineCount: (sa.privateKey.match(/\n/g) || []).length,
        isValid: isServiceAccountValid(),
        cookieName: process.env.AUTH_COOKIE_NAME || "__session",
        hasSignatureKeys: !!(process.env.AUTH_COOKIE_SIGNATURE_KEYS),
        hasApiKey: !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
        envKeysPresent: {
          FIREBASE_ADMIN: !!process.env.FIREBASE_ADMIN,
          FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
          FIREBASE_ADMIN_PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
          FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
          FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // If service account is not valid, run in open mode (no auth enforcement)
  if (!isServiceAccountValid()) {
    if (request.nextUrl.pathname === "/api/login" || request.nextUrl.pathname === "/api/logout") {
      return new NextResponse(
        JSON.stringify({ status: "ok", note: "Auth not configured - running in open mode" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return NextResponse.next();
  }

  // Service account is valid — use next-firebase-auth-edge
  try {
    const { authMiddleware } = await import("next-firebase-auth-edge");

    const sa = getServiceAccount();
    const cookieSignatureKeys = (
      process.env.AUTH_COOKIE_SIGNATURE_KEYS || "secret1,secret2"
    ).split(",");

    return await authMiddleware(request, {
      loginPath: "/api/login",
      logoutPath: "/api/logout",
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      cookieName: process.env.AUTH_COOKIE_NAME || "__session",
      cookieSignatureKeys,
      cookieSerializeOptions: {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        maxAge: 12 * 60 * 60 * 24,
      },
      serviceAccount: sa,
      handleValidToken: async (_tokenData, headers) => {
        if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next({ request: { headers } });
      },
      handleInvalidToken: async (_reason) => {
        if (
          request.nextUrl.pathname.startsWith("/dashboard") ||
          request.nextUrl.pathname.startsWith("/api/protected")
        ) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
      },
      handleError: async (error) => {
        console.error("Auth middleware handleError:", error);
        if (request.nextUrl.pathname.startsWith("/api/")) {
          return new NextResponse(
            JSON.stringify({ error: "Auth error", details: String(error) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
        if (request.nextUrl.pathname.startsWith("/dashboard")) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
      },
    });
  } catch (error) {
    // Catch ANY crash from authMiddleware itself (including import/init failures)
    console.error("Middleware fatal error:", error);

    if (request.nextUrl.pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({
          error: "Middleware crashed",
          details: String(error),
          hint: "Check FIREBASE_ADMIN private key format. Visit /api/auth-debug for diagnostics.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // For page requests, allow through rather than crashing
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/api/login",
    "/api/logout",
    "/api/auth-debug",
    "/api/protected/:path*",
  ],
};
