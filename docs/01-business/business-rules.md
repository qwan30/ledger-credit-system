# Business Rules

## Money Rules

| ID | Rule |
|---|---|
| BR-001 | Money must not use floating-point arithmetic. |
| BR-002 | Monetary values must carry currency and integer minor units or equivalent fixed precision. |
| BR-003 | Ledger postings in a journal entry must balance exactly by currency. |
| BR-004 | Unsupported currencies fail at the boundary or service layer. |

## Ledger Rules

| ID | Rule |
|---|---|
| BR-005 | Money movement is represented through journal entries and postings. |
| BR-006 | Ledger and audit history are append-only unless an explicit compensating action is designed. |
| BR-007 | Balance projections are derived from posted ledger activity and must not replace ledger truth. |

## Transfer Rules

| ID | Rule |
|---|---|
| BR-008 | Transfer creation requires an idempotency key. |
| BR-009 | Duplicate idempotency keys must not create duplicate transfer or ledger mutations. |
| BR-010 | Internal transfers post directly through the ledger lifecycle. |
| BR-011 | External transfers use configured rail providers and record provider events. |
| BR-012 | Redrive and reconcile actions must be auditable operational actions. |

## Credit Rules

| ID | Rule |
|---|---|
| BR-013 | Credit assessment creation requires an idempotency key. |
| BR-014 | Credit decisions retain snapshot, score, thresholds, policy version, rationale, and reviewer state. |
| BR-015 | Manual approval and rejection are privileged operational actions. |

## Batch Rules

| ID | Rule |
|---|---|
| BR-016 | Batch runs record status, correlation ID, counts, and item-level failures. |
| BR-017 | Failed items may be retried through an explicit operator action. |

## Validation, Audit, And Security Rules

| ID | Rule |
|---|---|
| BR-018 | External input is validated at controllers or adapters. |
| BR-019 | State-changing operations must leave audit evidence. |
| BR-020 | Secrets must come from environment configuration, not hardcoded runtime values. |
