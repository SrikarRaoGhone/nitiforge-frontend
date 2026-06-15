# Dependency Security Audit Report

**Generated:** 2026-05-27  
**Project:** nitiforge-frontend  
**Command:** `npm audit`

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Moderate | 2 |
| Low | 0 |

## Findings

### Moderate — PostCSS (transitive via Next.js)

- **Advisory:** [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)
- **Issue:** XSS via unescaped `</style>` in CSS stringify output (PostCSS &lt; 8.5.10)
- **Path:** `next` → `postcss`
- **Fix status:** No non-breaking fix available in current Next.js line (`npm audit fix --force` would downgrade Next to 9.x)

### Action taken

- Ran `npm audit fix` (no automatic patches applied without breaking changes)
- Removed unused runtime dependency `classnames`
- Moved `shadcn` CLI from `dependencies` → `devDependencies` (scaffolding only, not runtime)
- No **High** or **Critical** vulnerabilities detected

## Dependency hygiene

| Package | Action |
|---------|--------|
| `classnames` | Removed (unused; `clsx` + `tailwind-merge` used via `cn()`) |
| `shadcn` | Moved to devDependencies |
| All other dependencies | Retained — actively used in app UI/runtime |

## Re-run audit

```bash
npm run security:audit
cat docs/security/dependency-audit-report.json
```

## Backend note

`pip-audit` applies to the separate API/backend repository (`API_PROXY_TARGET`), not this frontend workspace.
