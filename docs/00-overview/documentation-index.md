# Documentation Index

This inventory is the maintenance map for the Ledger Credit System documentation set. Each file created by the source-backed refresh appears once.

| Area | Document | Purpose | Evidence basis | Maintenance trigger |
|---|---|---|---|---|
| Root | `README.md` | Portfolio and onboarding entry point | `package.json`, `docs/reference/*`, source routes | Project positioning, quick start, metrics, or command changes |
| Docs root | `docs/README.md` | Canonical documentation index | Reference docs style and this file inventory | Any doc add, move, or removal |
| Compatibility | `docs/00_index.md` | Legacy compatibility pointer | Previous flat-doc entry path | Keep only as redirect unless old links change |
| 00-overview | `00-overview/project-foundation.md` | Project foundation and verified baseline | `docs/reference/engineering-metrics.md`, `package.json`, source anchors | Metrics, stack, status, or scope changes |
| 00-overview | `00-overview/project-context.md` | Problem, stakeholders, scope, and limits | Source modules and business docs | Scope or stakeholder changes |
| 00-overview | `00-overview/documentation-index.md` | Full document inventory | Current docs tree | Any doc add, move, or removal |
| 00-overview | `00-overview/git-workflow.md` | Branch, commit, PR, and verification expectations | Git history, `package.json`, plan workflow | Workflow or CI command changes |
| 00-overview | `00-overview/code-review-checklist.md` | Finance-specific review checklist | `AGENTS.md`, source modules, security docs | Review standard or domain-rule changes |
| 01-business | `01-business/stakeholders.md` | Stakeholder and role definitions | Prisma `ActorType`, route groups | Role or workflow changes |
| 01-business | `01-business/scope.md` | In-scope and out-of-scope boundaries | Route inventory, service modules, known limits | Feature scope changes |
| 01-business | `01-business/glossary.md` | Ubiquitous language | Prisma schema, service names | New domain terms or model changes |
| 01-business | `01-business/business-rules.md` | Finance, audit, validation, and security rules | `AGENTS.md`, source services, Prisma constraints | Rule or invariant changes |
| 02-product | `02-product/prd.md` | Product goals, users, non-goals, current limits | Source modules and README status | Product direction changes |
| 02-product | `02-product/feature-list.md` | Feature catalog F-001 through F-020 | Route inventory and module map | Feature add/remove changes |
| 02-product | `02-product/release-plan.md` | Development release plan and caveats | CI workflow, repository status | Release label or gate changes |
| 03-requirements | `03-requirements/srs.md` | Functional and non-functional requirements | Source modules, route inventory, env config | Requirement or code behavior changes |
| 03-requirements | `03-requirements/permissions-matrix.md` | Roles mapped to route groups | Controllers, guards, Prisma `ActorType` | Auth or route changes |
| 03-requirements | `03-requirements/use-cases.md` | Main system use cases | Controllers and service flows | Workflow changes |
| 04-architecture | `04-architecture/architecture.md` | Runtime and lifecycle architecture | `src/app.module.ts`, `src/bootstrap.ts`, services | Module or lifecycle changes |
| 04-architecture | `04-architecture/domain-driven-design.md` | Bounded areas and ubiquitous language | Source folders and Prisma schema | Bounded area changes |
| 04-architecture | `04-architecture/security-architecture.md` | Auth, roles, redaction, CORS, and callback security | `src/common/auth/*`, `src/modules/auth/*`, `.env.example` | Security-sensitive changes |
| 04-architecture | `04-architecture/tech-stack.md` | Package and runtime versions | `package.json`, Dockerfile, CI, compose | Dependency or runtime changes |
| 04-architecture | `04-architecture/coding-standards.md` | Coding and domain standards | `AGENTS.md` | Repository rule changes |
| 04-architecture | `04-architecture/service-boundaries.md` | Modular monolith boundaries | `src/app.module.ts`, workspaces | Deployment topology changes |
| ADR | `04-architecture/adr/ADR-001-modular-monolith.md` | Modular monolith decision | Current deployment shape | Architecture style change |
| ADR | `04-architecture/adr/ADR-002-append-only-ledger.md` | Append-only ledger decision | Prisma `JournalEntry`, `Posting`, ledger service | Ledger mutation pattern changes |
| ADR | `04-architecture/adr/ADR-003-idempotency-keys.md` | Idempotency key decision | `IdempotencyRecord`, transfer and credit services | External write semantics change |
| ADR | `04-architecture/adr/ADR-004-external-rail-adapters.md` | External rail adapter decision | Transfers rail services and env provider | Rail provider architecture changes |
| 05-api | `05-api/api-contract.md` | Route groups, auth, headers, errors, idempotency | `reference/api-route-inventory.md`, controllers | Endpoint or schema changes |
| 06-database | `06-database/db-schema.md` | Models, enums, relationships | `prisma/schema.prisma` | Prisma model or enum changes |
| 06-database | `06-database/migration-guide.md` | Migration list and guidance | `prisma/migrations/*` | Migration add/remove changes |
| 06-database | `06-database/seed-data.md` | Seed script and demo data notes | `prisma/seed.ts`, `prisma/seed-data.ts` | Seed data changes |
| 07-flows | `07-flows/end-to-end-business-flow.md` | Mermaid business flow diagrams | Services and controllers | Workflow changes |
| 07-flows | `07-flows/state-machine.md` | State tables from Prisma enums | `prisma/schema.prisma` | Enum changes |
| 07-flows | `07-flows/business-flow-overview.md` | Cross-flow summary | `reference/current-system-flows.md` | Flow or route changes |
| 08-ui-ux | `08-ui-ux/README.md` | Web workspace status | `apps/web/src/app` | Web scope changes |
| 08-ui-ux | `08-ui-ux/role-screens.md` | Current page inventory by role | `apps/web/src/app/**/page.tsx` | Page route changes |
| 09-testing | `09-testing/test-strategy.md` | Test strategy | `package.json`, test tree, CI | Test strategy or script changes |
| 09-testing | `09-testing/test-plan-full.md` | Exact command list | `package.json` scripts | Script changes |
| 09-testing | `09-testing/business-flow-test-matrix.md` | Flow proof matrix | Test files and source flows | Test coverage changes |
| 10-deployment | `10-deployment/deployment-guide.md` | Local runtime and deployment caveats | Dockerfile, compose, bootstrap | Runtime/deploy changes |
| 10-deployment | `10-deployment/ci-cd.md` | CI workflow and no-CD caveat | `.github/workflows/ci.yml` | Workflow changes |
| 10-deployment | `10-deployment/docker.md` | Docker Compose and Dockerfile details | `docker-compose.yml`, `Dockerfile` | Container changes |
| 10-deployment | `10-deployment/env-variables.md` | Environment variable reference | `.env.example` | Env changes |
| 11-operations | `11-operations/admin-guide.md` | Operator and admin responsibilities | Ops and auth controllers | Admin route changes |
| 11-operations | `11-operations/runtime-operations.md` | Startup, probes, batch, rail, audit operations | Bootstrap, batch, transfers, audit modules | Operational behavior changes |
| 11-operations | `11-operations/backup-restore.md` | PostgreSQL backup/restore guidance | Compose and Prisma datasource | Database operational changes |
| 12-handover | `12-handover/developer-onboarding.md` | New developer setup | README commands and package scripts | Setup changes |
| 12-handover | `12-handover/handover-document.md` | Current handover snapshot | Repository status, source anchors | Handover status changes |
| 12-handover | `12-handover/known-issues.md` | Known limits and caveats | Repository status and verification results | Risk changes |
| reference | `reference/repository-status.md` | Source status snapshot | GitNexus and direct source reads | Any source status refresh |
| reference | `reference/engineering-metrics.md` | Measured metrics | GitNexus, rg, Prisma, CI | Metric changes |
| reference | `reference/gitnexus-codebase-scan.md` | GitNexus scan summary | GitNexus commands | Graph refresh |
| reference | `reference/api-route-inventory.md` | API route inventory | Controllers and web route handlers | Route changes |
| reference | `reference/role-api-matrix.md` | Role-route reference | Controllers and role guards | Auth or route changes |
| reference | `reference/current-system-flows.md` | Current flow source map | Services and controllers | Flow changes |
| reference | `reference/project-evidence-sheet.md` | Claim evidence table | Source files and commands | Evidence refresh |
| archive | `archive/README.md` | Archive policy | Documentation maintenance rules | Archive policy change |
| archive | `archive/legacy-flat-docs/README.md` | Legacy flat-doc index | Moved files | Legacy archive changes |
