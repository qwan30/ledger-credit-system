# Environment Variables

Values are sourced from `.env.example`. Replace demo values outside local development.

| Variable | Purpose |
|---|---|
| `PORT` | Backend HTTP port |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Internal JWT signing secret |
| `SUPPORTED_CURRENCIES` | Comma-separated supported currency list |
| `BUSINESS_TIMEZONE` | Business time zone |
| `CLOSE_WINDOW_CRON` | Batch close schedule |
| `BATCH_SHARD_SIZE` | Batch chunk size |
| `BATCH_WORKER_CONCURRENCY` | Batch worker concurrency |
| `SCORE_APPROVE_THRESHOLD` | Credit auto/approval threshold input |
| `SCORE_REJECT_THRESHOLD` | Credit rejection threshold input |
| `RATE_LIMIT_MAX` | Fastify rate limit max requests |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window |
| `EXTERNAL_RAIL_DEFAULT_PROVIDER` | Default rail provider |
| `EXTERNAL_RAIL_CALLBACK_SECRET` | Provider callback shared secret |
| `EXTERNAL_SIMULATOR_SETTLEMENT_DELAY_MS` | Simulator settlement delay |
| `INTEREST_RATE_BPS` | Batch interest rate in basis points |
| `AUTH_ACCESS_TTL_SECONDS` | Access token lifetime |
| `AUTH_REFRESH_TTL_SECONDS` | Refresh token lifetime |
| `AUTH_INTERNAL_ISSUER` | Internal auth issuer |
| `AUTH_CUSTOMER_AUDIENCE` | Customer API audience |
| `AUTH_OPERATOR_AUDIENCE` | Operator API audience |
| `AUTH_OIDC_ISSUER` | Optional OIDC issuer |
| `AUTH_OIDC_JWKS_URI` | Optional OIDC JWKS URI |
| `AUTH_OIDC_AUDIENCE` | Optional OIDC audience |
