# Repository Status

**Status date:** 2026-06-17
**Repository:** `D:\projects\ledger-credit-system`
**Git commit used for scan:** final verification scan; confirm current value with `npx.cmd gitnexus status`
**Documentation status:** Source-backed refresh implemented with known verification blockers

**Scan scope note:** GitNexus was refreshed during final verification. Run `npx.cmd gitnexus status` before relying on the metrics after any file change.

## GitNexus Index

| Metric | Value |
|---|---:|
| Files | 277 |
| Symbols/nodes | 1,583 |
| Edges | 3,483 |
| Clusters | 58 |
| Execution flows | 95 |

## Current Source Shape

| Area | Current status |
|---|---|
| TypeScript backend | Implemented under `src/` with NestJS, Fastify, Prisma, auth, audit, ledger, transfer, credit, batch, ops, and health modules |
| PostgreSQL schema | Implemented through Prisma schema and 5 migrations |
| Web workspace | Minimal Next.js customer-facing workspace under `apps/web` |
| Java API workspace | Skeleton Spring Boot service under `apps/api-java` with health endpoint and CI job |
| API contracts | OpenAPI workspace under `packages/api-contracts` |
| CI | One GitHub Actions workflow with backend, contracts, Java API, and web jobs |
| Root README | Implemented at `README.md` |
| Docs README | Implemented at `docs/README.md` |

## Known Limits

- No live production deployment evidence is present in this repository.
- External bank integration is represented by simulator and mock-bank adapters only.
- Observability is currently structured logging plus correlation IDs; do not document a metrics dashboard stack as implemented unless code is added later.
- The root `Dockerfile` uses Node 20 while CI uses Node 22; document this as a compatibility note rather than silently hiding it.
- Local defaults and tests include placeholder secrets such as `callback-secret`, `replace-me`, and `postgres`; production environments must override them through managed secrets.

## Verification Results

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | Pass | Exit code 0; Git reported CRLF normalization warnings only |
| `npm run typecheck` | Pass | Backend TypeScript check completed |
| `npm run contracts:check` | Pass | API contract generated types matched the committed output |
| `npm run lint` | Fail | ESLint traversed local `.gitnexus/run.cjs` and failed before source lint because `@typescript-eslint/await-thenable` requires typed parser services for that file |
| `npm run test:unit` | Fail | 26 of 27 test files passed; `src/bootstrap.test.ts` timed out after 5000 ms |
| `npm run test:integration` | Fail | Docker/PostgreSQL migrations ran, but `accounts`, `auth`, and `transfers` integration hooks timed out after 10000 ms |
| `npm run web:typecheck` | Pass | Next.js workspace typecheck completed |
| `npm run web:lint` | Pass | Web workspace lint completed |
| `npm run web:test` | Pass | Web workspace test suite passed |
| `npm run java:test` | Pass | Maven test run passed 3 tests |
| `npm run verify:full` | Fail | Prisma generate and migrate deploy passed; aggregate run stopped at the same `.gitnexus/run.cjs` lint failure |
| Secret-pattern scan | Review | Found existing test/local placeholder values and generated token type names; no production credential was added by this documentation refresh |

The failing commands are recorded as current repository verification blockers. They were not hidden by the documentation refresh.
