const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://127.0.0.1:8000";

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

    const init = {
      method: req.method,
      headers,
      redirect: "manual",
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = await req.arrayBuffer();
    }

    const upstream = await fetch(targetUrl, init);
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
