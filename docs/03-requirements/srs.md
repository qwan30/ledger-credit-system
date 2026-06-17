# Software Requirements Specification

## Functional Requirements

| ID | Requirement | Source evidence |
|---|---|---|
| FR-001 | Expose liveness and readiness probes | `src/modules/health/health.controller.ts` |
| FR-002 | Authenticate principals and manage refresh sessions | `src/modules/auth/*` |
| FR-003 | Allow admin provisioning of principals, role bindings, and external identities | `src/modules/auth/auth.controller.ts` |
| FR-004 | Return account balances and ledger entries | `src/modules/accounts/accounts.controller.ts` |
| FR-005 | Create transfers with idempotency keys | `src/modules/transfers/transfers.service.ts` |
| FR-006 | Persist transfer state and external rail events | `prisma/schema.prisma`, `src/modules/transfers/*` |
| FR-007 | Post balanced ledger journal entries | `src/modules/ledger/ledger.service.ts` |
| FR-008 | Create credit assessments with traceable snapshots | `src/modules/credit/credit.service.ts` |
| FR-009 | Approve or reject credit assessments through privileged ops routes | `src/modules/ops/ops.controller.ts` |
| FR-010 | Run and inspect batch close workflows | `src/modules/batch/*` |
| FR-011 | Retry failed batch items | `src/modules/ops/ops.controller.ts` |
| FR-012 | Search audit events | `src/modules/ops/ops.controller.ts`, `src/modules/audit/*` |

## Non-Functional Requirements

| ID | Requirement | Current support |
|---|---|---|
| NFR-001 | Money operations avoid floating-point arithmetic | Project rules and `amountMinor` fields |
| NFR-002 | Externally triggered writes are retry-safe | Idempotency records and service flow |
| NFR-003 | State changes are auditable | `AuditEvent` and service audit calls |
| NFR-004 | Inputs are validated at boundaries | Controller schemas and zod dependency |
| NFR-005 | Secrets are environment driven | `.env.example`, config schema |
| NFR-006 | CI verifies backend, contracts, Java, and web workspaces | `.github/workflows/ci.yml` |

## Constraints

- PostgreSQL is the configured database.
- API prefix is `/api/v1`.
- Swagger UI is `/docs`.
- Node version differs between CI and Dockerfile and must be treated as a compatibility note.
