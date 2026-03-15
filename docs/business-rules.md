# Business Rules

**Last Updated:** 2026-03-15

## Money Rules

- money values must never use floating-point arithmetic
- all money amounts must be represented as integer minor units, fixed-precision decimals, or explicit money value objects
- every calculation affecting money must be exactly reproducible in tests and audits

## Ledger Rules

- all money movement must be represented by balanced double-entry postings
- ledger history is append-only by default
- corrections should be expressed as compensating entries rather than destructive rewrites
- no transfer is considered successful unless both sides of the posting set are persisted together

## Transfer Rules

- externally triggered write operations require an idempotency key
- duplicate requests with the same key must replay the original accepted outcome rather than create new ledger mutations
- duplicate requests with a conflicting payload under the same key must be rejected
- internal and interbank transfers must leave a reconstructable trail from request through terminal outcome
- failed external transfer handling must prefer explicit compensation over silent rollback of durable history

## Credit Rules

- credit scores must stay within the `300-850` range
- scoring inputs include payment history, average balance, and transaction frequency
- the persisted scoring result must be traceable to the input snapshot used to create it
- if human approval is involved, the approver action must be auditable

## Batch Rules

- end-of-day processing runs at the configured close window and produces a durable batch run record
- batch retries must not duplicate interest postings or other money movement
- batch completion evidence must include counts, timing, and failure summary

## Validation Rules

- external input must be validated at the boundary with schemas
- malformed, incomplete, or semantically invalid requests must fail fast
- validation errors must not produce partial ledger mutations

## Audit And Security Rules

- sensitive actions such as viewing balances, approving credit, or triggering operational remediation require an audit record
- user-facing errors must not leak secrets or internal stack details
- sensitive data should be encrypted in transit and at rest where appropriate
- credentials and environment-specific secrets must not appear in repository documentation or code

## Open Questions

Target-only questions still unresolved:

- whether interbank transfers post immediately or use a two-phase reservation and settlement model
- whether credit approval includes mandatory manual review thresholds
- whether operator remediation may trigger financial compensation directly or only operational retries
