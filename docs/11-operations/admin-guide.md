# Admin Guide

## Admin Responsibilities

| Area | Route group | Responsibility |
|---|---|---|
| Principal provisioning | Auth admin | Create principals for customer/operator/admin actors |
| Role binding | Auth admin | Assign roles through `RoleBinding` |
| External identity | Auth admin | Attach issuer/subject mappings |
| Credit review | Ops credit routes | Approve or reject assessments when authorized |
| Transfer operations | Ops transfer routes | Redrive or reconcile transfers when authorized |
| Batch operations | Ops batch route | Retry failed batch items |
| Audit investigation | Ops audit route | Search resource/correlation/idempotency events |

## Guardrails

- Do not bypass service methods with direct database edits.
- Prefer redrive, retry, reconcile, or compensating actions.
- Record correlation IDs during incident review.
- Treat demo secrets as local-only.
