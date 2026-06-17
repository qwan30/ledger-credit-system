# Retrieval Guide

**Last Updated:** 2026-03-15

## Start Here

For broad project work:

1. `project-overview.md`
2. `system-map.md`
3. `business-rules.md`

## If You Are Working On Transfers

Read in this order:

1. `core-business-flows.md`
2. `state-machine.md`
3. `api-contract.md`
4. `data-model.md`
5. `non-functional-requirements.md`

Focus on:

- idempotency at request boundaries
- compensating behavior for failures
- audit capture for money movement

## If You Are Working On Ledger Or Balance Logic

Read in this order:

1. `business-rules.md`
2. `data-model.md`
3. `system-modules.md`
4. `non-functional-requirements.md`

Focus on:

- exact-money representation
- append-only journal semantics
- read-model derivation versus write-model truth

## If You Are Working On Credit Scoring

Read in this order:

1. `actors.md`
2. `core-business-flows.md`
3. `data-model.md`
4. `api-contract.md`
5. `configuration-rules.md`

Focus on:

- traceable scoring inputs
- stored decision evidence
- operator review and approval touchpoints

## If You Are Working On Batch Or Automation

Read in this order:

1. `automation-tasks.md`
2. `core-business-flows.md`
3. `state-machine.md`
4. `non-functional-requirements.md`
5. `configuration-rules.md`

Focus on:

- retry-safe execution
- chunking and completion evidence
- close-window timing assumptions

## If You Are Working On Security Or Audit

Read in this order:

1. `business-rules.md`
2. `api-contract.md`
3. `data-model.md`
4. `non-functional-requirements.md`
5. `ui-roles.md`

Focus on:

- audit events for sensitive actions
- boundary validation
- role separation for operator, analyst, and auditor actions

## If You Need The Original Seed Context

Read:

1. `docs/01_ideation/2026-03-15-initial-requirement-brief.md`
2. `project-overview.md`

Use the ideation brief as source context only. Do not treat it as the canonical requirements document.
