# Feature List

| ID | Feature | Current status | Source anchor |
|---|---|---|---|
| F-001 | Health probes | Implemented | `src/modules/health/health.controller.ts` |
| F-002 | Login | Implemented | `src/modules/auth/auth.controller.ts` |
| F-003 | Refresh token flow | Implemented | `src/modules/auth/*` |
| F-004 | Logout/session revocation | Implemented | `src/modules/auth/auth.controller.ts` |
| F-005 | Admin principal provisioning | Implemented | `src/modules/auth/auth.controller.ts` |
| F-006 | Role binding provisioning | Implemented | `src/modules/auth/auth.controller.ts` |
| F-007 | External identity provisioning | Implemented | `src/modules/auth/auth.controller.ts` |
| F-008 | Account balance read model | Implemented | `src/modules/accounts/accounts.controller.ts` |
| F-009 | Account ledger-entry read model | Implemented | `src/modules/accounts/accounts.controller.ts` |
| F-010 | Internal transfer submission | Implemented | `src/modules/transfers/transfers.service.ts` |
| F-011 | External transfer submission | Implemented with simulator/mock-bank rails | `src/modules/transfers/*` |
| F-012 | Transfer lookup | Implemented | `src/modules/transfers/transfers.controller.ts` |
| F-013 | Provider callback ingestion | Implemented | `src/modules/transfers/external-rail.controller.ts` |
| F-014 | Double-entry ledger posting | Implemented | `src/modules/ledger/ledger.service.ts` |
| F-015 | Credit assessment creation | Implemented | `src/modules/credit/credit.service.ts` |
| F-016 | Credit assessment manual review | Implemented | `src/modules/ops/ops.controller.ts` |
| F-017 | Batch run lookup | Implemented | `src/modules/batch/batch.controller.ts` |
| F-018 | Failed batch item retry | Implemented | `src/modules/ops/ops.controller.ts` |
| F-019 | Audit event search | Implemented | `src/modules/ops/ops.controller.ts` |
| F-020 | CI and contract checks | Implemented | `.github/workflows/ci.yml`, `package.json` |
