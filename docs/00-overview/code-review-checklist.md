# Code Review Checklist

Use this checklist for finance-domain changes and for docs that describe finance behavior.

## Money

- No floating-point arithmetic for monetary amounts.
- Amounts use `amountMinor`, BigInt, fixed precision, or explicit money value objects.
- Tests assert exact amounts and currency.

## Idempotency And State

- Externally triggered writes require explicit idempotency keys where applicable.
- Duplicate requests cannot create duplicate ledger mutations.
- Retry paths are deterministic and observable.

## Ledger And Audit

- Ledger and audit trails remain append-only unless a compensating action is explicitly designed.
- State-changing operations write reconstructable audit records.
- Manual fixes prefer compensation, redrive, or reconciliation over destructive edits.

## Validation

- Request bodies, params, headers, and callbacks are validated at the boundary.
- Validation is close to controllers, adapters, or message consumers.
- Malformed or incomplete requests fail fast.

## Security

- No hardcoded credentials or environment-specific secrets.
- Auth and role checks are present for privileged routes.
- External callbacks validate provider and callback secret requirements.
- Logs and error responses do not expose secrets, tokens, passwords, or sensitive operational data.

## Contracts, Database, And Tests

- Endpoint changes update OpenAPI contracts and docs.
- Prisma schema changes include migrations and doc updates.
- Tests cover money movement, idempotency, failure paths, and authorization where behavior changes.
- CI and local verification commands are documented when changed.
