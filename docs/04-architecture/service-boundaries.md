# Service Boundaries

## Current Boundary

The TypeScript backend is one modular monolith. It is not a microservice topology today. Modules are separated by NestJS module boundaries and domain responsibilities, not by separately deployed network services.

## Internal Boundaries

| Boundary | Owns | Should not own |
|---|---|---|
| Auth | Identity, sessions, roles, credentials | Ledger mutations |
| Accounts | Account reads and projections | Transfer orchestration |
| Ledger | Journal entries, postings, balance projection | HTTP auth policy |
| Transfers | Transfer request lifecycle and rails | Credit scoring |
| Credit | Assessment snapshots, score, review state | Payment settlement |
| Batch | Scheduled close and retryable work | Ad hoc admin provisioning |
| Ops | Privileged operational actions | Core invariant bypasses |
| Audit | Audit event recording/search | Business decisions |

## External Boundaries

- PostgreSQL is the persistence boundary.
- External rail providers are behind adapter logic and callback endpoints.
- The Next.js workspace consumes backend APIs but is not the authoritative business logic.
- The Java skeleton is a separate workspace with health endpoints only.
