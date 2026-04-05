import "reflect-metadata";

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { NestFactory } from "@nestjs/core";
import { PrismaClient } from "@prisma/client";

import { seedBaseData } from "../prisma/seed-data";
import { ensurePostgres } from "./lib/ensure-postgres";

const prisma = new PrismaClient();

function ensureBenchmarkEnvironment(): void {
  process.env.NODE_ENV ??= "test";
  process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:55432/ledger_credit_system?schema=public";
  process.env.JWT_SECRET ??= "benchmark-secret-placeholder-123456";
  process.env.SUPPORTED_CURRENCIES ??= "USD";
  process.env.BUSINESS_TIMEZONE ??= "UTC";
  process.env.CLOSE_WINDOW_CRON ??= "0 0 * * *";
  process.env.BATCH_SHARD_SIZE ??= "500";
  process.env.BATCH_WORKER_CONCURRENCY ??= "25";
  process.env.SCORE_APPROVE_THRESHOLD ??= "700";
  process.env.SCORE_REJECT_THRESHOLD ??= "550";
  process.env.RATE_LIMIT_MAX ??= "100";
  process.env.RATE_LIMIT_WINDOW_MS ??= "60000";
  process.env.EXTERNAL_SIMULATOR_SETTLEMENT_DELAY_MS ??= "10";
  process.env.INTEREST_RATE_BPS ??= "250";
  process.env.AUTH_ACCESS_TTL_SECONDS ??= "900";
  process.env.AUTH_REFRESH_TTL_SECONDS ??= "604800";
  process.env.AUTH_INTERNAL_ISSUER ??= "ledger-credit-system";
  process.env.AUTH_CUSTOMER_AUDIENCE ??= "customer-api";
  process.env.AUTH_OPERATOR_AUDIENCE ??= "ops-api";
}

function getAccountTarget(): number {
  const rawTarget = process.env.BENCHMARK_ACCOUNT_COUNT ?? process.argv[2] ?? "100000";
  const parsedTarget = Number(rawTarget);

  if (!Number.isInteger(parsedTarget) || parsedTarget <= 0) {
    throw new Error(`Invalid benchmark account target: ${rawTarget}`);
  }

  return parsedTarget;
}

async function seedBenchmarkAccounts(targetActiveAccounts: number): Promise<void> {
  await seedBaseData(prisma);

  const existingAccounts = await prisma.account.count({
    where: {
      status: "ACTIVE"
    }
  });

  const accountsToCreate = Math.max(0, targetActiveAccounts - existingAccounts);
  const chunkSize = 2_000;

  for (let offset = 0; offset < accountsToCreate; offset += chunkSize) {
    const currentChunkSize = Math.min(chunkSize, accountsToCreate - offset);

    const customers = Array.from({ length: currentChunkSize }, (_, index) => ({
      id: crypto.randomUUID(),
      externalRef: `bench-customer-${existingAccounts + offset + index}`,
      status: "ACTIVE"
    }));

    const accounts = customers.map((customer) => ({
      id: crypto.randomUUID(),
      customerId: customer.id,
      type: "CHECKING",
      currency: "USD",
      status: "ACTIVE" as const
    }));

    const ledgerAccounts = accounts.map((account) => ({
      id: crypto.randomUUID(),
      accountId: account.id,
      category: "CUSTOMER" as const,
      currency: "USD",
      normalBalanceDirection: "CREDIT" as const
    }));

    const balanceProjections = accounts.map((account, index) => ({
      accountId: account.id,
      currency: "USD",
      currentMinor: BigInt(100_000 + ((offset + index) % 10_000))
    }));

    await prisma.$transaction(async (tx) => {
      await tx.customer.createMany({
        data: customers
      });

      await tx.account.createMany({
        data: accounts
      });

      await tx.ledgerAccount.createMany({
        data: ledgerAccounts
      });

      await tx.balanceProjection.createMany({
        data: balanceProjections
      });
    });
  }
}

async function main() {
  ensureBenchmarkEnvironment();
  await ensurePostgres({
    cwd: process.cwd(),
    databaseUrl: process.env.DATABASE_URL
  });
  const targetActiveAccounts = getAccountTarget();
  await seedBenchmarkAccounts(targetActiveAccounts);

  const { AppModule } = await import("../src/app.module");
  const { BatchService } = await import("../src/modules/batch/batch.service");
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false
  });

  try {
    const batchService = app.get(BatchService);
    const startedAt = Date.now();
    const batchRunId = await batchService.runBatch("benchmark-runner");
    const completedAt = Date.now();

    const batchRun = await prisma.batchRun.findUniqueOrThrow({
      where: {
        id: batchRunId
      }
    });

    const report = {
      generatedAt: new Date().toISOString(),
      targetActiveAccounts,
      durationMs: completedAt - startedAt,
      durationSeconds: Number(((completedAt - startedAt) / 1000).toFixed(3)),
      batchRunId,
      batchStatus: batchRun.status,
      processedCount: batchRun.processedCount,
      successCount: batchRun.successCount,
      failureCount: batchRun.failureCount,
      metTarget: completedAt - startedAt <= 5 * 60 * 1000
    };

    const outputDir = join(process.cwd(), "artifacts", "benchmark");
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, "batch-benchmark.json");
    writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await app.close();
    await prisma.$disconnect();
  }
}

void main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
