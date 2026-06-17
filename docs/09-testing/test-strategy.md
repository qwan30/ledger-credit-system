# Test Strategy

## Test Layers

| Layer | Command | Evidence |
|---|---|---|
| Backend unit tests | `npm run test:unit` | Vitest tests in `src` |
| Backend integration tests | `npm run test:integration` | Specs in `tests/integration` |
| Contract checks | `npm run contracts:check` | `packages/api-contracts` |
| Web typecheck/lint/tests | `npm run web:typecheck`, `npm run web:lint`, `npm run web:test` | `apps/web` workspace |
| Java skeleton tests | `npm run java:test` | Maven tests in `apps/api-java` |
| Full verification | `npm run verify:full` | `scripts/verify-full.ts` |

## Coverage Priorities

- Money arithmetic and exact amount assertions.
- Ledger balance and currency invariants.
- Transfer idempotency and duplicate request behavior.
- External rail callback uniqueness and state transitions.
- Credit scoring, under-review, approval, and rejection paths.
- Batch success, partial failure, retry, and audit recording.
- Auth, role guards, and privileged route access.

## Environment Notes

Integration and full verification require PostgreSQL. `verify:full` calls `ensurePostgres`, runs Prisma generation and migration deploy, then runs lint, typecheck, unit tests, integration tests, build, and benchmark smoke.
