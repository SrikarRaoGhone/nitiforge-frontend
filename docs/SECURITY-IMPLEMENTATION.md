# Frontend dependency security audit

Run: `npm audit`

Full output: `docs/security-audit-frontend.txt`

## Changes applied

- `axios` upgraded to `^1.18.0` (high CVE fixes)
- `next` upgraded to `16.2.9` (high CVE fixes)
- `eslint-config-next` aligned to `16.2.9`
- Removed unused `classnames`
- `npm audit fix` for transitive dependencies
- Security headers added in `next.config.mjs`

## Remaining

After upgrades, only moderate `postcss` advisories may remain via Next.js bundled dependency. Re-run `npm audit` when Next.js publishes patched releases.
