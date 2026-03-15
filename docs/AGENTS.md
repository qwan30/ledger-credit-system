# Docs Guidance

## Prompt Leverage

- For broad project work, read `docs/00_index.md` first to locate durable context.
- When a prompt asks for system structure, architecture explanation, or change placement, read `docs/system-map.md` after the index.
- When a prompt asks where to start a feature, bug triage, or audit, read `docs/retrieval-guide.md` next.
- When a prompt asks about actors, roles, or ownership boundaries, consult `docs/actors.md`, `docs/system-modules.md`, and `docs/ui-roles.md`.
- When a prompt asks about money safety, ledger invariants, transfer rules, or credit policy, consult `docs/business-rules.md`.
- When a prompt asks about flows or lifecycle behavior, consult `docs/core-business-flows.md` and `docs/state-machine.md`.
- When a prompt asks about schema, entities, relationships, or audit records, consult `docs/data-model.md`.
- When a prompt asks about public interfaces, idempotency headers, or validation envelopes, consult `docs/api-contract.md`.
- When a prompt asks about scale targets, observability, consistency, or resiliency, consult `docs/non-functional-requirements.md`.
- When a prompt asks about operational timing, runtime defaults, or policy knobs, consult `docs/configuration-rules.md` and `docs/automation-tasks.md`.
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
