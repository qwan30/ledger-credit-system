# Use Cases

| ID | Use case | Primary actor | Main flow | Source anchors |
|---|---|---|---|---|
| UC-001 | Login | Customer, operator, analyst, auditor, admin | Submit credentials, create session, receive tokens/cookies | `src/modules/auth/auth.controller.ts` |
| UC-002 | Refresh session | Authenticated principal | Present refresh token, rotate token, continue session | `src/modules/auth/*` |
| UC-003 | Create transfer | Customer or API client | Submit transfer with idempotency key, validate, persist request, post ledger or send rail | `src/modules/transfers/transfers.service.ts` |
| UC-004 | Inspect transfer | Customer, ops, auditor | Fetch transfer state and events | Transfers and ops controllers |
| UC-005 | Ingest external event | External rail provider | Receive provider callback, validate secret, record event, update transfer lifecycle | `src/modules/transfers/external-rail.controller.ts` |
| UC-006 | Create credit assessment | Customer or API client | Submit assessment request with idempotency key, snapshot profile, score, enter review | `src/modules/credit/credit.service.ts` |
| UC-007 | Review credit assessment | Analyst, ops, admin | Approve or reject under-review assessment with rationale | `src/modules/ops/ops.controller.ts` |
| UC-008 | Run or inspect batch | System, operator | Batch closes eligible work and records item outcomes | `src/modules/batch/batch.service.ts` |
| UC-009 | Retry batch failures | Operator, admin | Trigger retry for failed batch run items | `src/modules/ops/ops.controller.ts` |
| UC-010 | Search audit events | Auditor, ops, admin | Filter audit events by actor, resource, action, or correlation | `src/modules/audit/*`, `src/modules/ops/ops.controller.ts` |
| UC-011 | Provision access | Admin | Create principal, role binding, or external identity | `src/modules/auth/auth.controller.ts` |
