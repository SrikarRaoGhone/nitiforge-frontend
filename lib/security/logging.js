const SECURITY_LOG_PREFIX = "[nitiforge-security]";

export function logSecurityEvent(event, details = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  };

  if (process.env.NODE_ENV === "production") {
    console.warn(SECURITY_LOG_PREFIX, JSON.stringify(payload));
    return;
  }

  console.warn(SECURITY_LOG_PREFIX, payload);
}

export function logSuspiciousRequest(req, reason, extra = {}) {
  logSecurityEvent("suspicious_request_blocked", {
    reason,
    method: req?.method,
    url: req?.url || req?.nextUrl?.toString?.(),
    userAgent: req?.headers?.get?.("user-agent") || undefined,
    ...extra,
  });
}

export function logRateLimitExceeded(req, extra = {}) {
  logSecurityEvent("rate_limit_exceeded", {
    method: req?.method,
    url: req?.url || req?.nextUrl?.toString?.(),
    ...extra,
  });
}

export function logProxyValidationFailure(req, reason, extra = {}) {
  logSecurityEvent("proxy_request_rejected", {
    reason,
    method: req?.method,
    url: req?.url || req?.nextUrl?.toString?.(),
    ...extra,
  });
}
