# Project Foundation - Ledger Credit System

## 1. Overview

Ledger Credit System is a TypeScript finance-domain backend. It demonstrates exact money handling, append-only double-entry ledger posting, idempotent transfer submission, manual credit assessment review, external rail simulation, and end-of-day batch close processing.

This repository is not a hospital-domain ERP. The documentation style is borrowed from a numbered project-documentation taxonomy, but the content is specific to this finance backend and its current source state.

## 2. Source-Verified Repository Metrics

| Fact | Verified value | Evidence |
|---|---:|---|
| GitNexus alias | `ledger-credit-system` | `npx.cmd gitnexus analyze --index-only --name ledger-credit-system .` |
| GitNexus graph | 277 files, 1,580 nodes, 3,480 edges, 58 clusters, 95 flows | `docs/reference/engineering-metrics.md` |
| Nest controller route methods | 24 | `rg -n "@(Get|Post|Put|Patch|Delete)\(" src -g "*.ts"` |
| GitNexus route nodes | 26 | GitNexus route map |
| Global API prefix | `/api/v1` | `src/bootstrap.ts` |
| Swagger UI | `/docs` | `src/bootstrap.ts` |
| Prisma models | 21 | `prisma/schema.prisma` |
| Prisma enums | 15 | `prisma/schema.prisma` |
| Prisma migrations | 5 | `prisma/migrations/*/migration.sql` |
| TS test/spec files | 34 | `rg --files -g "*.test.ts" -g "*.spec.ts"` |
| CI workflow/jobs | 1 workflow, 4 jobs | `.github/workflows/ci.yml` |

## 3. Technical Stack

| Layer | Current source-backed stack |
|---|---|
| Backend runtime | Node.js, TypeScript 5.8, NestJS 11, Fastify |
| Persistence | PostgreSQL 17 for local/CI services, Prisma 6 schema and migrations |
| Contracts | OpenAPI contract workspace under `packages/api-contracts` |
| Web | Minimal Next.js workspace under `apps/web` |
| Java workspace | Spring Boot skeleton under `apps/api-java` with health endpoints and CI test job |
| Testing | Vitest, integration tests, web workspace tests, Maven tests, contract checks |
| CI | GitHub Actions on Node 22 and Java 21 |
| Container runtime | Dockerfile uses Node 20 runner; document as a compatibility note |

## 4. System Architecture

The backend is a modular monolith composed through `src/app.module.ts`. Runtime bootstrap in `src/bootstrap.ts` registers Fastify middleware, global API prefix, request correlation IDs, Swagger, exception handling, security headers, rate limiting, and CORS.

| Area | Source anchor |
|---|---|
| Auth and roles | `src/common/auth/*`, `src/modules/auth/*` |
| Accounts and balance read model | `src/modules/accounts/*`, `src/modules/ledger/*` |
| Ledger posting | `src/modules/ledger/ledger.service.ts` |
| Transfers and external rails | `src/modules/transfers/*` |
| Credit assessment | `src/modules/credit/*` |
| Batch close | `src/modules/batch/*` |
| Audit | `src/modules/audit/*`, `src/modules/ops/ops.controller.ts` |

## 5. Database

The Prisma schema contains 21 models and 15 enums. Core persistence centers on `Customer`, `Account`, `LedgerAccount`, `JournalEntry`, `Posting`, `TransferRequest`, `IdempotencyRecord`, auth/session models, credit models, batch models, audit events, external transfer events, and account projections.

## 6. Security And Compliance

Security-relevant source includes JWT/internal auth services, refresh token rotation, password credential hashing, roles guard, OIDC verifier support, callback secret configuration for rail events, pino redaction paths, helmet, rate limiting, and CORS. Current CORS defaults are permissive (`origin: true`) and need environment hardening before any production deployment.

## 7. API

The Nest/Fastify API uses global prefix `/api/v1`. Swagger is served at `/docs`. Current route groups are health, auth, accounts, transfers, external rails, credit assessments, batch runs, and ops.

## 8. Testing

`package.json` defines lint, typecheck, unit tests, integration tests, contract checks, web checks, Java tests, and `verify:full`. `verify:full` bootstraps PostgreSQL and runs a broad local verification sequence.

## 9. Current Status And Limits

| Item | Current status |
|---|---|
| Documentation | Source-backed refresh in progress |
| Production deployment evidence | Missing from repository |
| External rail settlement | Simulator/mock-bank adapters only |
| Observability | Structured logging and correlation IDs; no implemented metrics dashboard stack documented |
| Runtime versions | CI uses Node 22; Dockerfile uses Node 20 |
| Web workspace | Present and intentionally minimal |
