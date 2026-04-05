const defaultEnvironment: Record<string, string> = {
  NODE_ENV: "test",
  PORT: "3000",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:55432/ledger_credit_system?schema=public",
  JWT_SECRET: "test-secret-placeholder-123456",
  SUPPORTED_CURRENCIES: "USD",
  BUSINESS_TIMEZONE: "UTC",
  CLOSE_WINDOW_CRON: "0 0 * * *",
  BATCH_SHARD_SIZE: "500",
  BATCH_WORKER_CONCURRENCY: "25",
  SCORE_APPROVE_THRESHOLD: "700",
  SCORE_REJECT_THRESHOLD: "550",
  RATE_LIMIT_MAX: "500",
  RATE_LIMIT_WINDOW_MS: "60000",
  EXTERNAL_RAIL_DEFAULT_PROVIDER: "simulator",
  EXTERNAL_RAIL_CALLBACK_SECRET: "callback-secret",
  EXTERNAL_SIMULATOR_SETTLEMENT_DELAY_MS: "10",
  INTEREST_RATE_BPS: "250",
  AUTH_ACCESS_TTL_SECONDS: "900",
  AUTH_REFRESH_TTL_SECONDS: "604800",
  AUTH_INTERNAL_ISSUER: "ledger-credit-system",
  AUTH_CUSTOMER_AUDIENCE: "customer-api",
  AUTH_OPERATOR_AUDIENCE: "ops-api"
};

export function ensureTestEnvironment(): void {
  for (const [key, value] of Object.entries(defaultEnvironment)) {
    process.env[key] ??= value;
  }
}
