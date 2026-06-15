/**
 * Input validation helpers for API proxy and form data.
 * React JSX output encoding is handled by React; use these for strings
 * rendered via dangerouslySetInnerHTML (not used in this app) or API payloads.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;
const SAFE_TEXT_PATTERN = /^[\w\s@.,'+\-/()&:;#]*$/i;

export function sanitizeString(value, maxLength = 500) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text) return "";
  return text.slice(0, maxLength);
}

export function isValidEmail(value) {
  const text = sanitizeString(value, 254);
  return Boolean(text) && EMAIL_PATTERN.test(text);
}

export function isValidPhone(value) {
  const text = sanitizeString(value, 20);
  return Boolean(text) && PHONE_PATTERN.test(text);
}

export function isSafeDisplayText(value, maxLength = 1000) {
  const text = sanitizeString(value, maxLength);
  if (!text) return true;
  return SAFE_TEXT_PATTERN.test(text);
}

export function encodeForHtmlAttribute(value) {
  return sanitizeString(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function validateProxyPathSegments(segments) {
  if (!Array.isArray(segments)) {
    return { valid: false, reason: "Invalid path segments" };
  }

  for (const segment of segments) {
    const text = String(segment || "");
    if (!text) continue;
    if (text.length > 200) {
      return { valid: false, reason: "Path segment too long" };
    }
    if (/[<>'"`;\\]/.test(text)) {
      return { valid: false, reason: "Invalid characters in path" };
    }
  }

  return { valid: true };
}

export function validateHttpMethod(method) {
  const allowed = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
  const normalized = String(method || "").toUpperCase();
  return allowed.has(normalized);
}
