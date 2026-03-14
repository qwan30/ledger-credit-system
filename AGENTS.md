# `ledger-credit-system` Agent Instructions

This repository is configured for Codex with project-local skills in `.agents/skills/` and project-local runtime defaults in `.codex/config.toml`.

## Project Focus

Treat this repository as a TypeScript backend for a finance domain. Optimize for correctness and auditability over convenience.

## Domain Rules

### Money

- Never use floating-point arithmetic for money.
- Represent money with integer minor units, fixed-precision decimals, or explicit money value objects.
- Assert exact amounts in tests.

### State Changes

- Money-moving operations must be idempotent under retry.
- Prefer explicit idempotency keys on externally triggered write paths.
- Do not allow duplicate ledger mutations from duplicate requests.

### Auditability

- Treat the ledger or audit trail as append-only unless the user explicitly requires another pattern.
- State-changing operations should leave a trace that can be reconstructed during incident review.
- Prefer reversible compensating actions over destructive rewrites.

### Validation

- Validate all external input at the boundary with schemas.
- Fail fast on malformed or incomplete requests.
- Keep validation close to handlers, adapters, or message consumers.

### Security

- Trigger `security-review` whenever work touches authentication, authorization, secrets, payments, credit, repayments, external integrations, or privileged admin actions.
- Do not hardcode credentials or environment-specific secrets.

## Working Style

- For non-trivial backend work, use `tdd-workflow` first.
- Before finishing a meaningful change, run `verification-loop` or explain which checks are not configured yet.
- Prefer `api-design`, `backend-patterns`, and `coding-standards` for normal backend tasks.
- Use `prompt-leverage` only when the user explicitly wants a prompt upgrade or reusable prompting structure.
- Use `ui-ux-pro-max` and `web-design-guidelines` only for explicit frontend, dashboard, admin panel, accessibility, or UX review tasks.

## Output Preferences

- Favor concrete tradeoffs and implementation details over generic architecture advice.
- Call out assumptions whenever repo infrastructure is not present yet.
- If a requested verification step cannot run because the repo has no matching script or tooling, say so explicitly instead of inventing one.
