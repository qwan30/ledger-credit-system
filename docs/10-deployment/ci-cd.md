# CI And Delivery

## Current Workflow

`.github/workflows/ci.yml` defines one workflow with four jobs.

| Job | Runtime | Main commands |
|---|---|---|
| `legacy-build-test` | Node 22, PostgreSQL 17 service | `npm ci`, `npm run verify:full` |
| `contracts` | Node 22 | `npm ci`, `npm run contracts:check` |
| `api-java` | Java 21 | `mvn -f apps/api-java/pom.xml test` |
| `web` | Node 22 | contracts generate, web typecheck, lint, test, build |

## Delivery Caveat

No automated delivery workflow is present in the repository. Treat deployment as manual or environment-specific until source adds a delivery workflow and supporting evidence.
