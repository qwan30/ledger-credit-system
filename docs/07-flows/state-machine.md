# State Machines

State values are sourced from `prisma/schema.prisma`.

## TransferStatus

| State | Meaning | Typical next states |
|---|---|---|
| `RECEIVED` | Transfer request persisted | `VALIDATED`, `FAILED` |
| `VALIDATED` | Input and account checks passed | `PENDING_LEDGER`, `PENDING_EXTERNAL`, `FAILED` |
| `PENDING_LEDGER` | Internal ledger posting is pending | `SETTLED`, `FAILED` |
| `PENDING_EXTERNAL` | External rail completion is pending | `SETTLED`, `FAILED`, `COMPENSATED` |
| `SETTLED` | Transfer completed | Terminal |
| `FAILED` | Transfer failed | `COMPENSATED` or operational review |
| `COMPENSATED` | Compensating action recorded | Terminal/review |
| `CANCELLED` | Transfer cancelled | Terminal |

## CreditAssessmentStatus

| State | Meaning | Typical next states |
|---|---|---|
| `REQUESTED` | Assessment request accepted | `DATA_COLLECTED`, `FAILED` |
| `DATA_COLLECTED` | Snapshot created | `SCORED`, `FAILED` |
| `SCORED` | Score and thresholds assigned | `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `FAILED` |
| `UNDER_REVIEW` | Manual review required | `APPROVED`, `REJECTED` |
| `APPROVED` | Reviewer approved | Terminal |
| `REJECTED` | Reviewer rejected | Terminal |
| `FAILED` | Assessment failed | Terminal/review |

## BatchRunStatus

| State | Meaning |
|---|---|
| `SCHEDULED` | Planned but not running |
| `RUNNING` | Work is active |
| `PARTIALLY_FAILED` | Some items succeeded and some failed |
| `COMPLETED` | All processed items succeeded |
| `FAILED` | No useful success or unrecoverable failure |
| `CANCELLED` | Run was cancelled |

## BatchRunItemStatus

| State | Meaning |
|---|---|
| `PENDING` | Item is queued |
| `RUNNING` | Item is being processed |
| `COMPLETED` | Item succeeded |
| `FAILED` | Item failed and can be inspected/retried |

## AuthSessionStatus

| State | Meaning |
|---|---|
| `ACTIVE` | Session can be refreshed |
| `REVOKED` | Session was explicitly revoked |
| `EXPIRED` | Session is beyond refresh lifetime |
