# Security notes

## Frontend (this repository)

- **ORM / parameterized queries / tenant isolation**: Enforced by the backend API. This Next.js app proxies requests via `/api/*` and does not execute SQL directly.
- **Output encoding**: React escapes JSX by default. Use `lib/security/validation.js` helpers if rendering untrusted strings outside JSX.
- **File uploads**: No upload UI is present yet. `lib/security/file-upload.js` validates multipart proxy traffic (allowed extensions, blocks double extensions).
- **Rate limiting**: `middleware.js` limits `/api` traffic (configurable via `API_RATE_LIMIT_MAX`, `API_RATE_LIMIT_WINDOW_MS`).
- **Secure headers**: Applied in `middleware.js` and `next.config.mjs`.
- **Security logging**: `lib/security/logging.js` records blocked/suspicious requests and handled exceptions.
- **Threat blocking**: Blocks common miner/downloader/shell probe patterns (`xmrig`, `wget`, path traversal, etc.).

## Backend (separate service)

Ensure the API behind `API_PROXY_TARGET` implements:

- ORM-only database access with parameterized queries
- Input validation and centralized exception handling
- Tenant isolation by `company_id` on every query
- Server-side file upload validation mirroring `lib/security/file-upload.js`

## Dependency audits

```bash
npm run security:audit
```

Reports are written to `docs/security/dependency-audit-report.json`.
