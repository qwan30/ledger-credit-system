# Discovery Report: Java + Next.js Migration

## Current State

- The repository currently contains a NestJS + Fastify + Prisma finance backend.
- Core bounded areas already exist in TypeScript: auth, accounts, ledger, transfers, credit, batch, audit, ops, and external rail integration.
- PostgreSQL is the system of record and the Prisma schema already encodes the target finance entities, idempotency records, auth sessions, audit events, and batch tables.
- There is no existing frontend application in the repository.

## Verified Surfaces

- Public API groups documented and implemented today:
  - `auth`
  - `accounts`
  - `transfers`
  - `credit-assessments`
  - `batch-runs`
  - `ops`
  - `integrations/external-rails`
  - `health`
- Auth model already supports:
  - password login for customer audience
  - OIDC subject-token exchange for operator audience
  - JWT access tokens
  - refresh token rotation with replay protection
- Async behavior already exists for:
  - external transfer submission
  - recurring end-of-day batch processing

## Constraints

- Finance invariants must survive the rewrite:
  - exact money arithmetic only
  - append-only ledger and audit trail
  - durable idempotency on externally triggered write flows
  - compensating actions instead of destructive rewrites
- The worktree is dirty, so migration work must avoid reverting or reformatting unrelated files.
- Incremental migration requires the existing NestJS app to remain runnable while Java and Next.js are added.

## Migration Implications

- The first slice must be additive:
  - scaffold monorepo paths
  - freeze the current API contract
  - bootstrap Spring Boot and Next.js apps
  - keep the TypeScript backend as the legacy implementation until route-group cutover
- API parity is sufficient for wave 1; portal-only list and queue endpoints are wave 2 additions.
