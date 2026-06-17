# GitNexus Codebase Scan

**Scan date:** 2026-06-17
**Repository alias:** `ledger-credit-system`
**Indexed commit:** `c3e283f`

## Graph Summary

| Metric | Value |
|---|---:|
| Files | 277 |
| Nodes | 1,580 |
| Edges | 3,480 |
| Clusters | 58 |
| Flows | 95 |

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
