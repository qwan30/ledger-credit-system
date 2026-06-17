# API Contract

## Runtime

| Item | Value |
|---|---|
| Backend API prefix | `/api/v1` |
| Swagger UI | `/docs` |
| API style | JSON REST over NestJS/Fastify |
| Correlation header | `X-Correlation-Id` accepted and returned |
| Idempotency header | `Idempotency-Key` required for transfer and credit creation |
| Auth header | `Authorization: Bearer <token>` for protected routes |

## Error Shape

Errors are normalized through the global HTTP exception filter. Client code should treat non-2xx responses as structured API errors with status, message, and correlation context where present.

## Route Groups

| Group | Routes | Auth and role notes | Idempotency | Source |
|---|---|---|---|---|
| Health | `GET /api/v1/health/live`, `GET /api/v1/health/ready` | Public health probes | Not required | `src/modules/health/health.controller.ts` |
| Auth | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` | Login/refresh are public-style auth flows; logout requires session context | Not required | `src/modules/auth/auth.controller.ts` |
| Auth admin | `POST /api/v1/auth/admin/principals`, `POST /api/v1/auth/admin/role-bindings`, `POST /api/v1/auth/admin/external-identities` | Admin only | Not required by current route docs | `src/modules/auth/auth.controller.ts` |
| Accounts | `GET /api/v1/accounts/:accountId/balance`, `GET /api/v1/accounts/:accountId/ledger-entries` | Authenticated read, scoped by auth policy | Not required | `src/modules/accounts/accounts.controller.ts` |
| Transfers | `POST /api/v1/transfers`, `GET /api/v1/transfers/:transferRequestId` | Authenticated customer/API flow and read flow | Required for create | `src/modules/transfers/transfers.controller.ts` |
| External rails | `POST /api/v1/integrations/external-rails/:provider/events` | Provider callback with configured secret requirements | Provider event uniqueness applies | `src/modules/transfers/external-rail.controller.ts` |
| Credit | `POST /api/v1/credit-assessments`, `GET /api/v1/credit-assessments/:creditAssessmentId` | Authenticated customer/API flow and read flow | Required for create | `src/modules/credit/credit.controller.ts` |
| Batch | `GET /api/v1/batch-runs/:batchRunId` | Authenticated operational read | Not required | `src/modules/batch/batch.controller.ts` |
| Ops | `GET /api/v1/ops/transfers/:transferRequestId`, `GET /api/v1/ops/transfers/:transferRequestId/external-events`, `GET /api/v1/ops/audit-events`, `POST /api/v1/ops/batch-runs/:batchRunId/retry`, `POST /api/v1/ops/transfers/:transferRequestId/redrive`, `POST /api/v1/ops/transfers/:transferRequestId/reconcile`, `POST /api/v1/ops/credit-assessments/:creditAssessmentId/approve`, `POST /api/v1/ops/credit-assessments/:creditAssessmentId/reject` | OPS, AUDITOR, and ADMIN class-level access with route-specific action expectations | Not required by current route docs | `src/modules/ops/ops.controller.ts` |
| Web auth proxy | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session` | Next.js proxy/session routes | Not required | `apps/web/src/app/api/auth/*/route.ts` |

## Request Envelope Notes

- JSON request bodies are validated by route schemas.
- Monetary fields use minor-unit integer values, not decimal floats.
- Transfer and credit create requests must include `Idempotency-Key`.
- External rail callbacks are provider-scoped through `:provider`.

## Maintenance

Update this file and `docs/reference/api-route-inventory.md` when controller paths, guards, required headers, request schemas, or response shapes change.
