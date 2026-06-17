# End-To-End Business Flow

## Internal Transfer

```mermaid
flowchart LR
  A[Client submits transfer with Idempotency-Key] --> B[Validate auth, account, currency, amount]
  B --> C[Create TransferRequest RECEIVED]
  C --> D[Move VALIDATED then PENDING_LEDGER]
  D --> E[Post balanced journal entry]
  E --> F[Update transfer SETTLED]
  F --> G[Complete idempotency record and audit]
```

Source: `src/modules/transfers/transfers.service.ts`, `src/modules/ledger/ledger.service.ts`.

## External Transfer With Simulator/Mock-Bank Rail

```mermaid
flowchart LR
  A[Client submits external transfer] --> B[Resolve rail provider]
  B --> C[Create transfer and debit source to clearing]
  C --> D[Create SUBMITTED external event]
  D --> E[Return 202 PENDING_EXTERNAL]
  E --> F[Queue provider submission]
```

Source: `src/modules/transfers/transfers.service.ts`, `src/modules/transfers/external-rail.service.ts`.

## Provider Callback Ingestion

```mermaid
flowchart LR
  A[Provider callback] --> B[Validate provider and callback secret]
  B --> C[Record ExternalTransferEvent]
  C --> D[Apply ACKNOWLEDGED, SETTLED, FAILED, or COMPENSATED result]
  D --> E[Audit state change]
```

Source: `src/modules/transfers/external-rail.controller.ts`, `src/modules/transfers/external-rail.service.ts`.

## Transfer Redrive And Reconcile

```mermaid
flowchart LR
  A[Ops request] --> B[Role guard OPS or ADMIN]
  B --> C[Redrive submission or reconcile provider state]
  C --> D[Record external event and audit action]
```

Source: `src/modules/ops/ops.controller.ts`, `src/modules/transfers/external-rail.service.ts`.

## Credit Assessment Submission And Manual Review

```mermaid
flowchart LR
  A[Client submits assessment with Idempotency-Key] --> B[Create profile snapshot]
  B --> C[Score with policy thresholds]
  C --> D[Move UNDER_REVIEW]
  D --> E[Analyst/Admin approves or rejects]
  E --> F[Persist rationale and audit]
```

Source: `src/modules/credit/credit.service.ts`, `src/modules/ops/ops.controller.ts`.

## End-Of-Day Interest Close Batch

```mermaid
flowchart LR
  A[Scheduler registers end-of-day job] --> B[Create BatchRun RUNNING]
  B --> C[Create BatchRunItem rows for active accounts]
  C --> D[Process chunks and post interest entries]
  D --> E[Mark items COMPLETED or FAILED]
  E --> F[Set BatchRun final status and audit]
```

Source: `src/modules/batch/batch.service.ts`.

## Audit Search

```mermaid
flowchart LR
  A[Ops/Auditor/Admin query] --> B[Filter resource, correlation, idempotency]
  B --> C[Return audit event list]
```

Source: `src/modules/ops/ops.controller.ts`, `src/modules/audit/audit.service.ts`.

## Admin Auth Provisioning

```mermaid
flowchart LR
  A[Admin request] --> B[Create principal]
  B --> C[Bind role]
  C --> D[Attach external identity if needed]
```

Source: `src/modules/auth/auth.controller.ts`, `src/modules/auth/auth-provisioning.service.ts`.
