# Project Overview

**Last Updated:** 2026-03-15

## Problem Statement

This project targets a finance backend that solves two high-risk problems:

- money drift caused by mutable balance updates that are hard to reconstruct later
- inconsistent lending decisions caused by manual and weakly traceable credit assessment

The target system is a core banking-style ledger and smart credit platform that prioritizes exact-money correctness, append-only traceability, automated risk scoring, and operationally safe end-of-day processing.

## Current Repository Summary

Current repository shape:

- documentation-first repository with no application implementation committed yet
- project instructions in the root `AGENTS.md` define the repo truth as a TypeScript finance backend
- the original seed brief is preserved in `docs/01_ideation/2026-03-15-initial-requirement-brief.md`

Current state implications:

- this docs set describes the target architecture and requirements, not implemented behavior
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

- ledger and transfer requirements -> `docs/business-rules.md`, `docs/core-business-flows.md`, `docs/state-machine.md`
- credit-scoring intent -> `docs/actors.md`, `docs/core-business-flows.md`, `docs/api-contract.md`
- data integrity and audit expectations -> `docs/data-model.md`, `docs/non-functional-requirements.md`, `docs/configuration-rules.md`
- batch and automation intent -> `docs/automation-tasks.md`, `docs/non-functional-requirements.md`

## Major Known Gaps

Not yet specified in implementation detail:

- the exact TypeScript framework and execution model
- the external bank integration protocol and settlement mechanics
- whether scoring logic is rule-based, model-based, or hybrid
- exact authn/authz model for operator and auditor endpoints

These gaps are intentional and remain open until code and delivery plans refine them.

## Recommended Reading Order

1. `docs/system-map.md`
2. `docs/retrieval-guide.md`
3. `docs/actors.md`
4. `docs/system-modules.md`
5. `docs/core-business-flows.md`
6. `docs/business-rules.md`
7. `docs/data-model.md`
8. `docs/state-machine.md`
9. `docs/api-contract.md`
10. `docs/non-functional-requirements.md`
11. `docs/configuration-rules.md`
12. `docs/automation-tasks.md`
13. `docs/ui-roles.md`
