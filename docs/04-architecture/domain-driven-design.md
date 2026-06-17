# Domain-Driven Design

## Bounded Areas

| Area | Responsibility | Primary source |
|---|---|---|
| Auth | Principals, credentials, sessions, refresh tokens, roles, external identities | `src/common/auth/*`, `src/modules/auth/*` |
| Accounts | Customer account read APIs and projections | `src/modules/accounts/*` |
| Ledger | Ledger accounts, journal entries, postings, balances, statements | `src/modules/ledger/*`, `prisma/schema.prisma` |
| Transfers | Transfer request lifecycle and idempotent submission | `src/modules/transfers/*` |
| External rails | Provider adapter boundary and callback ingestion | `src/modules/transfers/external-rail*` |
| Credit | Profile snapshots, scores, assessment state, manual review data | `src/modules/credit/*` |
| Batch | End-of-day close runs and retryable items | `src/modules/batch/*` |
| Ops | Privileged operational actions and investigation routes | `src/modules/ops/*` |
| Audit | Append-only audit events | `src/modules/audit/*` |
| Health | Liveness/readiness probes | `src/modules/health/*` |
| Web | Minimal customer-facing Next.js routes | `apps/web/src/app` |
| Contracts | OpenAPI contract generation/checking | `packages/api-contracts` |
| Java skeleton | Health-only Spring Boot API skeleton | `apps/api-java` |

## Aggregate And Entity Language

`Customer`, `Account`, `LedgerAccount`, `JournalEntry`, `Posting`, `TransferRequest`, `IdempotencyRecord`, `CreditProfileSnapshot`, `CreditAssessment`, `BatchRun`, `BatchRunItem`, `AuditEvent`, and `ExternalTransferEvent` are the main persistent domain terms.

## Dependency Direction

Controllers receive HTTP traffic, validate boundaries, and delegate to services. Services coordinate Prisma transactions, ledger/audit invariants, idempotency records, and projections.
