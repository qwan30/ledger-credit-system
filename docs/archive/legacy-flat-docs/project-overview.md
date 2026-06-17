# Project Overview

**Last Updated:** 2026-03-16

## Problem Statement

This project targets a finance backend that solves two high-risk problems:

- money drift caused by mutable balance updates that are hard to reconstruct later
- inconsistent lending decisions caused by manual and weakly traceable credit assessment

The target system is a core banking-style ledger and smart credit platform that prioritizes exact-money correctness, append-only traceability, automated risk scoring, and operationally safe end-of-day processing.

## Current Repository Summary

Current repository shape:

- NestJS + Fastify backend committed in `src/` with Prisma persistence in `prisma/`
- project instructions in the root `AGENTS.md` define finance-domain invariants and operating rules
- the original seed brief is preserved in `docs/01_ideation/2026-03-15-initial-requirement-brief.md`

Current state implications:

- this docs set contains both implemented v1 behavior and target-state requirements that are still open
- references in the seed brief to Java, Spring Boot, Spring Batch, JPA, Mockito, or Drools are treated as source-context ideas rather than the canonical stack direction

## Target System Summary

The target system should provide:

- a double-entry ledger for all money movement
- transfer orchestration for internal and external bank rails
- automated credit assessment with replayable decision evidence
- end-of-day batch processing for interest accrual and financial close activities
- audit logging for all security-sensitive and money-sensitive actions

## Target Capability Summary

Primary target capabilities:

- append-only journal-based ledger with exact-money arithmetic
- idempotent externally triggered write flows
- transfer lifecycle visibility from submission through settlement or failure
- score generation in the `300-850` range using payment history, average balance, and transaction frequency
- batch execution that can process at least `100,000` accounts in under `5 minutes`
- verification posture that treats `100%` transaction correctness as a requirement, not a best-effort goal

## Canonical Documentation Map

The source brief has been decomposed into canonical docs:

- ledger and transfer requirements -> `business-rules.md`, `core-business-flows.md`, `state-machine.md`
- credit-scoring intent -> `actors.md`, `core-business-flows.md`, `api-contract.md`
- data integrity and audit expectations -> `data-model.md`, `non-functional-requirements.md`, `configuration-rules.md`
- batch and automation intent -> `automation-tasks.md`, `non-functional-requirements.md`

## Current Completion Snapshot

The repository now implements the current canonical target set, including:

- provider-agnostic external rail adapters with simulator and `mock-bank` implementations
- manual credit review workflow from `UNDER_REVIEW` to `APPROVED` or `REJECTED`
- audited admin provisioning for principals, role bindings, and external identity mappings
- a reproducible verification path that can bootstrap local PostgreSQL through Docker when needed

Operational follow-ups that remain outside the canonical target set:

- onboarding production bank or scheme-specific rail adapters and signature policies

## Recommended Reading Order

1. `system-map.md`
2. `retrieval-guide.md`
3. `actors.md`
4. `system-modules.md`
5. `core-business-flows.md`
6. `business-rules.md`
7. `data-model.md`
8. `state-machine.md`
9. `api-contract.md`
10. `non-functional-requirements.md`
11. `configuration-rules.md`
12. `automation-tasks.md`
13. `ui-roles.md`
