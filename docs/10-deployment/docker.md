# Docker

## Local PostgreSQL

`docker-compose.yml` defines one `postgres` service:

| Setting | Value |
|---|---|
| Image | `postgres:17-alpine` |
| Host port | `${POSTGRES_PORT:-55432}` |
| Database | `ledger_credit_system` |
| User | `postgres` |
| Volume | `postgres-data` |

## Backend Dockerfile

| Stage | Runtime | Purpose |
|---|---|---|
| `builder` | `node:20-alpine` | `npm ci`, copy source, `npm run build` |
| `runner` | `node:20-alpine` | `npm ci --omit=dev`, run `node dist/src/main.js` |

## Compatibility Note

CI uses Node 22, while the Dockerfile uses Node 20. Validate this combination before relying on the container image for release.
