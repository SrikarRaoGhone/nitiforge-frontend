/**
 * Patterns associated with cryptominer payloads, suspicious downloaders,
 * and common exploit probes. Used for request blocking and security logging.
 */

export const SUSPICIOUS_URL_PATTERNS = [
  /xmrig/i,
  /cryptonight/i,
  /stratum\+tcp/i,
  /minerd/i,
  /kdevtmpfsi/i,
  /kinsing/i,
  /\bwget\b/i,
  /\bcurl\b.*\|\s*sh/i,
  /base64\s+-d/i,
  /\/etc\/passwd/i,
  /\/proc\/self/i,
  /\.env(\.|$)/i,
  /phpmyadmin/i,
  /wp-admin/i,
  /wp-login/i,
  /shell\.php/i,
  /c99\.php/i,
  /r57\.php/i,
];

export const SUSPICIOUS_PATH_SEGMENTS = new Set([
  "xmrig",
  "miner",
  "minerd",
  "kinsing",
  "kdevtmpfsi",
  "wget",
  "shell",
  "cmd",
  "eval",
  "exec",
]);

export const BLOCKED_PROXY_PATH_PREFIXES = [
  "../",
  "..\\",
  "%2e%2e",
  "%252e",
];

export function containsSuspiciousContent(value) {
  if (!value || typeof value !== "string") return false;
  return SUSPICIOUS_URL_PATTERNS.some((pattern) => pattern.test(value));
}

export function hasSuspiciousPathSegment(segments) {
  if (!Array.isArray(segments)) return false;
  return segments.some((segment) => {
    const normalized = String(segment || "").trim().toLowerCase();
    if (!normalized) return false;
    if (SUSPICIOUS_PATH_SEGMENTS.has(normalized)) return true;
    return containsSuspiciousContent(normalized);
  });
}

export function hasPathTraversal(path) {
  const normalized = String(path || "");
  if (!normalized) return false;
  if (BLOCKED_PROXY_PATH_PREFIXES.some((token) => normalized.includes(token))) {
    return true;
  }
  return normalized.split("/").some((segment) => segment === ".." || segment === "%2e%2e");
}
