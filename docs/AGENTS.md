# Docs Guidance

## Prompt Leverage

- For broad project work, read `docs/00_index.md` first to locate durable context.
- When a prompt asks for system structure, architecture explanation, or change placement, read `docs/04-architecture/architecture.md` after the index.
- When a prompt asks where to start a feature, bug triage, or audit, read `docs/README.md` next.
- When a prompt asks about actors, roles, or ownership boundaries, consult `docs/01-business/stakeholders.md`, `docs/04-architecture/domain-driven-design.md`, and `docs/08-ui-ux/role-screens.md`.
- When a prompt asks about money safety, ledger invariants, transfer rules, or credit policy, consult `docs/01-business/business-rules.md`.
- When a prompt asks about flows or lifecycle behavior, consult `docs/07-flows/end-to-end-business-flow.md` and `docs/07-flows/state-machine.md`.
- When a prompt asks about schema, entities, relationships, or audit records, consult `docs/06-database/db-schema.md`.
- When a prompt asks about public interfaces, idempotency headers, or validation envelopes, consult `docs/05-api/api-contract.md`.
- When a prompt asks about scale targets, observability, consistency, or resiliency, consult `docs/03-requirements/srs.md`.
- When a prompt asks about operational timing, runtime defaults, or policy knobs, consult `docs/10-deployment/env-variables.md` and `docs/11-operations/runtime-operations.md`.
- When resuming after a gap, read the newest relevant entry under `docs/05_history/`.
- Treat these docs as durable guidance, not a replacement for reading source code once implementation exists.

## Documentation Routing

- Route durable output by task type:
  - ideation or raw brief -> `docs/01_ideation/`
  - planning or orchestration -> `docs/02_planning/`
  - implemented delivery -> `docs/03_implementation/`
  - audit, review, or remediation analysis -> `docs/04_audit_remediation/`
  - concise cross-session memory or milestone recap -> `docs/05_history/`
- When a canonical top-level source-of-truth doc changes, update the affected `docs/*.md` file directly rather than hiding the change only in planning or history notes.
- When you add a new durable doc that future sessions should discover quickly, update `docs/00_index.md`.

## Scope

- Keep documentation in this folder focused on the ledger credit system only.
- Preserve finance-domain correctness and auditability requirements over convenience.
- Do not document unsupported implementation details as if they already exist.
- Do not record secrets, real credentials, or environment-specific values in this folder.
