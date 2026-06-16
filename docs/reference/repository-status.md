# Repository Status

**Status date:** 2026-06-16
**Repository:** `D:\projects\ledger-credit-system`
**Git commit used for scan:** `36fefb7`
**Documentation status:** Source-backed refresh in progress

**Scan scope note:** GitNexus was run against source baseline commit `36fefb7`; documentation-only commits after that can make the current GitNexus status stale until rerun.

## GitNexus Index

| Metric | Value |
|---|---:|
| Files | 219 |
| Symbols/nodes | 1,273 |
| Edges | 3,026 |
| Clusters | 58 |
| Execution flows | 78 |

## Current Source Shape

| Area | Current status |
|---|---|
| TypeScript backend | Implemented under `src/` with NestJS, Fastify, Prisma, auth, audit, ledger, transfer, credit, batch, ops, and health modules |
| PostgreSQL schema | Implemented through Prisma schema and 5 migrations |
| Web workspace | Minimal Next.js customer-facing workspace under `apps/web` |
| Java API workspace | Skeleton Spring Boot service under `apps/api-java` with health endpoint and CI job |
| API contracts | OpenAPI workspace under `packages/api-contracts` |
| CI | One GitHub Actions workflow with backend, contracts, Java API, and web jobs |
| Root README | Not present in the current tree |
| Docs README | Not present in the current tree |

## Known Limits

- No live production deployment evidence is present in this repository.
- External bank integration is represented by simulator and mock-bank adapters only.
- Observability is currently structured logging plus correlation IDs; do not document Prometheus/Grafana as implemented unless code is added later.
- The root `Dockerfile` uses Node 20 while CI uses Node 22; document this as a compatibility note rather than silently hiding it.
