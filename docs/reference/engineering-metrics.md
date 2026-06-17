# Engineering Metrics

**Measured on:** 2026-06-17

| Metric | Value | Evidence |
|---|---:|---|
| GitNexus files | 277 | `npx.cmd gitnexus list` |
| GitNexus nodes | 1,580 | `npx.cmd gitnexus list` |
| GitNexus edges | 3,480 | `npx.cmd gitnexus list` |
| GitNexus flows | 95 | `npx.cmd gitnexus list` |
| Nest controller route methods | 24 | `rg -n "@(Get|Post|Put|Patch|Delete)\(" src -g "*.ts"` |
| GitNexus route nodes | 26 | `mcp__gitnexus.route_map` |
| Prisma models | 21 | `prisma/schema.prisma` |
| Prisma enums | 15 | `prisma/schema.prisma` |
| Prisma migrations | 5 | `prisma/migrations/*/migration.sql` |
| TS test/spec files | 34 | `rg --files -g "*.test.ts" -g "*.spec.ts"` |
| GitHub Actions workflows | 1 | `.github/workflows/ci.yml` |
| CI jobs | 4 | `.github/workflows/ci.yml` |

## Verification Commands

Use these commands before updating any metric:

```powershell
npx.cmd gitnexus analyze --index-only --name ledger-credit-system .
npx.cmd gitnexus status
npx.cmd gitnexus list
rg -n "@(Get|Post|Put|Patch|Delete)\(" src -g "*.ts"
rg --files -g "*.test.ts" -g "*.spec.ts" src tests apps/web/src
```
