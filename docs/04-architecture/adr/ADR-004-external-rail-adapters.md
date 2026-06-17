# ADR-004: External Rail Adapters

**Status:** Accepted

## Context

The repository needs to model interbank-style transfer workflows without claiming production settlement.

## Decision

Use simulator/mock-bank providers behind an external rail adapter boundary.

## Consequences

- Transfer orchestration can be exercised locally.
- Provider callbacks and event records are modeled.
- Production provider integration remains out of scope until implemented and verified.
