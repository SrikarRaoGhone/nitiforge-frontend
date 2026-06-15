import { validateHttpMethod, validateProxyPathSegments } from "@/lib/security/validation";
import {
  containsSuspiciousContent,
  hasPathTraversal,
  hasSuspiciousPathSegment,
} from "@/lib/security/threats";
import { validateMultipartUpload } from "@/lib/security/file-upload";
import { logProxyValidationFailure } from "@/lib/security/logging";
import {
  createSafeErrorResponse,
  createValidationErrorResponse,
} from "@/lib/security/errors";

const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://127.0.0.1:8000";
const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

async function proxyRequest(req, { params }) {
  try {
    if (!validateHttpMethod(req.method)) {
      return createValidationErrorResponse("Unsupported HTTP method", 405);
    }

    const resolvedParams = await params;
    const segments = resolvedParams?.path || [];
    const path = segments.join("/");

    if (
      hasPathTraversal(path) ||
      hasSuspiciousPathSegment(segments) ||
      containsSuspiciousContent(`${req.nextUrl.pathname}${req.nextUrl.search}`)
    ) {
      logProxyValidationFailure(req, "suspicious_proxy_path", { path });
      return createValidationErrorResponse("Invalid request path", 400);
    }

    const pathValidation = validateProxyPathSegments(segments);
    if (!pathValidation.valid) {
      logProxyValidationFailure(req, pathValidation.reason, { path });
      return createValidationErrorResponse(pathValidation.reason, 400);
    }

    const search = req.nextUrl.search || "";
    const targetUrl = `${API_PROXY_TARGET}/${path}${search}`;

    const headers = new Headers();
    const contentType = req.headers.get("content-type");
    const authorization = req.headers.get("authorization");
    const accept = req.headers.get("accept");
    const cookie = req.headers.get("cookie");

    if (contentType) headers.set("content-type", contentType);
    if (authorization) headers.set("authorization", authorization);
    if (accept) headers.set("accept", accept);
    if (cookie) headers.set("cookie", cookie);

    const baseInit = {
      method: req.method,
      headers,
      redirect: "manual",
    };

    let bodyBuffer;
    if (req.method !== "GET" && req.method !== "HEAD") {
      bodyBuffer = await req.arrayBuffer();

      if (contentType && contentType.includes("multipart/form-data")) {
        const uploadValidation = validateMultipartUpload(bodyBuffer);
        if (!uploadValidation.valid) {
          logProxyValidationFailure(req, uploadValidation.reason, { path });
          return createValidationErrorResponse(uploadValidation.reason, 400);
        }
      }
    }

    const callUpstream = (url, method = req.method) => {
      const init = {
        ...baseInit,
        method,
      };

      if (method !== "GET" && method !== "HEAD") {
        init.body = bodyBuffer;
      }

      return fetch(url, init);
    };

    let upstream;

    try {
      upstream = await callUpstream(targetUrl);
    } catch (error) {
      // Some FastAPI routers canonicalize slash paths; retry once with trailing slash.
      if (!targetUrl.endsWith("/")) {
        upstream = await callUpstream(`${targetUrl}/`);
      } else {
        throw error;
      }
    }

    if (REDIRECT_STATUS.has(upstream.status)) {
      const location = upstream.headers.get("location");
      if (location) {
        const redirectUrl = new URL(location, targetUrl).toString();
        const redirectMethod = upstream.status === 303 ? "GET" : req.method;
        upstream = await callUpstream(redirectUrl, redirectMethod);
      }
    }
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return createSafeErrorResponse(error, {
      context: "api_proxy",
      publicMessage: "Proxy request failed",
      status: 502,
    });
  }
}

export async function GET(req, ctx) {
  return proxyRequest(req, ctx);
}

export async function POST(req, ctx) {
  return proxyRequest(req, ctx);
}

export async function PUT(req, ctx) {
  return proxyRequest(req, ctx);
}

export async function PATCH(req, ctx) {
  return proxyRequest(req, ctx);
}

export async function DELETE(req, ctx) {
  return proxyRequest(req, ctx);
}

export async function OPTIONS(req, ctx) {
  return proxyRequest(req, ctx);
}
