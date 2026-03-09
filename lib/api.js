import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
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
