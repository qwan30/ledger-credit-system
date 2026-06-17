# Ledger Credit System - Documentation Index

**Status:** Documentation aligned with repository source - 2026-06-17
**Release:** Development documentation refresh, not a production-readiness claim
**Structure:** Reference-style 14-category document hierarchy, adapted for a TypeScript finance backend

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

## 1. Documentation Structure

### 00-overview - Foundation And Process

| Document | Description |
|---|---|
| [`project-foundation.md`](00-overview/project-foundation.md) | Source-verified project foundation and current system status |
| [`project-context.md`](00-overview/project-context.md) | Problem statement, stakeholders, implementation scope, and limits |
| [`documentation-index.md`](00-overview/documentation-index.md) | Full document inventory, evidence basis, and maintenance triggers |
| [`git-workflow.md`](00-overview/git-workflow.md) | Branch, commit, PR, and verification expectations |
| [`code-review-checklist.md`](00-overview/code-review-checklist.md) | Finance-specific review checklist |

### 01-business - Business Requirements

| Document | Description |
|---|---|
| [`stakeholders.md`](01-business/stakeholders.md) | Role definitions for customers, operators, analysts, auditors, admins, external rails, and API clients |
| [`scope.md`](01-business/scope.md) | In-scope and out-of-scope boundaries |
| [`glossary.md`](01-business/glossary.md) | Ubiquitous language for ledger, transfer, credit, batch, and audit terms |
| [`business-rules.md`](01-business/business-rules.md) | Money, ledger, transfer, credit, batch, validation, audit, and security rules |

### 02-product - Product Management

| Document | Description |
|---|---|
| [`prd.md`](02-product/prd.md) | Product requirements document for the source-backed finance backend |
| [`feature-list.md`](02-product/feature-list.md) | Feature inventory F-001 through F-020 |
| [`release-plan.md`](02-product/release-plan.md) | Development release plan and current caveats |

### 03-requirements - System Requirements

| Document | Description |
|---|---|
| [`srs.md`](03-requirements/srs.md) | Functional and non-functional requirements grounded in source |
| [`permissions-matrix.md`](03-requirements/permissions-matrix.md) | Roles mapped to route groups and expected access |
| [`use-cases.md`](03-requirements/use-cases.md) | Main use cases for auth, transfers, rails, credit, batch, and audit |

### 04-architecture - Architecture And Design

| Document | Description |
|---|---|
| [`architecture.md`](04-architecture/architecture.md) | Runtime, module, request, money movement, credit, and batch architecture |
| [`domain-driven-design.md`](04-architecture/domain-driven-design.md) | Bounded areas and ubiquitous language |
| [`security-architecture.md`](04-architecture/security-architecture.md) | Auth, roles, rate limiting, redaction, CORS, and rail callback security |
| [`tech-stack.md`](04-architecture/tech-stack.md) | Source-verified technology stack and versions |
| [`coding-standards.md`](04-architecture/coding-standards.md) | Repository coding standards and finance-domain guardrails |
| [`service-boundaries.md`](04-architecture/service-boundaries.md) | Modular monolith boundaries and non-microservice caveat |
| [`adr/ADR-001-modular-monolith.md`](04-architecture/adr/ADR-001-modular-monolith.md) | ADR for one TypeScript deployable with modules |
| [`adr/ADR-002-append-only-ledger.md`](04-architecture/adr/ADR-002-append-only-ledger.md) | ADR for journal-entry based money movement |
| [`adr/ADR-003-idempotency-keys.md`](04-architecture/adr/ADR-003-idempotency-keys.md) | ADR for durable idempotency on external writes |
| [`adr/ADR-004-external-rail-adapters.md`](04-architecture/adr/ADR-004-external-rail-adapters.md) | ADR for simulator/mock-bank adapters |

### 05-api - API Documentation

| Document | Description |
|---|---|
| [`api-contract.md`](05-api/api-contract.md) | Route groups, headers, auth, errors, idempotency, and source anchors |

### 06-database - Database

| Document | Description |
|---|---|
| [`db-schema.md`](06-database/db-schema.md) | Prisma models, enums, and relationships |
| [`migration-guide.md`](06-database/migration-guide.md) | Migration inventory and operational guidance |
| [`seed-data.md`](06-database/seed-data.md) | Seed script and seed data description |

### 07-flows - Business Flows

| Document | Description |
|---|---|
| [`end-to-end-business-flow.md`](07-flows/end-to-end-business-flow.md) | Mermaid diagrams for finance workflows |
| [`state-machine.md`](07-flows/state-machine.md) | State tables matching Prisma enums |
| [`business-flow-overview.md`](07-flows/business-flow-overview.md) | Cross-flow overview and source anchors |

### 08-ui-ux - UI/UX

| Document | Description |
|---|---|
| [`README.md`](08-ui-ux/README.md) | Web workspace status and UI caveats |
| [`role-screens.md`](08-ui-ux/role-screens.md) | Current Next.js page inventory by role |

### 09-testing - Quality Assurance

| Document | Description |
|---|---|
| [`test-strategy.md`](09-testing/test-strategy.md) | Unit, integration, web, Java, contract, and full verification strategy |
| [`test-plan-full.md`](09-testing/test-plan-full.md) | Exact test and verification commands from `package.json` |
| [`business-flow-test-matrix.md`](09-testing/business-flow-test-matrix.md) | Flow-to-test evidence matrix with missing proof marked explicitly |

### 10-deployment - DevOps And Deployment

| Document | Description |
|---|---|
| [`deployment-guide.md`](10-deployment/deployment-guide.md) | Local PostgreSQL, backend runtime, Swagger, health, and deployment caveats |
| [`ci-cd.md`](10-deployment/ci-cd.md) | GitHub Actions workflow and no-CD caveat |
| [`docker.md`](10-deployment/docker.md) | Docker Compose and Dockerfile details |
| [`env-variables.md`](10-deployment/env-variables.md) | Environment variable reference from `.env.example` |

### 11-operations - Operations

| Document | Description |
|---|---|
| [`admin-guide.md`](11-operations/admin-guide.md) | Operator and admin route responsibilities |
| [`runtime-operations.md`](11-operations/runtime-operations.md) | Startup, probes, logs, batch, rails, audit, and incident workflows |
| [`backup-restore.md`](11-operations/backup-restore.md) | PostgreSQL backup and restore guidance without invented scripts |

### 12-handover - Project Handover

| Document | Description |
|---|---|
| [`developer-onboarding.md`](12-handover/developer-onboarding.md) | Local setup, Prisma, tests, and source-reading path |
| [`handover-document.md`](12-handover/handover-document.md) | Current state, code anchors, doc map, and risks |
| [`known-issues.md`](12-handover/known-issues.md) | Current known limits and follow-up work |

### reference - Source Evidence

| Document | Description |
|---|---|
| [`repository-status.md`](reference/repository-status.md) | GitNexus, source shape, and known limits snapshot |
| [`engineering-metrics.md`](reference/engineering-metrics.md) | Source-verified engineering metrics |
| [`gitnexus-codebase-scan.md`](reference/gitnexus-codebase-scan.md) | GitNexus flow and graph summary |
| [`api-route-inventory.md`](reference/api-route-inventory.md) | Nest/Fastify route groups and Next.js auth proxy routes |
| [`role-api-matrix.md`](reference/role-api-matrix.md) | Role-to-route reference matrix |
| [`current-system-flows.md`](reference/current-system-flows.md) | Source-backed current flow summary |
| [`project-evidence-sheet.md`](reference/project-evidence-sheet.md) | Evidence table using VERIFIED, INFERRED, MISSING, and CONTRADICTED statuses |

### archive - Historical Documents

| Document | Description |
|---|---|
| [`README.md`](archive/README.md) | Archive policy |
| [`legacy-flat-docs/README.md`](archive/legacy-flat-docs/README.md) | Index for pre-refresh flat documentation |

---

## 2. Canonical Rules

1. Repository source reality is the tie-breaker when documentation disagrees with code.
2. Endpoint changes require updates to `05-api/api-contract.md` and `reference/api-route-inventory.md`.
3. Prisma schema or migration changes require updates to `06-database/db-schema.md` and `06-database/migration-guide.md`.
4. Auth, admin, credit, transfer, rail, or ledger changes require review against the finance security and auditability rules in `04-architecture/security-architecture.md` and `04-architecture/coding-standards.md`.
5. Test script or CI workflow changes require updates to `09-testing/test-plan-full.md`, `09-testing/test-strategy.md`, and `10-deployment/ci-cd.md`.
6. Archived documents are retained for history; current guidance belongs in the numbered hierarchy.

---

## 3. Maintenance

- Update this index whenever documents are added, moved, or removed.
- Keep all paths relative to the `docs/` directory unless linking to root files.
- Do not claim production readiness, real bank settlement, Prometheus/Grafana observability, or deployment status unless fresh evidence proves it.
- Rerun GitNexus before refreshing source metrics.
- Move superseded docs to `archive/` instead of deleting them.
