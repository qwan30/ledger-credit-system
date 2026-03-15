# Non-Functional Requirements

**Last Updated:** 2026-03-15

## Correctness And Consistency

- transaction correctness target is `100%`
- no money-moving path may rely on floating-point arithmetic
- ledger mutations must be reconstructable from append-only facts
- duplicate externally triggered writes must not create duplicate ledger effects

## Performance Targets

- the end-of-day batch must process at least `100,000` accounts in under `5 minutes`
- operational queries should support investigation without blocking critical write paths
- latency targets for public APIs remain open, but write-path correctness takes precedence over low latency

## Reliability And Recovery

- externally visible write outcomes must be safe under client retry
- partial failure handling must prefer explicit compensation to destructive rollback of durable history
- batch processing must support retry-safe continuation or rerun semantics

## Observability

- each sensitive or money-moving request should carry a correlation identifier
- logs and metrics must support tracing from request to ledger impact to audit event
- batch runs must expose processed counts, failure counts, and timing metrics

## Security

- all external input must be schema-validated at the boundary
- sensitive data must be protected in transit and at rest
- error responses must not expose secrets, credentials, or stack traces
- privileged access patterns should be attributable to a specific actor identity

## Verification Expectations

- unit and integration tests should verify exact-money behavior and idempotency
- tests should assert balanced posting outcomes for money movement
- tests should verify batch retry safety and replay-safe transfer submission
- security review is mandatory for auth, credit, payments, and external integration changes

## Target-Only Placeholders

- formal availability SLOs are not yet defined
- multi-region or disaster-recovery topology is not yet defined
