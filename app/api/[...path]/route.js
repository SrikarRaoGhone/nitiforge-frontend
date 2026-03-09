const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://127.0.0.1:8000";
const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

async function proxyRequest(req, { params }) {
  try {
    const resolvedParams = await params;
    const segments = resolvedParams?.path || [];
    const path = segments.join("/");
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
    return Response.json(
      {
        error: "Proxy request failed",
        detail: error?.message || "Unknown error",
      },
      { status: 502 },
    );
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
