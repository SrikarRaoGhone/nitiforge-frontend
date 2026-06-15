/**
 * File upload validation: allowed extensions only, blocks double extensions
 * and path traversal in filenames.
 */

const DEFAULT_ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
]);

const DANGEROUS_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "com",
  "msi",
  "scr",
  "ps1",
  "vbs",
  "js",
  "mjs",
  "cjs",
  "jar",
  "sh",
  "bash",
  "php",
  "phtml",
  "php3",
  "php4",
  "php5",
  "asp",
  "aspx",
  "jsp",
  "cgi",
  "pl",
  "py",
  "rb",
  "dll",
  "so",
  "dmg",
  "app",
  "deb",
  "rpm",
  "svg",
  "html",
  "htm",
  "xml",
  "wasm",
]);

const FILENAME_PATTERN = /filename\*?=(?:UTF-8''|")?([^";\r\n]+)/gi;

function normalizeFilename(raw) {
  return String(raw || "")
    .trim()
    .replace(/^"+|"+$/g, "")
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .toLowerCase();
}

function getExtension(filename) {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === filename.length - 1) return "";
  return filename.slice(lastDot + 1);
}

function getAllExtensions(filename) {
  const parts = filename.split(".");
  if (parts.length <= 1) return [];
  return parts.slice(1).map((part) => part.toLowerCase());
}

export function validateFilename(filename, allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS) {
  const name = normalizeFilename(filename);

  if (!name) {
    return { valid: false, reason: "Missing filename" };
  }

  if (name.includes("..") || /[<>:"|?*\x00-\x1f]/.test(name)) {
    return { valid: false, reason: "Invalid filename" };
  }

  const extensions = getAllExtensions(name);
  if (extensions.length === 0) {
    return { valid: false, reason: "File must have an extension" };
  }

  if (extensions.length > 1) {
    return { valid: false, reason: "Double extension files are not allowed" };
  }

  const extension = extensions[0];
  if (DANGEROUS_EXTENSIONS.has(extension)) {
    return { valid: false, reason: "File type is not allowed" };
  }

  if (!allowedExtensions.has(extension)) {
    return { valid: false, reason: "File extension is not allowed" };
  }

  return { valid: true, extension };
}

export function extractFilenamesFromMultipart(buffer) {
  const sample = new TextDecoder("utf-8", { fatal: false }).decode(
    buffer.slice(0, Math.min(buffer.byteLength, 256_000)),
  );
  const filenames = [];
  let match = FILENAME_PATTERN.exec(sample);
  while (match) {
    try {
      filenames.push(decodeURIComponent(match[1]));
    } catch {
      filenames.push(match[1]);
    }
    match = FILENAME_PATTERN.exec(sample);
  }
  return filenames;
}

export function validateMultipartUpload(buffer, allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS) {
  if (!buffer || buffer.byteLength === 0) {
    return { valid: true };
  }

  const filenames = extractFilenamesFromMultipart(buffer);
  if (!filenames.length) {
    return { valid: true };
  }

  for (const filename of filenames) {
    const result = validateFilename(filename, allowedExtensions);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

export { DEFAULT_ALLOWED_EXTENSIONS };
