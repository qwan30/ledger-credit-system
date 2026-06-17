# Runtime Operations

## Startup

1. Start PostgreSQL.
2. Configure `.env` from `.env.example`.
3. Generate Prisma client.
4. Apply migrations.
5. Seed local demo data if needed.
6. Start the NestJS backend.

## Probes

| Probe | URL |
|---|---|
| Liveness | `/api/v1/health/live` |
| Readiness | `/api/v1/health/ready` |

## Logs And Correlation

Requests receive or generate `X-Correlation-Id`. Pino redacts authorization, cookie, and set-cookie headers.

## Batch Operations

`BatchService` registers `end-of-day-interest-close.run` and schedules it using `CLOSE_WINDOW_CRON`. Operators can retry failed items through the ops retry route.

## Rail Events

External rail callbacks should include provider context and satisfy callback-secret expectations. Inspect transfer events through the ops external-events route.

## Audit Search

Use `GET /api/v1/ops/audit-events` with filters for resource, correlation, idempotency key, and limit.
