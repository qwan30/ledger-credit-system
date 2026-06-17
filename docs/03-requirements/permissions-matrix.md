# Permissions Matrix

This matrix summarizes intended access by role. Source truth remains the guards and decorators in controllers and auth modules.

| Route group | CUSTOMER | OPS | ANALYST | AUDITOR | ADMIN | SYSTEM | API_CLIENT |
|---|---|---|---|---|---|---|---|
| Health | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed |
| Auth login/refresh/logout | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed |
| Auth admin provisioning | No | No | No | No | Allowed | No | No |
| Accounts read APIs | Own data | Operational read if authorized | Read if authorized | Read if authorized | Admin read if authorized | No direct user route | API-scope dependent |
| Transfer create/read | Own data | Operational read/action | Read if authorized | Audit read if authorized | Admin read if authorized | Workflow only | API-scope dependent |
| External rail callbacks | No | No | No | No | No | Provider/system path | Provider path |
| Credit assessment create/read | Own request | Operational read/action | Review/read | Audit read | Admin read/action | Workflow only | API-scope dependent |
| Batch run lookup/retry | No | Allowed | No | Read if authorized | Allowed | Scheduler path | No |
| Ops audit search | No | Allowed | No | Allowed | Allowed | No | No |

## Role Source

Roles and actor categories are represented by `ActorType`, `AuthPrincipal`, and `RoleBinding` in `prisma/schema.prisma`. Route behavior should be checked against `src/common/auth/*` and controller decorators before making enforcement claims.
