# Project Evidence Sheet

| Claim | Status | Evidence | Caveat |
|---|---|---|---|
| NestJS/Fastify backend exists | VERIFIED | `src/app.module.ts`, `src/bootstrap.ts` | None |
| API prefix is `/api/v1` | VERIFIED | `src/bootstrap.ts` | None |
| Swagger is served at `/docs` | VERIFIED | `src/bootstrap.ts` | None |
| Prisma schema has 21 models and 15 enums | VERIFIED | `prisma/schema.prisma` | Refresh after schema changes |
| GitNexus graph was refreshed | VERIFIED | `docs/reference/gitnexus-codebase-scan.md` | Docs commits can make index stale until rerun |
| Transfer creation is idempotent | VERIFIED | `TransfersService.createTransfer`, `IdempotencyRecord` | Verify tests after behavior changes |
| Ledger postings are append-only journal/posting records | VERIFIED | `LedgerService`, `JournalEntry`, `Posting` | Projections are read models |
| Credit assessments include snapshots and review state | VERIFIED | `CreditProfileSnapshot`, `CreditAssessment`, `CreditService` | Policy details remain source-defined |
| External rail provider support is production settlement | MISSING | No source proof beyond simulator/mock-bank adapters | Do not claim production settlement |
| Full deployment target exists | MISSING | No automated delivery workflow or deployment config proof | Add deployment evidence before claiming |
| Web workspace is a complete admin console | MISSING | `apps/web/src/app` contains minimal customer pages | Ops/admin UI is not present |
| CI has backend, contracts, Java, and web jobs | VERIFIED | `.github/workflows/ci.yml` | Local environment may still block checks |
