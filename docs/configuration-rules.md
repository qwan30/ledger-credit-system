# Configuration Rules

**Last Updated:** 2026-03-15

## Money And Currency Policy

- money configuration must define supported currencies and their minor-unit precision
- application defaults must reject unsupported currencies rather than guess conversion behavior
- rounding rules, if any, must be explicit, versioned, and testable

## Credit Scoring Policy

- the supported score range is `300-850`
- scoring thresholds, review cutoffs, and model or rule versions must be configurable
- configuration changes that affect credit outcomes should be attributable and auditable

## Batch Scheduling

- end-of-day close should run in a clearly defined close window
- retry windows and backoff settings must be explicit
- scheduler configuration must prevent overlapping runs of the same batch type unless overlap is an intentional supported mode

## Integration And Retry Rules

- external rail timeouts, retry counts, and dead-letter or manual-review behavior must be configurable
- connector-specific credentials belong in environment-level secret stores, never in repository docs
- connector configuration should be versioned per environment where feasible

## Encryption And Sensitive Settings

- encryption keys and credentials must never be hardcoded
- audit retention periods and redaction policies should be configurable
- debug logging that could leak sensitive payloads must be disabled by default

## Versioning Guardrails

- configuration changes that alter financial behavior must be rollout-safe and traceable
- future migrations should preserve backward readability for durable records wherever practical

## Open Questions

- whether close windows are defined per timezone or per legal entity
- whether scoring policy versions are deployed with application releases or managed independently
