# Runtime Operations

This service is meant for production-grade runtimes that expect deterministic financial behavior. Follow these run loops when managing staging or production instances.

## Build and Deployment

1. Build the TypeScript bundle via `npm run build` (triggered inside the multi-stage Docker builder).
2. Push the resulting image to your artifact registry.
3. Ensure the image tag includes a Git SHA or semantic version and, if possible, `NODE_ENV=production`.

## Configuration

- Mount secrets for `DATABASE_URL`, `JWT_SECRET`, and other `AUTH_*` settings via your secrets manager.
- Mount config maps or use a centralized configuration system for policy flags such as `SUPPORTED_CURRENCIES`, `RATE_LIMIT_MAX`, `CLOSE_WINDOW_CRON`, `BATCH_SHARD_SIZE`, and `BATCH_WORKER_CONCURRENCY`.
- Provide read-only access to the `prisma` directory if `prisma migrate` or `prisma generate` runs in a separate job.

## Startup and Probes

- The container launches with `node dist/src/main.js`.
- Attach a readiness probe to `/api/v1/health/ready`.
- Attach a liveness probe to `/api/v1/health/live`.

## Scaling

- Horizontal scale should align with database connection caps; keep `max_connections` usage in check and pair with PgBouncer if PostgreSQL does not auto-scale.
- Increase replicas during batch windows only if you have enough CPU/IO bandwidth and can isolate the batch job to dedicated pods.

## Logging and Metrics

- Logs are emitted in `pino` JSON to stdout. Standardize log ingestion (Fluent Bit, Vector, etc.) and route traces to your observability platform.
- Encourage correlation IDs across request intake, batch runs, and ledger writes for auditability.
- Expose custom metrics (if configured) via whichever exporter your environment uses (not included in this template).

## Maintenance

- Roll updates by draining nodes and letting readiness probes stabilize before killing pods.
- Use `kubectl rollout history` (or equivalent) to inspect past revisions before applying new secrets or config maps.
- If you need to run a one-off migration/seed, use the `prisma/seed.ts` script inside a debug pod with the same image.
- For local or CI verification, prefer `npm run verify:full`; it can bootstrap Docker-backed PostgreSQL before running lint, typecheck, tests, build, and the smoke benchmark.
