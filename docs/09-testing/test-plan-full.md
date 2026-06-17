# Full Test Plan

Commands are sourced from `package.json`.

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run contracts:check
npm run web:typecheck
npm run web:lint
npm run web:test
npm run java:test
npm run verify:full
```

## Additional Useful Commands

```powershell
npm run build
npm run test:cov
npm run benchmark:batch:smoke
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
```

## `verify:full` Sequence

`scripts/verify-full.ts` sets default test environment variables, ensures PostgreSQL, runs Prisma generate, applies migrations, then runs lint, typecheck, unit tests, integration tests, build, and batch benchmark smoke.
