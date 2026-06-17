# System Modules

**Last Updated:** 2026-03-15

## Module Map

### Ledger Core

Owns:

- journal entries
- debit and credit postings
- ledger balancing rules
- append-only money movement history

Depends on:

- exact-money value primitives
- durable persistence

### Balance Read Model

Owns:

- derived account balances
- ledger-backed statements and balance snapshots

Depends on:

- ledger core events or committed postings

### Transfer Service

Owns:

- transfer request intake
- idempotency enforcement
- orchestration of internal and external transfers
- compensation and failure mapping

Depends on:

- ledger core
- balance read model
- integration adapters
- audit trail

### Credit Scoring Service

Owns:

- collection of scoring inputs
- score computation or brokered scoring integration
- persistence of scoring snapshots and decision evidence

Depends on:

- account history
- transfer activity summaries
- configuration policy
- audit trail

### Batch And Close Runner

Owns:

- batch run lifecycle
- account chunking
- overnight interest accrual
- run-level metrics and retry-safe progress

Depends on:

- ledger core
- account catalog
- scheduler infrastructure
- audit trail

### Audit Trail Module

Owns:

- immutable audit event persistence
- action attribution metadata
- actor and correlation identifiers

Depends on:

- all state-changing modules publishing auditable events

### Policy And Configuration Module

Owns:

- money precision rules
- score-range configuration
- batch scheduling windows
- retry and timeout defaults

### Integration Adapter Layer

Owns:

- external rail message formatting
- response normalization
- connector-specific retries and error mapping

Depends on:

- transfer service
- configuration policy

## Dependency Direction

Preferred dependency flow:

- public API -> validation boundary -> service modules -> ledger or persistence -> read models or audit trail
- integration adapters should not own core financial rules
- balance projections should not bypass ledger truth

## Ownership Rules

- money safety rules belong in ledger core and shared value objects, not in controller glue
- idempotency checks belong at the externally triggered write boundary and in durable persistence
- audit writes are mandatory side effects for sensitive state changes, not optional logging
