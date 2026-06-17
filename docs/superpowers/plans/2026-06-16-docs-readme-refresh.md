# Ledger Documentation And README Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current flat and partly target-state documentation with an HMS-style, source-backed documentation set and a root README that accurately reflects the current `ledger-credit-system` codebase.

**Architecture:** This is a docs-only change. Use GitNexus and direct source reads as the source of truth, keep evidence snapshots under `docs/reference/`, make `docs/README.md` the documentation index, and make root `README.md` the portfolio/onboarding entry point. Preserve auditability by archiving old flat docs after the new canonical docs are written instead of deleting history.

**Tech Stack:** TypeScript, NestJS 11, Fastify, Prisma 6, PostgreSQL 17, Vitest, Next.js workspace, Java 21 Spring Boot skeleton, OpenAPI contracts, GitHub Actions, GitNexus.

---

## Verified Baseline To Use In Every Document

Use these facts unless a fresh command proves they changed:

| Fact | Verified value | Evidence command/source |
|---|---:|---|
| GitNexus alias | `ledger-credit-system` | `npx.cmd gitnexus analyze --index-only --name ledger-credit-system .` |
| GitNexus status | up to date at commit `36fefb7` | `npx.cmd gitnexus status` |
| GitNexus graph | 218 files, 1,200 nodes, 2,921 edges, 58 clusters, 70 flows | `npx.cmd gitnexus list` |
| Backend route methods | 24 Nest controller route methods | `rg -n "^@Controller|@(Get|Post|Put|Patch|Delete)\(" src apps/api-java/src/main/java -g "*.ts" -g "*.java"` |
| GitNexus route map | 26 route nodes including 3 Next.js auth API handlers | `mcp__gitnexus.route_map(repo="ledger-credit-system")` |
| Global API prefix | `/api/v1` | `src/bootstrap.ts` |
| Swagger UI | `/docs` | `src/bootstrap.ts` |
| Prisma models | 21 models, 15 enums | `prisma/schema.prisma` |
| Prisma migrations | 5 migrations | `prisma/migrations/*/migration.sql` |
| Unit/integration spec files | 34 TS test/spec files | `rg --files -g "*.test.ts" -g "*.spec.ts" src tests apps/web/src \| Measure-Object` |
| CI workflows | 1 workflow, 4 jobs: TS backend, contracts, Java API, web | `.github/workflows/ci.yml` |
| Root README | missing before this plan | `Test-Path README.md` returned `False` |
| Docs README | missing before this plan | `Test-Path docs\README.md` returned `False` |
| Current docs entry | `docs/00_index.md` | direct file read |

Do not claim production readiness, live deployment, real bank integration, Prometheus/Grafana observability, or high coverage unless fresh verification proves it.

## File Structure

Create this HMS-style documentation structure:

- Create: `README.md`
- Create: `docs/README.md`
- Modify: `docs/00_index.md`
- Create: `docs/00-overview/project-foundation.md`
- Create: `docs/00-overview/project-context.md`
- Create: `docs/00-overview/documentation-index.md`
- Create: `docs/00-overview/git-workflow.md`
- Create: `docs/00-overview/code-review-checklist.md`
- Create: `docs/01-business/stakeholders.md`
- Create: `docs/01-business/scope.md`
- Create: `docs/01-business/glossary.md`
- Create: `docs/01-business/business-rules.md`
- Create: `docs/02-product/prd.md`
- Create: `docs/02-product/feature-list.md`
- Create: `docs/02-product/release-plan.md`
- Create: `docs/03-requirements/srs.md`
- Create: `docs/03-requirements/permissions-matrix.md`
- Create: `docs/03-requirements/use-cases.md`
- Create: `docs/04-architecture/architecture.md`
- Create: `docs/04-architecture/domain-driven-design.md`
- Create: `docs/04-architecture/security-architecture.md`
- Create: `docs/04-architecture/tech-stack.md`
- Create: `docs/04-architecture/coding-standards.md`
- Create: `docs/04-architecture/service-boundaries.md`
- Create: `docs/04-architecture/adr/ADR-001-modular-monolith.md`
- Create: `docs/04-architecture/adr/ADR-002-append-only-ledger.md`
- Create: `docs/04-architecture/adr/ADR-003-idempotency-keys.md`
- Create: `docs/04-architecture/adr/ADR-004-external-rail-adapters.md`
- Create: `docs/05-api/api-contract.md`
- Create: `docs/06-database/db-schema.md`
- Create: `docs/06-database/migration-guide.md`
- Create: `docs/06-database/seed-data.md`
- Create: `docs/07-flows/end-to-end-business-flow.md`
- Create: `docs/07-flows/state-machine.md`
- Create: `docs/07-flows/business-flow-overview.md`
- Create: `docs/08-ui-ux/README.md`
- Create: `docs/08-ui-ux/role-screens.md`
- Create: `docs/09-testing/test-strategy.md`
- Create: `docs/09-testing/test-plan-full.md`
- Create: `docs/09-testing/business-flow-test-matrix.md`
- Create: `docs/10-deployment/deployment-guide.md`
- Create: `docs/10-deployment/ci-cd.md`
- Create: `docs/10-deployment/docker.md`
- Create: `docs/10-deployment/env-variables.md`
- Create: `docs/11-operations/admin-guide.md`
- Create: `docs/11-operations/runtime-operations.md`
- Create: `docs/11-operations/backup-restore.md`
- Create: `docs/12-handover/developer-onboarding.md`
- Create: `docs/12-handover/handover-document.md`
- Create: `docs/12-handover/known-issues.md`
- Create: `docs/reference/repository-status.md`
- Create: `docs/reference/engineering-metrics.md`
- Create: `docs/reference/gitnexus-codebase-scan.md`
- Create: `docs/reference/api-route-inventory.md`
- Create: `docs/reference/role-api-matrix.md`
- Create: `docs/reference/current-system-flows.md`
- Create: `docs/reference/project-evidence-sheet.md`
- Create: `docs/archive/README.md`
- Create: `docs/archive/legacy-flat-docs/README.md`
- Move after replacement: existing flat docs listed in Task 7.

## Task 1: Freeze Source Evidence

**Files:**
- Create: `docs/reference/repository-status.md`
- Create: `docs/reference/engineering-metrics.md`
- Create: `docs/reference/gitnexus-codebase-scan.md`
- Create: `docs/reference/api-route-inventory.md`

- [ ] **Step 1: Refresh the GitNexus index**

Run:

```powershell
npx.cmd gitnexus analyze --index-only --name ledger-credit-system .
```

Expected: success output with `Repository indexed successfully`, `1,200 nodes`, `2,921 edges`, `58 clusters`, and `70 flows` unless the codebase changed.

- [ ] **Step 2: Capture GitNexus status**

Run:

```powershell
npx.cmd gitnexus status
npx.cmd gitnexus list
```

Expected:

```text
Repository: D:\projects\ledger-credit-system
Status: up-to-date
ledger-credit-system
Stats: 218 files, 1200 symbols, 2921 edges
Processes: 70
```

- [ ] **Step 3: Capture key flow queries**

Run:

```powershell
npx.cmd gitnexus query -r ledger-credit-system -l 10 "money ledger transfer credit assessment batch audit idempotency external rail auth operations"
npx.cmd gitnexus query -r ledger-credit-system -l 10 "NestJS modules controllers services Prisma schema API routes frontend dashboard contracts"
npx.cmd gitnexus context -r ledger-credit-system TransfersService
npx.cmd gitnexus context -r ledger-credit-system CreditService
npx.cmd gitnexus context -r ledger-credit-system LedgerService
npx.cmd gitnexus context -r ledger-credit-system BatchService
npx.cmd gitnexus context -r ledger-credit-system OpsController
```

Expected symbols include:

```text
src/modules/transfers/transfers.service.ts: TransfersService.createTransfer
src/modules/credit/credit.service.ts: CreditService.createAssessment, reviewAssessment
src/modules/ledger/ledger.service.ts: LedgerService.postJournalEntry
src/modules/batch/batch.service.ts: BatchService.runBatch, retryFailedItems
src/modules/ops/ops.controller.ts: OpsController
```

- [ ] **Step 4: Write `docs/reference/repository-status.md`**

Create the file with these sections:

```markdown
# Repository Status

**Status date:** 2026-06-16
**Repository:** `D:\projects\ledger-credit-system`
**Git commit used for scan:** `36fefb7`
**Documentation status:** Source-backed refresh in progress

## GitNexus Index

| Metric | Value |
|---|---:|
| Files | 218 |
| Symbols/nodes | 1,200 |
| Edges | 2,921 |
| Clusters | 58 |
| Execution flows | 70 |

## Current Source Shape

| Area | Current status |
|---|---|
| TypeScript backend | Implemented under `src/` with NestJS, Fastify, Prisma, auth, audit, ledger, transfer, credit, batch, ops, and health modules |
| PostgreSQL schema | Implemented through Prisma schema and 5 migrations |
| Web workspace | Minimal Next.js customer-facing workspace under `apps/web` |
| Java API workspace | Skeleton Spring Boot service under `apps/api-java` with health endpoint and CI job |
| API contracts | OpenAPI workspace under `packages/api-contracts` |
| CI | One GitHub Actions workflow with backend, contracts, Java API, and web jobs |
| Root README | Added by this refresh |
| Docs README | Added by this refresh |

## Known Limits

- No live production deployment evidence is present in this repository.
- External bank integration is represented by simulator and mock-bank adapters only.
- Observability is currently structured logging plus correlation IDs; do not document Prometheus/Grafana as implemented unless code is added later.
- The root `Dockerfile` uses Node 20 while CI uses Node 22; document this as a compatibility note rather than silently hiding it.
```

- [ ] **Step 5: Write `docs/reference/engineering-metrics.md`**

Create a concise metrics table:

```markdown
# Engineering Metrics

**Measured on:** 2026-06-16

| Metric | Value | Evidence |
|---|---:|---|
| GitNexus files | 218 | `npx.cmd gitnexus list` |
| GitNexus nodes | 1,200 | `npx.cmd gitnexus list` |
| GitNexus edges | 2,921 | `npx.cmd gitnexus list` |
| GitNexus flows | 70 | `npx.cmd gitnexus list` |
| Nest controller route methods | 24 | `rg "^@Controller|@(Get|Post|Put|Patch|Delete)\(" src ...` |
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
rg -n "^@Controller|@(Get|Post|Put|Patch|Delete)\(" src apps/api-java/src/main/java -g "*.ts" -g "*.java"
rg --files -g "*.test.ts" -g "*.spec.ts" src tests apps/web/src
```
```

- [ ] **Step 6: Write `docs/reference/gitnexus-codebase-scan.md`**

Create a source-backed scan with these required sections:

```markdown
# GitNexus Codebase Scan

**Scan date:** 2026-06-16
**Repository alias:** `ledger-credit-system`
**Indexed commit:** `36fefb7`

## Graph Summary

| Metric | Value |
|---|---:|
| Files | 218 |
| Nodes | 1,200 |
| Edges | 2,921 |
| Clusters | 58 |
| Flows | 70 |

## Main Execution Flows

| Flow | Primary source |
|---|---|
| Transfer creation | `src/modules/transfers/transfers.service.ts` |
| External rail event ingestion | `src/modules/transfers/external-rail.service.ts` |
| Credit assessment creation and review | `src/modules/credit/credit.service.ts` |
| Double-entry ledger posting | `src/modules/ledger/ledger.service.ts` |
| End-of-day batch close | `src/modules/batch/batch.service.ts` |
| Audit event search | `src/modules/ops/ops.controller.ts` and `src/modules/audit/audit.service.ts` |
| Authentication and admin provisioning | `src/common/auth/*`, `src/modules/auth/*` |

## Documentation Rule

Repository source reality is the tie-breaker. If this file and code disagree, rerun GitNexus and update the docs from code.
```

- [ ] **Step 7: Write `docs/reference/api-route-inventory.md`**

List all route groups from direct source and note the global prefix:

```markdown
# API Route Inventory

**Global prefix:** `/api/v1`
**Swagger UI:** `/docs`

| Group | Routes | Source |
|---|---|---|
| Health | `GET /api/v1/health/live`, `GET /api/v1/health/ready` | `src/modules/health/health.controller.ts` |
| Auth | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/admin/principals`, `POST /api/v1/auth/admin/role-bindings`, `POST /api/v1/auth/admin/external-identities` | `src/modules/auth/auth.controller.ts` |
| Accounts | `GET /api/v1/accounts/:accountId/balance`, `GET /api/v1/accounts/:accountId/ledger-entries` | `src/modules/accounts/accounts.controller.ts` |
| Transfers | `POST /api/v1/transfers`, `GET /api/v1/transfers/:transferRequestId` | `src/modules/transfers/transfers.controller.ts` |
| External rails | `POST /api/v1/integrations/external-rails/:provider/events` | `src/modules/transfers/external-rail.controller.ts` |
| Credit | `POST /api/v1/credit-assessments`, `GET /api/v1/credit-assessments/:creditAssessmentId` | `src/modules/credit/credit.controller.ts` |
| Batch | `GET /api/v1/batch-runs/:batchRunId` | `src/modules/batch/batch.controller.ts` |
| Ops | `GET /api/v1/ops/transfers/:transferRequestId`, `GET /api/v1/ops/transfers/:transferRequestId/external-events`, `GET /api/v1/ops/audit-events`, `POST /api/v1/ops/batch-runs/:batchRunId/retry`, `POST /api/v1/ops/transfers/:transferRequestId/redrive`, `POST /api/v1/ops/transfers/:transferRequestId/reconcile`, `POST /api/v1/ops/credit-assessments/:creditAssessmentId/approve`, `POST /api/v1/ops/credit-assessments/:creditAssessmentId/reject` | `src/modules/ops/ops.controller.ts` |
| Web auth proxy | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session` | `apps/web/src/app/api/auth/*/route.ts` |
```

- [ ] **Step 8: Commit evidence snapshots**

Run:

```powershell
git add docs/reference/repository-status.md docs/reference/engineering-metrics.md docs/reference/gitnexus-codebase-scan.md docs/reference/api-route-inventory.md
git commit -m "docs: add source evidence snapshots"
```

Expected: one docs-only commit.

## Task 2: Create The Documentation Index And Taxonomy

**Files:**
- Create: `docs/README.md`
- Create: `docs/00-overview/documentation-index.md`
- Modify: `docs/00_index.md`

- [ ] **Step 1: Create documentation directories**

Run:

```powershell
$dirs = @(
  'docs/00-overview','docs/01-business','docs/02-product','docs/03-requirements',
  'docs/04-architecture/adr','docs/05-api','docs/06-database','docs/07-flows',
  'docs/08-ui-ux','docs/09-testing','docs/10-deployment','docs/11-operations',
  'docs/12-handover','docs/reference','docs/archive/legacy-flat-docs'
)
foreach ($dir in $dirs) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
```

Expected: all directories exist.

- [ ] **Step 2: Write `docs/README.md`**

Use the HMS style: status line, quick access table, numbered hierarchy, canonical rules, maintenance rules. Required opening:

```markdown
# Ledger Credit System - Documentation Index

**Status:** Documentation aligned with repository source - 2026-06-16
**Release:** Development documentation refresh, not a production-readiness claim
**Structure:** HMS-style 14-category document hierarchy, adapted for a TypeScript finance backend

Referenced by: root `README.md`, `AGENTS.md`, and all documentation consumers.

## Quick Access

| Resource | Link |
|---|---|
| Project README | [`../README.md`](../README.md) |
| Source Evidence | [`reference/repository-status.md`](reference/repository-status.md) |
| GitNexus Scan | [`reference/gitnexus-codebase-scan.md`](reference/gitnexus-codebase-scan.md) |
| API Contract | [`05-api/api-contract.md`](05-api/api-contract.md) |
| Architecture | [`04-architecture/architecture.md`](04-architecture/architecture.md) |
| Database Schema | [`06-database/db-schema.md`](06-database/db-schema.md) |
| Test Strategy | [`09-testing/test-strategy.md`](09-testing/test-strategy.md) |

---
```

Then add one section per numbered folder matching the file structure in this plan.

- [ ] **Step 3: Write `docs/00-overview/documentation-index.md`**

Create a fuller inventory with columns `Area`, `Document`, `Purpose`, `Evidence basis`, and `Maintenance trigger`. Every file created by this plan must appear exactly once.

- [ ] **Step 4: Replace `docs/00_index.md` with compatibility content**

Replace old content with:

```markdown
# Documentation Index Compatibility Entry

The canonical documentation index has moved to [`docs/README.md`](README.md).

Use this file only as a compatibility entry for older references. The new documentation set follows the HMS-style numbered hierarchy:

- `00-overview`
- `01-business`
- `02-product`
- `03-requirements`
- `04-architecture`
- `05-api`
- `06-database`
- `07-flows`
- `08-ui-ux`
- `09-testing`
- `10-deployment`
- `11-operations`
- `12-handover`
- `reference`
- `archive`

Source truth rule: if documentation and source code disagree, rerun GitNexus and update the documentation from current source.
```

- [ ] **Step 5: Commit the docs index**

Run:

```powershell
git add docs/README.md docs/00-overview/documentation-index.md docs/00_index.md
git commit -m "docs: establish documentation index"
```

Expected: one docs-only commit.

## Task 3: Write Overview, Business, Product, And Requirements Docs

**Files:**
- Create: `docs/00-overview/project-foundation.md`
- Create: `docs/00-overview/project-context.md`
- Create: `docs/00-overview/git-workflow.md`
- Create: `docs/00-overview/code-review-checklist.md`
- Create: `docs/01-business/stakeholders.md`
- Create: `docs/01-business/scope.md`
- Create: `docs/01-business/glossary.md`
- Create: `docs/01-business/business-rules.md`
- Create: `docs/02-product/prd.md`
- Create: `docs/02-product/feature-list.md`
- Create: `docs/02-product/release-plan.md`
- Create: `docs/03-requirements/srs.md`
- Create: `docs/03-requirements/permissions-matrix.md`
- Create: `docs/03-requirements/use-cases.md`

- [ ] **Step 1: Write `project-foundation.md`**

Mirror the HMS `project-foundation.md` style with tables. Required sections:

```markdown
# Project Foundation - Ledger Credit System

## 1. Overview
## 2. Source-Verified Repository Metrics
## 3. Technical Stack
## 4. System Architecture
## 5. Database
## 6. Security And Compliance
## 7. API
## 8. Testing
## 9. Current Status And Limits
```

Include the verified baseline table from this plan. State that this is a finance-domain backend, not a healthcare ERP.

- [ ] **Step 2: Write `project-context.md`**

Required narrative:

```markdown
# Project Context

The system exists to demonstrate auditable finance backend patterns: exact money arithmetic, append-only ledger postings, idempotent transfer submission, credit-decision traceability, and retry-safe operational workflows.
```

Include problem statement, stakeholders, implementation scope, and current limits.

- [ ] **Step 3: Write workflow docs**

Create:

- `docs/00-overview/git-workflow.md`: branch, commit, PR, verification expectations. Mention docs-only commits and `git diff --check`.
- `docs/00-overview/code-review-checklist.md`: finance-specific review checklist for money, idempotency, audit, validation, auth, API contracts, Prisma migrations, and tests.

- [ ] **Step 4: Write business docs**

Create these files with source-backed content:

- `docs/01-business/stakeholders.md`: customers, operators, analysts, auditors, admins, external rail providers, API clients.
- `docs/01-business/scope.md`: in scope includes internal transfers, interbank simulator/mock-bank transfers, credit assessment, batch close, auth/admin provisioning, audit search. Out of scope includes real bank production settlement and live regulatory certification.
- `docs/01-business/glossary.md`: define `Money`, `minorUnits`, `JournalEntry`, `Posting`, `LedgerAccount`, `TransferRequest`, `IdempotencyRecord`, `CreditProfileSnapshot`, `CreditAssessment`, `BatchRun`, `ExternalTransferEvent`, `AuditEvent`.
- `docs/01-business/business-rules.md`: money rules, ledger rules, transfer rules, credit rules, batch rules, validation rules, audit/security rules.

- [ ] **Step 5: Write product docs**

Create:

- `docs/02-product/prd.md`: product goals, users, non-goals, success measures, current implemented capabilities, limits.
- `docs/02-product/feature-list.md`: feature IDs `F-001` through `F-020`, covering auth, accounts, transfers, external rails, ledger, credit, batch, ops, docs, CI.
- `docs/02-product/release-plan.md`: current status is development/docs refresh; no production-ready label.

- [ ] **Step 6: Write requirements docs**

Create:

- `docs/03-requirements/srs.md`: functional and non-functional requirements grounded in source.
- `docs/03-requirements/permissions-matrix.md`: roles `CUSTOMER`, `OPS`, `ANALYST`, `AUDITOR`, `ADMIN`, `SYSTEM`, `API_CLIENT` mapped to route groups.
- `docs/03-requirements/use-cases.md`: use cases for login, create transfer, inspect transfer, ingest external event, create/review credit assessment, run/retry batch, search audit events.

- [ ] **Step 7: Commit foundation docs**

Run:

```powershell
git add docs/00-overview docs/01-business docs/02-product docs/03-requirements
git commit -m "docs: add project foundation and requirements"
```

Expected: one docs-only commit.

## Task 4: Write Architecture, API, And Database Docs

**Files:**
- Create: `docs/04-architecture/architecture.md`
- Create: `docs/04-architecture/domain-driven-design.md`
- Create: `docs/04-architecture/security-architecture.md`
- Create: `docs/04-architecture/tech-stack.md`
- Create: `docs/04-architecture/coding-standards.md`
- Create: `docs/04-architecture/service-boundaries.md`
- Create: `docs/04-architecture/adr/ADR-001-modular-monolith.md`
- Create: `docs/04-architecture/adr/ADR-002-append-only-ledger.md`
- Create: `docs/04-architecture/adr/ADR-003-idempotency-keys.md`
- Create: `docs/04-architecture/adr/ADR-004-external-rail-adapters.md`
- Create: `docs/05-api/api-contract.md`
- Create: `docs/06-database/db-schema.md`
- Create: `docs/06-database/migration-guide.md`
- Create: `docs/06-database/seed-data.md`

- [ ] **Step 1: Write architecture overview**

`docs/04-architecture/architecture.md` must include:

```markdown
# Architecture

## 1. Architecture Style
## 2. Runtime Surface
## 3. Module Map
## 4. Request Lifecycle
## 5. Money Movement Lifecycle
## 6. Credit Decision Lifecycle
## 7. Batch Lifecycle
## 8. Cross-Cutting Concerns
## 9. Known Architecture Limits
```

Use these source anchors:

- `src/app.module.ts`
- `src/bootstrap.ts`
- `src/common/money/money.ts`
- `src/common/idempotency/idempotency.service.ts`
- `src/modules/ledger/ledger.service.ts`
- `src/modules/transfers/transfers.service.ts`
- `src/modules/transfers/external-rail.service.ts`
- `src/modules/credit/credit.service.ts`
- `src/modules/batch/batch.service.ts`
- `src/modules/audit/audit.service.ts`

- [ ] **Step 2: Write DDD and service boundaries docs**

`domain-driven-design.md` must describe bounded areas: auth, accounts, ledger, transfers, external rails, credit, batch, ops, audit, health, web, contracts, Java skeleton.

`service-boundaries.md` must explicitly state this is a modular monolith today and not microservices.

- [ ] **Step 3: Write security architecture**

Use `src/common/auth/*`, `src/modules/auth/*`, `src/bootstrap.ts`, `src/app.module.ts`, and `.env.example`. Include:

- JWT/internal auth services
- OIDC verifier support
- password hashing
- refresh token rotation
- roles guard
- rate limiting
- helmet
- CORS current config `origin: true`
- pino redaction paths
- callback secret for external rails

Mark `origin: true` as a local/default permissive posture that needs environment hardening before production.

- [ ] **Step 4: Write tech stack and coding standards**

`tech-stack.md` must list package versions from `package.json`, CI Node 22, Dockerfile Node 20, PostgreSQL 17, Prisma 6, NestJS 11, Vitest 3, Next.js workspace, Java 21 Spring Boot skeleton.

`coding-standards.md` must preserve project rules from `AGENTS.md`: no floating point for money, exact amount assertions, explicit idempotency keys, append-only ledger/audit, schema validation at boundaries, no hardcoded secrets.

- [ ] **Step 5: Write ADRs**

Create four short ADRs with Status `Accepted`:

- `ADR-001-modular-monolith.md`: one deployable TypeScript backend with modules.
- `ADR-002-append-only-ledger.md`: money movement through journal entries and postings.
- `ADR-003-idempotency-keys.md`: externally triggered writes require durable idempotency.
- `ADR-004-external-rail-adapters.md`: simulator/mock-bank providers behind adapter boundary.

- [ ] **Step 6: Write API contract**

`docs/05-api/api-contract.md` must include all routes from `docs/reference/api-route-inventory.md`, request headers, envelopes, error shape, auth/role requirements, idempotency requirements, and source file path per route group.

- [ ] **Step 7: Write database docs**

`db-schema.md` must document all 21 Prisma models and their relationships.

`migration-guide.md` must list the five migrations:

```text
20260315095314_init
20260315100000_finance_guards
20260315154256_auth_domain
20260316143000_target_state_completion
20260316170000_credit_status_under_review_backfill
```

`seed-data.md` must describe `prisma/seed.ts` and `prisma/seed-data.ts`; do not include passwords unless they are already intentionally demo-only and present in source.

- [ ] **Step 8: Commit architecture/API/database docs**

Run:

```powershell
git add docs/04-architecture docs/05-api docs/06-database
git commit -m "docs: document architecture api and database"
```

Expected: one docs-only commit.

## Task 5: Write Flows, UI, Testing, Deployment, Operations, And Handover Docs

**Files:**
- Create: `docs/07-flows/end-to-end-business-flow.md`
- Create: `docs/07-flows/state-machine.md`
- Create: `docs/07-flows/business-flow-overview.md`
- Create: `docs/08-ui-ux/README.md`
- Create: `docs/08-ui-ux/role-screens.md`
- Create: `docs/09-testing/test-strategy.md`
- Create: `docs/09-testing/test-plan-full.md`
- Create: `docs/09-testing/business-flow-test-matrix.md`
- Create: `docs/10-deployment/deployment-guide.md`
- Create: `docs/10-deployment/ci-cd.md`
- Create: `docs/10-deployment/docker.md`
- Create: `docs/10-deployment/env-variables.md`
- Create: `docs/11-operations/admin-guide.md`
- Create: `docs/11-operations/runtime-operations.md`
- Create: `docs/11-operations/backup-restore.md`
- Create: `docs/12-handover/developer-onboarding.md`
- Create: `docs/12-handover/handover-document.md`
- Create: `docs/12-handover/known-issues.md`
- Create: `docs/reference/role-api-matrix.md`
- Create: `docs/reference/current-system-flows.md`
- Create: `docs/reference/project-evidence-sheet.md`

- [ ] **Step 1: Write flow docs**

Document these flows with Mermaid diagrams and state tables:

- internal transfer
- external transfer with simulator/mock-bank rail
- provider callback ingestion
- transfer redrive/reconcile
- credit assessment submission and manual review
- end-of-day interest close batch
- audit search
- admin auth provisioning

State machines must match Prisma enums:

- `TransferStatus`
- `CreditAssessmentStatus`
- `BatchRunStatus`
- `BatchRunItemStatus`
- `AuthSessionStatus`

- [ ] **Step 2: Write UI docs**

`docs/08-ui-ux/README.md` must state the web workspace is present but intentionally minimal.

`docs/08-ui-ux/role-screens.md` must map current pages:

```text
apps/web/src/app/page.tsx
apps/web/src/app/(auth)/login/page.tsx
apps/web/src/app/(customer)/dashboard/page.tsx
apps/web/src/app/(customer)/transfers/new/page.tsx
apps/web/src/app/(customer)/transfers/[transferId]/page.tsx
apps/web/src/app/(customer)/credit-assessments/new/page.tsx
apps/web/src/app/(customer)/credit-assessments/[creditAssessmentId]/page.tsx
```

- [ ] **Step 3: Write testing docs**

`test-strategy.md` must list:

- Vitest unit tests in `src`
- integration tests in `tests/integration`
- web tests in `apps/web/src`
- Java tests via `npm run java:test`
- contract checks via `npm run contracts:check`
- full verification via `npm run verify:full`

`test-plan-full.md` must include exact commands from `package.json`.

`business-flow-test-matrix.md` must map each business flow to unit/integration/spec evidence and mark missing proof as `MISSING`, not implied.

- [ ] **Step 4: Write deployment docs**

Document:

- local PostgreSQL via `docker-compose.yml`
- backend Dockerfile and Node 20 runner
- CI Node 22
- `.env.example` variables
- Swagger at `/docs`
- health at `/api/v1/health/live` and `/api/v1/health/ready`
- no CD workflow currently present

- [ ] **Step 5: Write operations and handover docs**

Create:

- `admin-guide.md`: operator/admin routes and responsibilities
- `runtime-operations.md`: startup, probes, logs, batch, rail events, audit search
- `backup-restore.md`: PostgreSQL backup/restore guidance; do not claim scripts exist unless source has them
- `developer-onboarding.md`: Node 22, npm, Docker, Prisma, test commands
- `handover-document.md`: current system state, code anchors, doc map, risks
- `known-issues.md`: root README was missing before refresh; docs were flat; Dockerfile/CI Node version mismatch; real rail integration not present; no production deployment evidence

- [ ] **Step 6: Write reference matrices**

Create:

- `role-api-matrix.md`: roles against route groups
- `current-system-flows.md`: source-backed flow summary
- `project-evidence-sheet.md`: table with columns `Claim`, `Status`, `Evidence`, `Caveat`; statuses must be `VERIFIED`, `INFERRED`, `MISSING`, or `CONTRADICTED`

- [ ] **Step 7: Commit flow and operations docs**

Run:

```powershell
git add docs/07-flows docs/08-ui-ux docs/09-testing docs/10-deployment docs/11-operations docs/12-handover docs/reference/role-api-matrix.md docs/reference/current-system-flows.md docs/reference/project-evidence-sheet.md
git commit -m "docs: add flows testing deployment and handover"
```

Expected: one docs-only commit.

## Task 6: Write The Root README In HMS Style

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README heading and badges**

Use HMS-style badges, but make them truthful:

```markdown
# Ledger Credit System

[![Node.js 22](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![NestJS 11](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma 6](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)

**A TypeScript finance backend** demonstrating append-only double-entry ledger posting, idempotent transfer orchestration, manual credit review, external rail simulation, and batch close processing.

> **Development Status: Source-backed documentation refresh - June 16, 2026**
> Current code includes NestJS backend modules, Prisma schema and migrations, minimal Next.js workspace, OpenAPI contract workspace, Java API skeleton, and CI verification. This is not a production-readiness claim.
>
> **Documentation:** [`docs/README.md`](docs/README.md) | **API Contract:** [`docs/05-api/api-contract.md`](docs/05-api/api-contract.md) | **Source Status:** [`docs/reference/repository-status.md`](docs/reference/repository-status.md)
```

- [ ] **Step 2: Add README sections**

The README must include these sections in this order:

```markdown
## Why This Project Exists
## Key Architecture Decisions
## System Architecture Overview
## End-To-End Finance Workflow
## Key Features And Business Value
## Verified Project Metrics
## Modular Backend Architecture
## Quick Start
## Testing And Quality
## CI And Operations
## Documentation
## Security And Auditability
```

- [ ] **Step 3: Add quick start commands**

Include exact commands:

```powershell
npm ci
docker compose up -d postgres
Copy-Item .env.example .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run start:dev
```

Health checks:

```text
http://localhost:3000/api/v1/health/live
http://localhost:3000/api/v1/health/ready
http://localhost:3000/docs
```

- [ ] **Step 4: Add verification commands**

Include:

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run contracts:check
npm run web:typecheck
npm run web:lint
npm run web:test
npm run java:test
npm run verify:full
```

State clearly that `verify:full` may require Docker because it bootstraps PostgreSQL.

- [ ] **Step 5: Commit README**

Run:

```powershell
git add README.md
git commit -m "docs: add project readme"
```

Expected: one docs-only commit.

## Task 7: Archive Legacy Flat Docs And Repair Links

**Files:**
- Create: `docs/archive/README.md`
- Create: `docs/archive/legacy-flat-docs/README.md`
- Move: `docs/actors.md`
- Move: `docs/api-contract.md`
- Move: `docs/automation-tasks.md`
- Move: `docs/backup-restore.md`
- Move: `docs/business-rules.md`
- Move: `docs/configuration-rules.md`
- Move: `docs/core-business-flows.md`
- Move: `docs/data-model.md`
- Move: `docs/deployment-environment.md`
- Move: `docs/disaster-recovery.md`
- Move: `docs/non-functional-requirements.md`
- Move: `docs/project-overview.md`
- Move: `docs/release-checklist.md`
- Move: `docs/retrieval-guide.md`
- Move: `docs/runtime-operations.md`
- Move: `docs/state-machine.md`
- Move: `docs/system-map.md`
- Move: `docs/system-modules.md`
- Move: `docs/ui-roles.md`

- [ ] **Step 1: Create archive index files**

`docs/archive/README.md`:

```markdown
# Documentation Archive

This folder preserves superseded documentation. Archived files are retained for auditability and historical context; canonical current documentation lives in the numbered `docs/` hierarchy.
```

`docs/archive/legacy-flat-docs/README.md`:

```markdown
# Legacy Flat Documentation

These files were the pre-refresh flat documentation set. They were archived after the HMS-style documentation hierarchy was created on 2026-06-16.

Use [`../../README.md`](../../README.md) for current documentation.
```

- [ ] **Step 2: Move legacy flat docs**

Run:

```powershell
$legacyDocs = @(
  'actors.md','api-contract.md','automation-tasks.md','backup-restore.md','business-rules.md',
  'configuration-rules.md','core-business-flows.md','data-model.md','deployment-environment.md',
  'disaster-recovery.md','non-functional-requirements.md','project-overview.md','release-checklist.md',
  'retrieval-guide.md','runtime-operations.md','state-machine.md','system-map.md','system-modules.md','ui-roles.md'
)
foreach ($file in $legacyDocs) {
  Move-Item -LiteralPath "docs\$file" -Destination "docs\archive\legacy-flat-docs\$file"
}
```

Expected: those files no longer exist at `docs\*.md` except `docs\README.md`, `docs\00_index.md`, `docs\AGENTS.md`, and generated/new docs.

- [ ] **Step 3: Repair internal links**

Run:

```powershell
rg -n "docs/(actors|api-contract|automation-tasks|backup-restore|business-rules|configuration-rules|core-business-flows|data-model|deployment-environment|disaster-recovery|non-functional-requirements|project-overview|release-checklist|retrieval-guide|runtime-operations|state-machine|system-map|system-modules|ui-roles)\.md|]\((actors|api-contract|automation-tasks|backup-restore|business-rules|configuration-rules|core-business-flows|data-model|deployment-environment|disaster-recovery|non-functional-requirements|project-overview|release-checklist|retrieval-guide|runtime-operations|state-machine|system-map|system-modules|ui-roles)\.md\)" docs README.md
```

Expected: no results except archive index references.

- [ ] **Step 4: Commit archive cleanup**

Run:

```powershell
git add docs README.md
git commit -m "docs: archive legacy flat documentation"
```

Expected: one docs-only commit.

## Task 8: Verification And Final Review

**Files:**
- Verify: all docs and README files touched above

- [ ] **Step 1: Run documentation sanity scans**

Run:

```powershell
rg -n "Hospital Management|HMS|healthcare ERP|PHI|Spring Boot 3\.3|Java 17|PostgreSQL 15|118 endpoint|35 table|800\+|Production Ready|Release Candidate" README.md docs
```

Expected: no results, except references inside this plan if the plan is still present in `docs/superpowers/plans/`.

- [ ] **Step 2: Run source-truth contradiction scans**

Run:

```powershell
rg -n "production-ready|Production Ready|real bank|Prometheus|Grafana|Kubernetes|microservices|CD workflow|VPS deploy|coverage 80|800 tests" README.md docs
```

Expected: no unsupported claims. If any term remains, it must be in a caveat or known-limit section.

- [ ] **Step 3: Run lightweight checks**

Run:

```powershell
git diff --check
npm run lint
npm run typecheck
npm run contracts:check
```

Expected: all pass. If a command is not configured, record the exact failure in `docs/reference/repository-status.md`.

- [ ] **Step 4: Run broader checks when environment supports them**

Run:

```powershell
npm run test:unit
npm run test:integration
npm run web:typecheck
npm run web:lint
npm run web:test
npm run java:test
npm run verify:full
```

Expected: all pass when Docker, Node, npm, Java, Maven, and PostgreSQL are available. If Docker or Java blocks a check, document the blocker exactly in `docs/reference/repository-status.md`.

- [ ] **Step 5: Confirm GitNexus remains current**

Run:

```powershell
npx.cmd gitnexus status
```

Expected:

```text
Status: up-to-date
```

- [ ] **Step 6: Final commit if verification docs changed**

If verification outcomes changed `docs/reference/repository-status.md`, run:

```powershell
git add docs/reference/repository-status.md
git commit -m "docs: record documentation verification"
```

Expected: one final docs-only commit, only if needed.

## Self-Review Checklist

- [ ] Spec coverage: plan uses GitNexus, references HMS docs/README style, refreshes docs from current source truth, creates root README, and preserves current status caveats.
- [ ] Placeholder scan: no doc should contain filler markers, deferred-work wording, or unsupported "Production Ready" language.
- [ ] Type/name consistency: route paths, Prisma model names, roles, and script names match current source.
- [ ] Auditability: old docs are archived after replacement; no historical docs are silently deleted.
- [ ] Verification: every strong claim has a source command or source path.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-16-docs-readme-refresh.md`. Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
