# Deployment Environment

## Overview

This NestJS backend is designed to run as a long-lived stateless service that talks to a single PostgreSQL database, enforces idempotent ledger operations, and schedules nightly batch jobs. Production deployments must expose:

- A REST/gRPC port (default `3000`, match `PORT`), bound to a load balancer or ingress.
- A PostgreSQL-compatible database (multi-az or cloud-managed) with `DATABASE_URL`.
- Secure JWT/OIDC secrets so operators and customers get bounded TTL tokens.
- Observability via structured logs to stdout and health probes on `/api/v1/health/live` and `/api/v1/health/ready`.

## Required Environment Variables

| Name | Purpose | Notes |
| --- | --- | --- |
| `PORT` | HTTP listener port | Default `3000` |
| `DATABASE_URL` | Postgres connection string | Use TLS if supported by the provider. |
| `JWT_SECRET` | Symmetric signing key | Rotate regularly; store in a secrets vault. |
| `SUPPORTED_CURRENCIES` | Comma-separated currencies | Controls which ledgers accept debit/credit lines. |
| `BUSINESS_TIMEZONE` | Timezone for batch windows | Defaults to `UTC`. |
| `CLOSE_WINDOW_CRON` | Cron for close/batch job | `0 0 * * *` as baseline; adapt for business hours. |
| `BATCH_SHARD_SIZE` | Batch chunking size | Keep below 5,000 for predictable memory. |
| `BATCH_WORKER_CONCURRENCY` | Parallel workers for fallback item processing | `25` is the tuned default in this repository. |
| `SCORE_APPROVE_THRESHOLD` | Credit approval score floor | `700` recommended; matches config. |
| `SCORE_REJECT_THRESHOLD` | Credit rejection threshold | `550` baseline. |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | Request-limiting policy | Applies to token endpoints; mimic production guardrails. |
| `EXTERNAL_RAIL_DEFAULT_PROVIDER` | Default outbound rail adapter | Defaults to `simulator`; callers may override per transfer. |
| `EXTERNAL_RAIL_CALLBACK_SECRET` | Shared callback secret for configured rail adapters | Rotate like other secrets. |
| `EXTERNAL_SIMULATOR_SETTLEMENT_DELAY_MS` | Simulated settlement latency | Lower values for tests, higher for staging. |
| `INTEREST_RATE_BPS` | Overnight interest rate in basis points | Used for accrual processes. |
| `AUTH_*` | Authentication metadata (ISSUER/AUDIENCE/TTL) | `AUTH_ACCESS_TTL_SECONDS`, `AUTH_REFRESH_TTL_SECONDS`, `AUTH_INTERNAL_ISSUER`, `AUTH_CUSTOMER_AUDIENCE`, `AUTH_OPERATOR_AUDIENCE`, `AUTH_OIDC_*` |

Keep sensitive variables in a secrets manager and reference them through mounted secrets or environment providers (Kubernetes Secret, Vault agent, AWS Parameter Store, etc.). Non-sensitive configuration belongs in config maps or static JSON.

## Infrastructure Notes

- **Database**: Postgres 14+ with WAL archiving enabled for backup/restore automation. Enable connection pooling (PgBouncer) in front of the service to prevent storming during bursty batch jobs.
- **Task Scheduling**: The batch/close runner (`CLOSE_WINDOW_CRON`) should run on a node with sufficient CPU for chunked processing. Tune `BATCH_SHARD_SIZE` and `BATCH_WORKER_CONCURRENCY` together, and consider a dedicated worker pool if cluster autoscaling is enabled.
- **Logging**: Uses `pino` in structured JSON by default. Configure Fluent Bit/Vector to read stdout and forward to your observability stack (Elastic, Splunk, DataDog). Ensure logs include `correlationId` and `actorId`.
- **Secrets**: Rotate `JWT_SECRET` and OIDC secrets at least quarterly. Store `DATABASE_URL` credentials in a vault and avoid injecting raw credentials into logs or release artifacts.

## Health and Readiness

Deployments should wire probes to:

- readiness: `/api/v1/health/ready`
- liveness: `/api/v1/health/live`

## Runtime Build Notes

Use the multi-stage `Dockerfile` in the repository: build stage compiles TypeScript (`npm run build`) and the runtime stage installs only production dependencies (`npm ci --omit=dev`). The image exposes port `3000` and runs `node dist/src/main.js`.
