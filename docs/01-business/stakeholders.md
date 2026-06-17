# Stakeholders

| Stakeholder | System role | Current source support |
|---|---|---|
| Customer | Owns accounts, initiates transfers, requests credit assessment | Customer-facing web routes, auth principal support, account/transfer/credit APIs |
| Operator | Handles transfer and batch operations | `src/modules/ops/ops.controller.ts` |
| Analyst | Reviews credit assessment output | Credit assessment review routes and `CreditAssessment` status model |
| Auditor | Searches audit events and reconstructs activity | `AuditEvent`, audit service, ops audit search route |
| Admin | Provisions principals, roles, and external identities | Auth admin routes |
| External rail provider | Emits transfer lifecycle callbacks | External rail controller and event model |
| API client | Calls documented REST APIs with auth and idempotency headers | Controllers, schemas, OpenAPI workspace |
| System scheduler | Runs batch close workflows | Batch module and jobs module |

## Role Notes

Roles are represented through `ActorType` values and role bindings. Route-level access is enforced by guards and controller decorators; documentation should not assume a role can call a route unless source or tests prove it.
