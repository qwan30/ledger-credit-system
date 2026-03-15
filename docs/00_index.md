# Documentation Index

## Purpose

This `docs/` tree stores durable project knowledge for the ledger credit system. It is the canonical documentation set for a target-state TypeScript finance backend centered on exact-money handling, append-only auditability, idempotent state changes, and credit-risk decision traceability.

Read in this order for broad project work:

1. `docs/AGENTS.md`
2. `docs/00_index.md`
3. `docs/project-overview.md`
4. `docs/system-map.md`
5. `docs/retrieval-guide.md`
6. `docs/actors.md`
7. `docs/system-modules.md`
8. `docs/core-business-flows.md`
9. `docs/business-rules.md`
10. `docs/data-model.md`
11. `docs/state-machine.md`
12. `docs/api-contract.md`
13. `docs/non-functional-requirements.md`
14. `docs/configuration-rules.md`
15. `docs/automation-tasks.md`
16. `docs/ui-roles.md`
17. `docs/01_ideation/2026-03-15-initial-requirement-brief.md`
18. The newest relevant file in `docs/02_planning/`
19. The newest relevant file in `docs/03_implementation/`
20. The newest relevant file in `docs/04_audit_remediation/`
21. The newest relevant file in `docs/05_history/`

## Structure

- Top-level `docs/*.md` files are canonical source-of-truth reference docs and intentionally stay at the root of `docs/`.

- `docs/project-overview.md`
  High-level system statement, problem summary, target scope, success metrics, and major open gaps.
- `docs/system-map.md`
  Target architecture map, bounded areas, runtime surface, core interactions, and integration boundaries.
- `docs/retrieval-guide.md`
  Fast-start guide for where to read first for API design, ledger flows, credit rules, batch work, and audits.
- `docs/actors.md`
  Business, operational, and system actors that interact with the platform.
- `docs/system-modules.md`
  Responsibility and ownership map for the main logical modules in the target backend.
- `docs/core-business-flows.md`
  Canonical business flows for transfer, credit assessment, end-of-day processing, and audit review.
- `docs/business-rules.md`
  Invariants that must hold for money, ledger, idempotency, validation, and auditability.
- `docs/data-model.md`
  Target logical entities, relationships, constraints, and notable target-only placeholders.
- `docs/state-machine.md`
  Allowed state transitions for transfer requests, credit decisions, and batch runs.
- `docs/api-contract.md`
  Target external and operator-facing API surface, headers, envelopes, and security-sensitive expectations.
- `docs/non-functional-requirements.md`
  Accuracy, consistency, throughput, observability, recovery, security, and verification targets.
- `docs/configuration-rules.md`
  Runtime policy knobs, defaults, and versioning guardrails for money, scoring, retries, and encryption-sensitive settings.
- `docs/automation-tasks.md`
  Documented scheduled tasks and future automation placeholders, each labeled by status.
- `docs/ui-roles.md`
  Backend-first role map for external users and internal operators.
- `docs/01_ideation/`
  Preserved raw briefs, exploratory notes, and early problem framing.
- `docs/02_planning/`
  Execution-ready plans and planning decisions.
- `docs/03_implementation/`
  Future delivery notes, rollout notes, and significant implementation records.
- `docs/04_audit_remediation/`
  Future audits, investigations, remediation plans, and postmortems.
- `docs/05_history/`
  Concise dated records of durable discoveries and meaningful milestones.

## Routing Heuristic

When persisting durable session output:

- ideation or raw external brief -> `docs/01_ideation/`
- planning or orchestration -> `docs/02_planning/`
- implemented delivery -> `docs/03_implementation/`
- audit, investigation, or remediation -> `docs/04_audit_remediation/`
- concise milestone or durable discovery -> `docs/05_history/`
- source-of-truth domain docs -> update the affected top-level `docs/*.md`

## What Belongs Here

- decisions that affect future implementation
- durable system knowledge that should survive handoffs
- target requirements and invariants for finance-domain behavior
- milestone notes worth reloading in later sessions

## What Does Not Belong Here

- raw chat transcripts
- scratch notes with no lasting value
- repeated copies of source code
- environment-specific secrets or credentials

## History Policy

`docs/05_history/` is for durable signal, not exhaustive logs.

Add a history entry when:

- a documentation, design, or implementation milestone changes how future work should start
- a security, audit, or incident review produces durable conclusions
- a material system capability is added or materially re-scoped

Keep each history entry short and include:

- date
- what changed or was learned
- evidence
- what future sessions should do with that knowledge
