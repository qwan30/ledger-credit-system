# ADR-003: Idempotency Keys

**Status:** Accepted

## Context

External clients and providers may retry requests. Retry must not duplicate transfers, credit assessments, or ledger mutations.

## Decision

Require durable idempotency for externally triggered write paths and store request hash, operation type, status, resource reference, and response data in `IdempotencyRecord`.

## Consequences

- Duplicate submissions can return the original outcome.
- Request hash mismatches can be rejected.
- Service code must complete idempotency records only after the durable operation result is known.
