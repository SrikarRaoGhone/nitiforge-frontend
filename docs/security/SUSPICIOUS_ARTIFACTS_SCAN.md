# Suspicious Artifact Investigation

**Date:** 2026-05-27  
**Repository:** nitiforge-frontend  
**Scope:** Source tree (excluding `.next` build output and `node_modules`)

## Scan summary

| Check | Result |
|-------|--------|
| `wget` / `curl \| sh` patterns in source | **Not found** |
| `xmrig` / miner / cryptominer strings | **Not found** |
| Shell scripts (`.sh`, `.bash`) | **Not found** |
| Python scripts in repo root | **Not found** |
| `child_process` / `eval` / `exec` usage | **Not found** |
| File upload inputs in UI | **Not found** (multipart validation added at API proxy for future uploads) |

## Files reviewed

- All `app/`, `components/`, `lib/` JavaScript modules
- `package.json` / lockfile dependency names
- No standalone deployment or install scripts outside npm lifecycle

## Conclusion

No evidence of wget-based payloads, xmrig miners, or suspicious install scripts in the application source.

## Preventive controls added

1. `middleware.js` blocks suspicious URL/user-agent patterns (including `xmrig`, `wget`, shell probes).
2. `lib/security/threats.js` centralizes threat signatures for middleware and API proxy.
3. `lib/security/file-upload.js` rejects dangerous/double-extension uploads on multipart API proxy traffic.
4. Run `npm run security:audit` regularly and review `docs/security/dependency-audit-report.json`.

## Recommended ops checks (outside this repo)

- Scan server filesystem and cron jobs for unexpected `xmrig` binaries or unknown `wget` cron entries.
- Restrict outbound network from production hosts except required API endpoints.
- Keep backend (`API_PROXY_TARGET`) patched separately with `pip-audit` if Python/FastAPI.
