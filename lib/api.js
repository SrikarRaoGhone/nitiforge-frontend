import axios from "axios";

/**
 * NEXT_PUBLIC_API_URL should be the API origin only, e.g. https://api.domain.com
 * (no /leads suffix). Host-only values like api.domain.com get https:// prepended.
 */
function resolveApiBaseUrl() {
  const raw = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    ""
  ).trim();
  if (!raw) return "/api";
  let base = raw.replace(/\/+$/, "");
  if (base.startsWith("/")) return base || "/api";
  if (/^https?:\/\//i.test(base)) return base;
  if (/^(localhost|127\.0\.0\.1)(\:|$)/i.test(base)) return `http://${base}`;
  return `https://${base}`;
}

const API = axios.create({
  baseURL: resolveApiBaseUrl(),
});

// attach token automatically
API.interceptors.request.use((req) => {
  if (typeof window === "undefined") return req;

  const url = req.url || "";
  const isAuthEndpoint =
    url.includes("/auth/login") || url.includes("/auth/register");
  if (isAuthEndpoint) return req;

  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
