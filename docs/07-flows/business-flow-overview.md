# Business Flow Overview

| Flow | Entry point | Main state records | Audit expectation |
|---|---|---|---|
| Internal transfer | `POST /api/v1/transfers` | `TransferRequest`, `JournalEntry`, `Posting`, projections | `transfer.created` |
| External transfer | `POST /api/v1/transfers` | `TransferRequest`, `ExternalTransferEvent`, clearing postings | Transfer and rail audit events |
| Provider callback | `POST /api/v1/integrations/external-rails/:provider/events` | `ExternalTransferEvent`, `TransferRequest` | Provider event processing audit |
| Redrive/reconcile | Ops transfer routes | `TransferRequest`, `ExternalTransferEvent` | Ops action audit |
| Credit assessment | `POST /api/v1/credit-assessments` | `CreditProfileSnapshot`, `CreditAssessment` | Credit creation/review audit |
| Batch close | Scheduler/job service | `BatchRun`, `BatchRunItem`, `JournalEntry` | `batch.completed`, retry audit |
| Audit search | `GET /api/v1/ops/audit-events` | `AuditEvent` | Read-only investigation |
| Admin provisioning | Auth admin routes | `AuthPrincipal`, `RoleBinding`, `ExternalIdentity` | Admin provisioning audit if service records it |

Source detail lives in `docs/reference/current-system-flows.md`.
