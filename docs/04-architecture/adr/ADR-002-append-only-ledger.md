# ADR-002: Append-Only Ledger

**Status:** Accepted

## Context

Money movement must be reconstructable after incidents. Updating balances alone would lose the explanation for how a balance was reached.

## Decision

Represent money movement through journal entries and postings. Use projections for reads, not as the source of ledger truth.

## Consequences

- Incident review can trace state changes.
- Compensating entries are preferred over destructive rewrites.
- Tests must assert exact debit/credit balance and currency.
