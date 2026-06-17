# Developer Onboarding

## Prerequisites

- Node.js 22 for parity with CI.
- npm.
- Docker for local PostgreSQL and `verify:full`.
- Java 21 and Maven for `apps/api-java`.

## Setup

```powershell
npm ci
docker compose up -d postgres
Copy-Item .env.example .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run start:dev
```

## Read First

1. `README.md`
2. `docs/README.md`
3. `docs/reference/repository-status.md`
4. `docs/04-architecture/architecture.md`
5. `docs/05-api/api-contract.md`
6. `docs/06-database/db-schema.md`

## Verification

Start with:

```powershell
npm run typecheck
npm run test:unit
npm run contracts:check
```

Run broader checks when Docker and Java are available.
