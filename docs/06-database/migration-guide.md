# Migration Guide

## Current Migrations

| Order | Migration |
|---:|---|
| 1 | `20260315095314_init` |
| 2 | `20260315100000_finance_guards` |
| 3 | `20260315154256_auth_domain` |
| 4 | `20260316143000_target_state_completion` |
| 5 | `20260316170000_credit_status_under_review_backfill` |

## Local Commands

```powershell
npm run prisma:generate
npm run prisma:migrate:dev
```

## CI/Verification Context

`npm run verify:full` runs Prisma generation and migration deploy against a PostgreSQL database it expects to be available or bootstrappable.

## Maintenance Rules

- Add a migration for every schema change.
- Update `docs/06-database/db-schema.md` when models, enums, or relationships change.
- Update seed docs when seed assumptions change.
- Do not edit applied migration history casually; add a new migration instead.
