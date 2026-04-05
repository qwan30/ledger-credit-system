import { execSync } from "node:child_process";

import { ensurePostgres } from "./lib/ensure-postgres";

const defaultEnvironment: Record<string, string> = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:55432/ledger_credit_system?schema=public",
  JWT_SECRET: "verify-full-secret-123456",
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

function ensureDefaults(): void {
  for (const [key, value] of Object.entries(defaultEnvironment)) {
    process.env[key] ??= value;
  }
}

function runStep(name: string, command: string): void {
  console.log(`\n==> ${name}`);
  execSync(command, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  });
}

async function main(): Promise<void> {
  ensureDefaults();
  await ensurePostgres({
    cwd: process.cwd(),
    databaseUrl: process.env.DATABASE_URL
  });

  runStep("Prisma generate", "npm run prisma:generate");
  runStep("Prisma migrate deploy", "npx prisma migrate deploy");
  runStep("Lint", "npm run lint");
  runStep("Typecheck", "npm run typecheck");
  runStep("Unit tests", "npm run test:unit");
  runStep("Integration tests", "npm run test:integration");
  runStep("Build", "npm run build");
  runStep("Batch benchmark smoke", "npm run benchmark:batch:smoke");
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
