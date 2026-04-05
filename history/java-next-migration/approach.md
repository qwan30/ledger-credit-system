# Approach: Java + Next.js Migration

## Recommended Strategy

- Keep the repository as a transitional monorepo:
  - legacy NestJS backend remains at repo root
  - new Spring Boot backend lives in `apps/api-java`
  - new Next.js portal lives in `apps/web`
  - frozen contract artifacts live in `packages/api-contracts`
- Preserve PostgreSQL schema and auth semantics first.
- Replace infrastructure in layers:
  - contract and repo foundation
  - Java platform and auth
  - Java finance domains
  - Next.js shell and customer experience
  - portal query APIs and operator surfaces
  - deployment split and route-group cutover

## Technology Decisions

- Backend:
  - Java 21
  - Spring Boot 3 MVC
  - Maven
  - Spring Security
  - Flyway
  - JobRunr with PostgreSQL storage
  - springdoc-openapi
- Frontend:
  - Next.js App Router
  - React + TypeScript
  - Tailwind CSS
  - shadcn/ui
  - server-side BFF pattern
- Contracts:
  - hand-maintained OpenAPI freeze in `packages/api-contracts/openapi/openapi.yaml`
  - generated TypeScript types from the frozen contract

## Risk Map

| Area | Risk | Reason | Mitigation |
| --- | --- | --- | --- |
| Auth parity | High | token rotation and audience rules must remain exact | preserve contract first, add explicit tests before implementation |
| Transfer parity | High | money movement, idempotency, and compensation are correctness-critical | port with tests-first and contract smoke coverage |
| Batch parity | Medium | recurring jobs and bulk posting behavior change infrastructure | map to JobRunr with deterministic tests |
| Web portal | Medium | new app with role-segmented flows | keep BFF thin and build on typed API client |
| Cutover | High | two backends share one database during transition | one writer per capability after cutover, route-group rollout |
