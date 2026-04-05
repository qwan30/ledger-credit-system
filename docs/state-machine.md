# State Machine

**Last Updated:** 2026-03-16

## Transfer Request States

Candidate states:

- `RECEIVED`
- `VALIDATED`
- `PENDING_LEDGER`
- `PENDING_EXTERNAL`
- `SETTLED`
- `FAILED`
- `COMPENSATED`
- `CANCELLED`

Allowed direction:

- `RECEIVED -> VALIDATED`
- `VALIDATED -> PENDING_LEDGER`
- `PENDING_LEDGER -> SETTLED`
- `PENDING_LEDGER -> PENDING_EXTERNAL`
- `PENDING_EXTERNAL -> SETTLED`
- `PENDING_LEDGER -> FAILED`
- `PENDING_EXTERNAL -> FAILED`
- `FAILED -> COMPENSATED`
- `RECEIVED -> CANCELLED`
- `VALIDATED -> CANCELLED`

Notes:

- `SETTLED`, `COMPENSATED`, and `CANCELLED` are terminal
- a failed request that already caused durable financial effects must move through compensation rather than silent deletion

## Credit Assessment States

Candidate states:

- `REQUESTED`
- `DATA_COLLECTED`
- `SCORED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`
- `FAILED`

Allowed direction:

- `REQUESTED -> DATA_COLLECTED`
- `DATA_COLLECTED -> SCORED`
- `SCORED -> APPROVED`
- `SCORED -> REJECTED`
- `SCORED -> UNDER_REVIEW`
- `UNDER_REVIEW -> APPROVED`
- `UNDER_REVIEW -> REJECTED`
- `REQUESTED -> FAILED`
- `DATA_COLLECTED -> FAILED`
- `SCORED -> FAILED`

Notes:

- `APPROVED`, `REJECTED`, and `FAILED` are terminal
- `UNDER_REVIEW` is part of the target operating model and represents required manual reviewer action

## Batch Run States

Candidate states:

- `SCHEDULED`
- `RUNNING`
- `PARTIALLY_FAILED`
- `COMPLETED`
- `FAILED`
- `CANCELLED`

Allowed direction:

- `SCHEDULED -> RUNNING`
- `RUNNING -> COMPLETED`
- `RUNNING -> PARTIALLY_FAILED`
- `RUNNING -> FAILED`
- `RUNNING -> CANCELLED`
- `PARTIALLY_FAILED -> RUNNING`
- `PARTIALLY_FAILED -> COMPLETED`
- `PARTIALLY_FAILED -> FAILED`

Notes:

- reruns or retries should create new work records or explicit retry attempts, not erase the original run history
- `COMPLETED`, `FAILED`, and `CANCELLED` are terminal

## Open Questions

- whether interbank transfer cancellation remains allowed after external acknowledgement
- whether a batch run with retried shards should remain `PARTIALLY_FAILED` until every shard completes
