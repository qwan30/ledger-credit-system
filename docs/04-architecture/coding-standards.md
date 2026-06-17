# Coding Standards

## Finance Domain Rules

- Never use floating-point arithmetic for money.
- Represent money with integer minor units, fixed decimals, or explicit money value objects.
- Assert exact amounts in tests.
- Keep money-moving operations idempotent under retry.
- Require explicit idempotency keys on externally triggered write paths where applicable.
- Do not allow duplicate ledger mutations from duplicate requests.

## Auditability

- Treat ledger and audit trails as append-only unless explicitly designing a compensating action.
- State-changing operations must leave reconstructable audit evidence.
- Prefer redrive, reconcile, and compensation over destructive rewrites.

## Validation

- Validate external input at the boundary with schemas.
- Keep validation close to controllers, adapters, or message consumers.
- Fail fast on malformed or incomplete requests.

## Security

- Do not hardcode credentials or environment-specific secrets.
- Run security review when touching auth, authorization, secrets, transfers, credit, external integrations, privileged admin actions, or other money-sensitive paths.

## Documentation

- Source files and command outputs are the tie-breaker.
- Do not claim deployment, settlement, monitoring, or coverage status without evidence.
- Archive superseded docs rather than deleting them.
