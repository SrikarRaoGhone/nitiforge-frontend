import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  containsSuspiciousContent,
  hasSuspiciousPathSegment,
  hasPathTraversal,
} from "@/lib/security/threats";
import { SECURITY_HEADERS } from "@/lib/security/headers.mjs";
import {
  logRateLimitExceeded,
  logSuspiciousRequest,
} from "@/lib/security/logging";

function applyHeaders(response) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: http://127.0.0.1:* http://localhost:*; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
  }

  return response;
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const fullUrl = `${pathname}${request.nextUrl.search}`;
  const userAgent = request.headers.get("user-agent") || "";

  if (
    containsSuspiciousContent(fullUrl) ||
    containsSuspiciousContent(userAgent) ||
    hasPathTraversal(pathname) ||
    hasSuspiciousPathSegment(pathname.split("/").filter(Boolean))
  ) {
    logSuspiciousRequest(request, "suspicious_request_pattern");
    return applyHeaders(new NextResponse("Forbidden", { status: 403 }));
  }

  if (pathname.startsWith("/api")) {
    const rate = checkRateLimit(request, {
      namespace: "api",
      maxRequests: Number(process.env.API_RATE_LIMIT_MAX || 120),
      windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 60_000),
    });

    if (!rate.allowed) {
      logRateLimitExceeded(request, { pathname });
      return applyHeaders(
        NextResponse.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: {
              "Retry-After": String(rate.retryAfterSeconds || 60),
            },
          },
        ),
      );
    }
  }

  return applyHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"],
};
