# Current System Flows

| Flow | Entry | Service path | Persistence path | Current caveat |
|---|---|---|---|---|
| Internal transfer | `POST /api/v1/transfers` | `TransfersService.createTransfer`, `LedgerService.postJournalEntry` | `TransferRequest`, `JournalEntry`, `Posting`, projections | Requires `Idempotency-Key` |
| External transfer | `POST /api/v1/transfers` | `TransfersService`, external rail services | `TransferRequest`, `ExternalTransferEvent`, clearing postings | Simulator/mock-bank adapters only |
| Provider callback | `POST /api/v1/integrations/external-rails/:provider/events` | `ExternalRailService` | `ExternalTransferEvent`, transfer status | Requires provider/secret handling |
| Redrive/reconcile | Ops transfer routes | `ExternalRailService` | Transfer and external event records | Privileged route |
| Credit assessment | `POST /api/v1/credit-assessments` | `CreditService` | `CreditProfileSnapshot`, `CreditAssessment` | Requires `Idempotency-Key` |
| Manual credit review | Ops credit routes | `CreditService.reviewAssessment` | `CreditAssessment` | Analyst/Admin route |
| Batch close | scheduled job | `BatchService.runBatch` | `BatchRun`, `BatchRunItem`, ledger entries | Requires PostgreSQL and configured schedule |
| Audit search | Ops audit route | `AuditService.search` | `AuditEvent` | Read-only investigation |
| Admin provisioning | Auth admin routes | `AuthProvisioningService` | Auth principal/role/identity tables | Admin route |
