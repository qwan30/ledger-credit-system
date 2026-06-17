# Tech Stack

| Area | Version or tool | Evidence |
|---|---|---|
| Language | TypeScript 5.8.3 | `package.json` |
| Backend framework | NestJS 11.1.x | `package.json` |
| HTTP adapter | Fastify via `@nestjs/platform-fastify` | `package.json` |
| ORM | Prisma 6.6.0 | `package.json` |
| Database | PostgreSQL 17 local/CI service | `docker-compose.yml`, `.github/workflows/ci.yml` |
| Validation | zod 3.24.3 | `package.json` |
| Logging | pino, nestjs-pino | `package.json`, `src/app.module.ts` |
| Auth helpers | `@nestjs/jwt`, `jose` | `package.json` |
| Tests | Vitest 3.1.1, Supertest | `package.json` |
| Contracts | OpenAPI contract workspace | `packages/api-contracts` |
| Web | Next.js workspace under `apps/web` | `package.json` workspaces |
| Java skeleton | Java 21 CI job, Maven Spring Boot app | `.github/workflows/ci.yml`, `apps/api-java` |
| CI Node | Node 22 | `.github/workflows/ci.yml` |
| Docker backend runner | Node 20 alpine | `Dockerfile` |

## Compatibility Note

CI uses Node 22 while the backend Dockerfile uses Node 20. Treat this as an explicit compatibility item for release hardening.
