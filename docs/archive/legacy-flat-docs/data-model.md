# Data Model

**Last Updated:** 2026-03-15

## Target Logical Entities

### `customer`

Purpose:

- identifies the person or business being served and scored

Important fields:

- `customerId`
- customer profile identifiers
- status and audit timestamps

### `account`

Purpose:

- represents a customer-facing financial account

Important fields:

- `accountId`
- `customerId`
- account type
- currency
- status

### `ledger_account`

Purpose:

- represents the accounting-side ledger bucket used by postings

Important fields:

- `ledgerAccountId`
- account category
- currency
- normal balance direction

### `journal_entry`

Purpose:

- durable container for a balanced accounting event

Important fields:

- `journalEntryId`
- posting date or effective date
- source operation type
- correlation identifiers
- created-at metadata

### `posting`

Purpose:

- individual debit or credit line within a journal entry

Important fields:

- `postingId`
- `journalEntryId`
- `ledgerAccountId`
- amount in exact-money format
- direction

Important constraints:

- each posting belongs to one journal entry
- each journal entry must balance across its postings

### `transfer_request`

Purpose:

- tracks an internal or interbank transfer lifecycle

Important fields:

- `transferRequestId`
- source and destination account references
- transfer type
- amount and currency
- status
- idempotency key
- external reference if applicable

### `idempotency_record`

Purpose:

- persists replay-safe outcomes for externally triggered write paths

Important fields:

- idempotency key
- operation type
- request hash or equivalent payload fingerprint
- canonical response reference
- terminal outcome metadata

### `credit_profile_snapshot`

Purpose:

- durable input snapshot for scoring and later review

Important fields:

- `creditProfileSnapshotId`
- customer or account reference
- payment history summary
- average balance summary
- transaction frequency summary
- snapshot timestamp

### `credit_assessment`

Purpose:

- stores the computed score and decision evidence

Important fields:

- `creditAssessmentId`
- `creditProfileSnapshotId`
- score
- decision status
- rationale summary
- reviewer or approver metadata when applicable

### `batch_run`

Purpose:

- records each end-of-day or future automation execution

Important fields:

- `batchRunId`
- batch type
- status
- started-at and completed-at timestamps
- processed account counts
- failure summary

### `audit_event`

Purpose:

- immutable trail of sensitive or operationally important actions

Important fields:

- `auditEventId`
- actor type and actor identifier
- action type
- target resource type and identifier
- correlation and idempotency identifiers
- event timestamp

## Target Relationships

- one customer may own many accounts
- one account may map to one or more ledger accounts depending on the accounting design
- one journal entry has many postings
- one transfer request may generate one or more journal entries over its lifecycle
- one idempotency record maps to one externally triggered write outcome
- one credit assessment references one credit profile snapshot
- one batch run may generate many journal entries and many audit events
- one auditable action may point to transfers, assessments, batch runs, or account views

## State-Carrying Fields

- transfer request status
- credit assessment decision status
- batch run status
- account status

These are described canonically in `state-machine.md`.

## Target-Only Placeholders

Not yet decided:

- whether customer and account identities live in the same service boundary or an upstream identity domain
- whether balance snapshots are stored as a dedicated table or always derived on demand
- whether external connector payload archives live inside the main database or separate object storage
