# API Route Inventory

**Global prefix:** `/api/v1`
**Swagger UI:** `/docs`

| Group | Routes | Source |
|---|---|---|
| Health | `GET /api/v1/health/live`, `GET /api/v1/health/ready` | `src/modules/health/health.controller.ts` |
| Auth | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/admin/principals`, `POST /api/v1/auth/admin/role-bindings`, `POST /api/v1/auth/admin/external-identities` | `src/modules/auth/auth.controller.ts` |
| Accounts | `GET /api/v1/accounts/:accountId/balance`, `GET /api/v1/accounts/:accountId/ledger-entries` | `src/modules/accounts/accounts.controller.ts` |
| Transfers | `POST /api/v1/transfers`, `GET /api/v1/transfers/:transferRequestId` | `src/modules/transfers/transfers.controller.ts` |
| External rails | `POST /api/v1/integrations/external-rails/:provider/events` | `src/modules/transfers/external-rail.controller.ts` |
| Credit | `POST /api/v1/credit-assessments`, `GET /api/v1/credit-assessments/:creditAssessmentId` | `src/modules/credit/credit.controller.ts` |
| Batch | `GET /api/v1/batch-runs/:batchRunId` | `src/modules/batch/batch.controller.ts` |
| Ops | `GET /api/v1/ops/transfers/:transferRequestId`, `GET /api/v1/ops/transfers/:transferRequestId/external-events`, `GET /api/v1/ops/audit-events`, `POST /api/v1/ops/batch-runs/:batchRunId/retry`, `POST /api/v1/ops/transfers/:transferRequestId/redrive`, `POST /api/v1/ops/transfers/:transferRequestId/reconcile`, `POST /api/v1/ops/credit-assessments/:creditAssessmentId/approve`, `POST /api/v1/ops/credit-assessments/:creditAssessmentId/reject` | `src/modules/ops/ops.controller.ts` |
| Web auth proxy | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session` | `apps/web/src/app/api/auth/*/route.ts` |
