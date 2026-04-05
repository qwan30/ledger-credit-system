# API Contract

**Last Updated:** 2026-03-16

## Target Public Endpoints

### `POST /api/v1/transfers`

Purpose:

- create or replay an internal or interbank transfer request

Headers:

- required `Idempotency-Key`
- optional `X-Correlation-Id`

Minimum request shape:

```json
{
  "sourceAccountId": "string",
  "destination": {
    "type": "INTERNAL_ACCOUNT"
  },
  "amount": {
    "currency": "USD",
    "minorUnits": 12500
  }
}
```

External-destination variant:

```json
{
  "sourceAccountId": "string",
  "destination": {
    "type": "EXTERNAL_BANK",
    "provider": "mock-bank",
    "bankCode": "BANK01",
    "accountNumber": "12345678",
    "accountName": "Receiver Name"
  },
  "amount": {
    "currency": "USD",
    "minorUnits": 12500
  }
}
```

Success response:

- target `202 Accepted` for transfers requiring asynchronous lifecycle progress
- target `200 OK` only when the full transfer can be safely completed within the request

Target response envelope:

```json
{
  "data": {
    "transferRequestId": "string",
    "status": "PENDING_LEDGER",
    "correlationId": "string"
  }
}
```

Failure classes:

- `400` malformed request
- `401` unauthenticated
- `403` unauthorized
- `409` idempotency conflict or invalid transfer state
- `422` semantic validation failure

### `GET /api/v1/transfers/{transferRequestId}`

Purpose:

- retrieve transfer status and linked settlement metadata

Success response includes:

- transfer identity
- current status
- amount and currency
- source and destination references
- selected external rail provider when the destination is external
- external reference when present

### `GET /api/v1/accounts/{accountId}/balance`

Purpose:

- return the current derived balance for an account

Security note:

- this is an audit-sensitive read and should record who accessed the balance when policy requires it

### `GET /api/v1/accounts/{accountId}/ledger-entries`

Purpose:

- return paginated journal-entry history relevant to the account

Contract notes:

- use cursor pagination by default
- entries should be ordered by effective time, then deterministic tiebreaker

### `POST /api/v1/credit-assessments`

Purpose:

- create or replay a credit assessment request

Headers:

- required `Idempotency-Key`
- optional `X-Correlation-Id`

Minimum request shape:

```json
{
  "customerId": "string",
  "requestedBy": "string"
}
```

Target response envelope:

```json
{
  "data": {
    "creditAssessmentId": "string",
    "status": "UNDER_REVIEW",
    "score": 735,
    "rationaleSummary": "string"
  }
}
```

Target status semantics:

- `202 Accepted` when assessment submission succeeds and enters `UNDER_REVIEW`
- idempotent replay should return the original accepted payload

### `GET /api/v1/credit-assessments/{creditAssessmentId}`

Purpose:

- return score, decision status, and traceable rationale summary

Security note:

- only authorized reviewer, operator, or subject-visible roles should access this endpoint

### `POST /api/v1/ops/credit-assessments/{creditAssessmentId}/approve`

Purpose:

- record a privileged reviewer approval for an assessment currently under review

### `POST /api/v1/ops/credit-assessments/{creditAssessmentId}/reject`

Purpose:

- record a privileged reviewer rejection for an assessment currently under review

### `POST /api/v1/integrations/external-rails/{provider}/events`

Purpose:

- ingest provider-specific external rail callbacks and normalize them into acknowledgement, settlement, failure, or compensation events

Headers:

- provider-authenticated signature or shared callback token
- optional `X-Correlation-Id`

Current providers:

- `simulator`
- `mock-bank`

### `GET /api/v1/batch-runs/{batchRunId}`

Purpose:

- inspect end-of-day batch progress and final evidence

Response includes:

- batch type
- status
- timing
- processed counts
- failure summary

## Target Error Envelope

All handled errors should follow this shape:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "amount.minorUnits",
        "message": "Must be a positive integer"
      }
    ]
  }
}
```

Notes:

- error payloads must not expose internal secrets or stack traces
- `X-Correlation-Id` should be echoed back or generated if missing

## Idempotency Requirements

- all externally triggered write endpoints must accept `Idempotency-Key`
- duplicate keys with the same payload replay the original outcome
- duplicate keys with a conflicting payload return `409 Conflict`
- idempotency handling must be durable rather than in-memory only

## Audit-Sensitive Actions

Audit capture is required for:

- balance lookups when performed by privileged roles
- transfer creation and state-changing remediation
- credit assessment requests, reviews, approvals, and rejections
- batch rerun, cancel, or remediation actions

## Known Gaps In Contract Detail

Not yet pinned down:

- provider-specific signature validation shape for external callback requests
- the exact pagination cursor shape for every list endpoint
- whether future rail providers require a generic callback ingress alias in addition to provider-specific routes
