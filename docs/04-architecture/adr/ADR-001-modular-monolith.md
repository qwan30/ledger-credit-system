# ADR-001: Modular Monolith

**Status:** Accepted

## Context

The backend has tightly related finance workflows: auth, accounts, ledger, transfers, credit, batch, ops, and audit. Distributed transactions would add risk without current source evidence that separate deployables are needed.

## Decision

Use one NestJS/Fastify backend deployable with clear module boundaries.

## Consequences

- Simpler local development and CI.
- Shared database transactions can protect money and audit invariants.
- Module boundaries must be reviewed carefully to avoid accidental coupling.
