# Product Requirements Document

## Product Goals

Ledger Credit System demonstrates a finance backend that is small enough to inspect but serious about money, auditability, idempotency, and operational recovery.

## Users

| User | Primary need |
|---|---|
| Customer | Submit transfers and credit assessment requests safely |
| Operator | Inspect transfer state, retry batch failures, redrive/reconcile transfers |
| Analyst | Review credit assessment output and rationale |
| Auditor | Search audit trails and reconstruct operations |
| Admin | Provision identities and roles |
| API client | Integrate with predictable REST contracts |

## Non-Goals

- Production settlement with external financial institutions.
- A full retail banking product.
- A multi-service deployment.
- Claims about live operations without deployment evidence.

## Current Implemented Capabilities

| Capability | Current source evidence |
|---|---|
| Auth and admin provisioning | `src/modules/auth/auth.controller.ts` |
| Account balance and ledger-entry read APIs | `src/modules/accounts/accounts.controller.ts` |
| Transfer creation and lookup | `src/modules/transfers/*` |
| External rail callback ingestion | `src/modules/transfers/external-rail.controller.ts` |
| Credit assessment and manual review | `src/modules/credit/*`, `src/modules/ops/ops.controller.ts` |
| Batch run lookup and retry | `src/modules/batch/*`, `src/modules/ops/ops.controller.ts` |
| Audit search | `src/modules/audit/*`, `src/modules/ops/ops.controller.ts` |

## Success Measures

- Exact money and balanced ledger invariants remain enforced.
- Retry paths remain idempotent.
- State-changing workflows leave audit evidence.
- Documentation claims can be traced to source files or command output.
