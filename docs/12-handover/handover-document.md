# Handover Document

## Current System State

Ledger Credit System currently contains a NestJS/Fastify backend, Prisma/PostgreSQL schema and migrations, minimal Next.js workspace, OpenAPI contract workspace, Java health skeleton, CI workflow, and source-backed documentation refresh.

## Code Anchors

| Area | Source |
|---|---|
| Runtime setup | `src/bootstrap.ts`, `src/app.module.ts` |
| Auth | `src/common/auth/*`, `src/modules/auth/*` |
| Ledger | `src/modules/ledger/ledger.service.ts` |
| Transfers | `src/modules/transfers/*` |
| Credit | `src/modules/credit/*` |
| Batch | `src/modules/batch/*` |
| Ops | `src/modules/ops/ops.controller.ts` |
| Database | `prisma/schema.prisma`, `prisma/migrations/*` |

## Documentation Map

Use `docs/README.md` as the canonical index. Legacy flat docs are archived after the refresh completes.

## Risks

- No deployment target proof.
- Simulator/mock-bank rails only.
- CI/Docker Node version mismatch.
- CORS defaults need environment hardening.
- Web workspace is minimal.
