# Business Flow Test Matrix

Status values use `VERIFIED` when a directly named test/spec exists and `MISSING` when the doc has no direct proof yet.

| Flow | Unit/spec evidence | Integration evidence | Status |
|---|---|---|---|
| Internal transfer | `src/modules/transfers/transfers.service.test.ts`, transfer state machine tests | `tests/integration/transfers.spec.ts` | VERIFIED |
| External transfer rail | External rail service, simulator, and mock-bank tests | `tests/integration/transfers.spec.ts`, `tests/integration/ops.spec.ts` | VERIFIED |
| Provider callback ingestion | External rail service tests | `tests/integration/transfers.spec.ts` | VERIFIED |
| Transfer redrive/reconcile | External rail service tests | `tests/integration/ops.spec.ts` | VERIFIED |
| Credit assessment create/review | Credit service and scoring tests | `tests/integration/credit.spec.ts`, `tests/integration/ops.spec.ts` | VERIFIED |
| End-of-day batch close | `src/modules/batch/batch.service.test.ts` | `tests/integration/batch.spec.ts` | VERIFIED |
| Audit search | `src/modules/audit/audit.service.test.ts` | `tests/integration/ops.spec.ts` | VERIFIED |
| Admin auth provisioning | `src/modules/auth/auth-provisioning.service.test.ts` | `tests/integration/auth.spec.ts` | VERIFIED |
| Full customer web journey | Web tests exist, but no source-backed E2E browser workflow proof was verified in this refresh | MISSING | MISSING |
